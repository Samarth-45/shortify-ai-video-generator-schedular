import { inngest } from "@/lib/inngest/client";
import {
    completeGeneratedVideo,
    updateGeneratedVideoStatus,
} from "@/lib/generated-videos-db";
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
        id: "generate-series-video",
        name: "Generate Series Video",
        triggers: { event: "shortify/video.generate" },
        retries: 5,
        onFailure: async ({ event }) => {
            const original = event.data.event;
            const data = await resolveGenerateVideoEventData(
                original.data,
                original.name
            ).catch(() => null);
            if (!data) return;

            await markSeriesAfterGeneration(
                data.seriesId,
                data.clerkUserId,
                "failed"
            );

            if (data.videoId) {
                await updateGeneratedVideoStatus(data.videoId, "failed");
            }
        },
    },
    async ({ event, step }) => {
        const { seriesId, clerkUserId, videoId } = await step.run(
            "resolve-event-data",
            async () =>
                resolveGenerateVideoEventData(event.data, event.name)
        );

        const series = await step.run("fetch-series-from-supabase", async () => {
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
            "generate-video-script-using-ai",
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
            "generate-caption",
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
            "save-to-database",
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

        await step.run("mark-series-active-after-generation", async () => {
            const status = await markSeriesAfterGeneration(
                seriesId,
                clerkUserId,
                "active"
            );
            return { status };
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
        };
    }
);
