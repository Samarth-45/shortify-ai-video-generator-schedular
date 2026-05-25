import { inngest } from "@/lib/inngest/client";
import {
    completeGeneratedVideo,
    finalizeGeneratedVideo,
} from "@/lib/generated-videos-db";
import { markGenerationFailed } from "@/lib/generation-failure";
import { resolveGenerateVideoEventData } from "@/lib/inngest/events/generate-video";
import { updateSeriesStatus } from "@/lib/series-api";
import { fetchSeriesById } from "@/lib/series-db";
import type { SeriesRecord } from "@/lib/series";
import { generateCaptionsForVoiceover } from "@/lib/video-generation/generate-captions";
import { generateImagesFromScript } from "@/lib/video-generation/generate-images";
import type { GeneratedSceneImage } from "@/lib/video-generation/image-schema";
import { generateVideoScriptWithGemini } from "@/lib/video-generation/generate-script";
import { generateVoiceoverForScript } from "@/lib/video-generation/generate-voice";
import type { GeneratedVideoScript } from "@/lib/video-generation/script-schema";
import type { VoiceProvider } from "@/lib/voice-config";
import { sendVideoReadyNotification } from "@/lib/email/send-video-ready-notification";
import {
    startFinalVideoRender,
    waitForFinalVideoRender,
} from "@/lib/video-generation/remotion/compose-final-video";
import type { RenderJob } from "@/lib/video-generation/remotion/render-final-video";

export type { GenerateVideoEventData } from "@/lib/inngest/events/generate-video";

export type VideoScriptResult = GeneratedVideoScript;

export type VideoVoiceResult = {
    audioUrl: string;
    voiceModel: string;
    provider: VoiceProvider;
    language: string;
    byteLength: number;
};

export type VideoCaptionResult = {
    captionStyle: string;
    captionUrl: string;
    durationSeconds: number;
    cueCount: number;
};

export type VideoImagesResult = {
    scenes: GeneratedSceneImage[];
};

export type VideoSaveResult = {
    saved: boolean;
    videoId: string;
    sceneCount: number;
};

export type VideoRenderJobResult = RenderJob;

export type VideoRenderWaitResult = {
    finalVideoUrl: string;
};

export type VideoFinalizeResult = {
    finalVideoUrl: string;
    videoId: string;
};

export type VideoEmailNotificationResult = {
    sent: boolean;
    skippedReason?: string;
};

async function markSeriesAfterGeneration(
    seriesId: string,
    clerkUserId: string,
    status: "active" | "failed"
) {
    const result = await updateSeriesStatus(seriesId, clerkUserId, status);
    if (result.error) {
        throw new Error(result.error);
    }
    return result.status;
}

export const generateSeriesVideo = inngest.createFunction(
    {
        id: "video-generate",
        name: "video/generate",
        triggers: { event: "shortify/video.generate" },
        retries: 2,
        timeouts: {
            finish: "45m",
        },
        onFailure: async ({ event, error }) => {
            console.error("[video/generate] run failed:", error);

            try {
                const original = event.data?.event as
                    | { name?: string; data?: unknown }
                    | undefined;
                const data = await resolveGenerateVideoEventData(
                    original?.data ?? event.data,
                    original?.name
                ).catch(() => null);

                if (!data) {
                    console.error(
                        "[video/generate] onFailure: could not parse event payload"
                    );
                    return;
                }

                await markGenerationFailed(
                    data.seriesId,
                    data.clerkUserId,
                    data.videoId
                );
            } catch (cleanupErr) {
                console.error(
                    "[video/generate] onFailure cleanup error:",
                    cleanupErr
                );
            }
        },
    },
    async ({ event, step }) => {
        const { seriesId, clerkUserId, videoId } = await step.run(
            "resolve-event-data",
            async () =>
                resolveGenerateVideoEventData(event.data, event.name)
        );

        const series = await step.run("fetch-series-data", async () => {
            const { series: record, error } = await fetchSeriesById(
                seriesId,
                clerkUserId
            );

            if (error) {
                throw new Error(`Failed to fetch series: ${error}`);
            }

            if (!record) {
                throw new Error(`Series not found: ${seriesId}`);
            }

            return record satisfies SeriesRecord;
        });

        const scriptResult = await step.run(
            "generate-video-script",
            async (): Promise<VideoScriptResult> => {
                return generateVideoScriptWithGemini(series);
            }
        );

        const voiceResult = await step.run(
            "generate-voice",
            async (): Promise<VideoVoiceResult> => {
                const voiceover = await generateVoiceoverForScript(
                    series,
                    scriptResult.script
                );
                return {
                    audioUrl: voiceover.audioUrl,
                    voiceModel: voiceover.voiceModel,
                    provider: voiceover.provider,
                    language: voiceover.language,
                    byteLength: voiceover.byteLength,
                };
            }
        );

        const captionResult = await step.run(
            "generate-captions",
            async (): Promise<VideoCaptionResult> => {
                const captions = await generateCaptionsForVoiceover(
                    series,
                    scriptResult.script,
                    voiceResult.audioUrl,
                    voiceResult.byteLength
                );
                return {
                    captionStyle: captions.styleId,
                    captionUrl: captions.captionUrl,
                    durationSeconds: captions.durationSeconds,
                    cueCount: captions.cues.length,
                };
            }
        );

        const imagesResult = await step.run(
            "generate-images",
            async (): Promise<VideoImagesResult> => {
                return generateImagesFromScript(series, scriptResult);
            }
        );

        const saveResult = await step.run(
            "save-initial-assets",
            async (): Promise<VideoSaveResult> => {
                const saved = await completeGeneratedVideo(videoId, {
                    seriesId,
                    clerkUserId,
                    script: scriptResult,
                    voice: voiceResult,
                    captions: captionResult,
                    images: imagesResult,
                });
                return {
                    saved: true,
                    videoId: saved.videoId,
                    sceneCount: saved.sceneCount,
                };
            }
        );

        const renderJob = await step.run(
            "render-video",
            async (): Promise<VideoRenderJobResult> => {
                return startFinalVideoRender({
                    seriesId,
                    audioUrl: voiceResult.audioUrl,
                    captionUrl: captionResult.captionUrl,
                    captionStyleId: captionResult.captionStyle,
                    durationSeconds: captionResult.durationSeconds,
                    scenes: imagesResult.scenes,
                });
            }
        );

        const renderWaitResult = await step.run(
            "wait-for-render",
            async (): Promise<VideoRenderWaitResult> => {
                const finalVideoUrl = await waitForFinalVideoRender(renderJob);
                return { finalVideoUrl };
            }
        );

        const finalizeResult = await step.run(
            "finalize-video",
            async (): Promise<VideoFinalizeResult> => {
                await finalizeGeneratedVideo(
                    saveResult.videoId,
                    renderWaitResult.finalVideoUrl
                );
                return {
                    finalVideoUrl: renderWaitResult.finalVideoUrl,
                    videoId: saveResult.videoId,
                };
            }
        );

        const emailResult = await step.run(
            "send-email-notification",
            async (): Promise<VideoEmailNotificationResult> => {
                try {
                    const thumbnailUrl =
                        imagesResult.scenes[0]?.imageUrl ?? null;

                    return await sendVideoReadyNotification({
                        clerkUserId,
                        videoId: saveResult.videoId,
                        seriesId,
                        videoTitle: scriptResult.title,
                        seriesName: series.seriesName,
                        niche: series.niche,
                        durationSeconds: captionResult.durationSeconds,
                        thumbnailUrl,
                        finalVideoUrl: renderWaitResult.finalVideoUrl,
                    });
                } catch (err) {
                    console.error(
                        "[video/generate] email notification failed:",
                        err
                    );
                    return {
                        sent: false,
                        skippedReason:
                            err instanceof Error ? err.message : "Email failed",
                    };
                }
            }
        );

        await step.run("Finalization", async () => {
            const status = await markSeriesAfterGeneration(
                seriesId,
                clerkUserId,
                "active"
            );
            return { status, ok: true };
        });

        return {
            ok: true,
            seriesId: series.id,
            seriesName: series.seriesName,
            scriptResult,
            voiceResult,
            captionResult,
            imagesResult,
            saveResult,
            finalizeResult,
            emailResult,
        };
    }
);
