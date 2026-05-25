import { createAdminClient } from "@/lib/supabase/admin";
import { formatSupabaseError } from "@/lib/supabase/format-error";
import type { GeneratedImagesResult } from "@/lib/video-generation/image-schema";
import { formatNicheForPrompt } from "@/lib/video-generation/script-schema";
import type { GeneratedVideoScript } from "@/lib/video-generation/script-schema";

function formatCategoryLabel(niche: string): string {
    const text = formatNicheForPrompt(niche);
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

export type GeneratedVideoRecord = {
    id: string;
    seriesId: string;
    clerkUserId: string;
    title: string;
    script: string;
    audioUrl: string;
    captionUrl: string | null;
    captionStyle: string;
    durationSeconds: number | null;
    status: string;
    createdAt: string;
};

export type VideoListItem = {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    seriesId: string;
    seriesName: string;
    seriesCategory: string;
    thumbnailUrl: string | null;
    finalVideoUrl: string | null;
    durationSeconds: number | null;
    captionStyle: string;
};

export async function fetchGeneratedVideosForUser(
    clerkUserId: string
): Promise<{ videos: VideoListItem[]; error: string | null }> {
    let supabase;
    try {
        supabase = createAdminClient();
    } catch (err) {
        return {
            videos: [],
            error: err instanceof Error ? err.message : "Database not configured",
        };
    }

    const { data: videos, error } = await supabase
        .from("generated_videos")
        .select(
            "id, title, created_at, updated_at, status, series_id, duration_seconds, caption_style, final_video_url"
        )
        .eq("clerk_user_id", clerkUserId)
        .order("created_at", { ascending: false });

    if (error) {
        return { videos: [], error: error.message };
    }

    if (!videos?.length) {
        return { videos: [], error: null };
    }

    const videoIds = videos.map((v) => v.id as string);
    const seriesIds = [...new Set(videos.map((v) => v.series_id as string))];

    const [{ data: scenes }, { data: seriesRows }] = await Promise.all([
        supabase
            .from("generated_video_scenes")
            .select("video_id, image_url, scene_number")
            .in("video_id", videoIds),
        supabase
            .from("series")
            .select("id, series_name, niche")
            .in("id", seriesIds),
    ]);

    const seriesById = new Map(
        (seriesRows ?? []).map((row) => [
            row.id as string,
            {
                name: row.series_name as string,
                category: formatCategoryLabel(row.niche as string),
            },
        ])
    );

    const firstSceneByVideo = new Map<string, { image_url: string; scene_number: number }>();
    for (const scene of scenes ?? []) {
        const videoId = scene.video_id as string;
        const current = firstSceneByVideo.get(videoId);
        const sceneNumber = scene.scene_number as number;
        if (!current || sceneNumber < current.scene_number) {
            firstSceneByVideo.set(videoId, {
                image_url: scene.image_url as string,
                scene_number: sceneNumber,
            });
        }
    }

    return {
        videos: videos.map((row) => {
            const videoId = row.id as string;
            const seriesId = row.series_id as string;
            const thumb = firstSceneByVideo.get(videoId);

            return {
                id: videoId,
                title: row.title as string,
                createdAt: row.created_at as string,
                updatedAt: row.updated_at as string,
                status: row.status as string,
                seriesId,
                seriesName: seriesById.get(seriesId)?.name ?? "Unknown series",
                seriesCategory:
                    seriesById.get(seriesId)?.category ?? "General",
                thumbnailUrl: thumb?.image_url ?? null,
                finalVideoUrl: (row.final_video_url as string | null) ?? null,
                durationSeconds: row.duration_seconds as number | null,
                captionStyle: row.caption_style as string,
            };
        }),
        error: null,
    };
}

export type SaveGeneratedVideoInput = {
    seriesId: string;
    clerkUserId: string;
    script: GeneratedVideoScript;
    voice: {
        audioUrl: string;
    };
    captions: {
        captionUrl: string;
        captionStyle: string;
        durationSeconds: number;
    };
    images: GeneratedImagesResult;
};

export async function createGeneratingVideoPlaceholder(
    seriesId: string,
    clerkUserId: string,
    series: { seriesName: string; captionStyle: string }
): Promise<string> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("generated_videos")
        .insert({
            series_id: seriesId,
            clerk_user_id: clerkUserId,
            title: `Generating: ${series.seriesName}`,
            script: "",
            audio_url: "",
            caption_style: series.captionStyle,
            status: "generating",
        })
        .select("id")
        .single();

    if (error) {
        throw new Error(formatSupabaseError(error));
    }

    return data.id as string;
}

export async function updateGeneratedVideoStatus(
    videoId: string,
    status: "generating" | "ready" | "rendering" | "failed"
) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("generated_videos")
        .update({ status })
        .eq("id", videoId);

    if (error) {
        throw new Error(formatSupabaseError(error));
    }
}

export type GeneratedVideoRetryRecord = {
    id: string;
    seriesId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
};

export async function fetchGeneratedVideoForRetry(
    videoId: string,
    clerkUserId: string
): Promise<GeneratedVideoRetryRecord | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("generated_videos")
        .select("id, series_id, status, created_at, updated_at")
        .eq("id", videoId)
        .eq("clerk_user_id", clerkUserId)
        .maybeSingle();

    if (error) {
        throw new Error(formatSupabaseError(error));
    }

    if (!data) {
        return null;
    }

    return {
        id: data.id as string,
        seriesId: data.series_id as string,
        status: data.status as string,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
    };
}

/** Clears partial assets and marks the row ready for a new Inngest run. */
export async function resetGeneratedVideoForRetry(
    videoId: string,
    series: { seriesName: string; captionStyle: string }
) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("generated_videos")
        .update({
            title: `Generating: ${series.seriesName}`,
            script: "",
            audio_url: "",
            caption_url: null,
            caption_style: series.captionStyle,
            duration_seconds: null,
            final_video_url: null,
            status: "generating",
        })
        .eq("id", videoId);

    if (error) {
        throw new Error(formatSupabaseError(error));
    }

    await supabase
        .from("generated_video_scenes")
        .delete()
        .eq("video_id", videoId);
}

export async function deleteGeneratedVideoOwnedByUser(
    videoId: string,
    clerkUserId: string
): Promise<{ error: string | null }> {
    const supabase = createAdminClient();

    const { data, error: fetchError } = await supabase
        .from("generated_videos")
        .select("id")
        .eq("id", videoId)
        .eq("clerk_user_id", clerkUserId)
        .maybeSingle();

    if (fetchError) {
        return { error: formatSupabaseError(fetchError) };
    }
    if (!data) {
        return { error: "Video not found" };
    }

    const { error } = await supabase
        .from("generated_videos")
        .delete()
        .eq("id", videoId)
        .eq("clerk_user_id", clerkUserId);

    if (error) {
        return { error: formatSupabaseError(error) };
    }

    return { error: null };
}

export async function fetchGeneratedVideoForDownload(
    videoId: string,
    clerkUserId: string
): Promise<{ title: string; finalVideoUrl: string } | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("generated_videos")
        .select("title, final_video_url, status")
        .eq("id", videoId)
        .eq("clerk_user_id", clerkUserId)
        .maybeSingle();

    if (error) {
        throw new Error(formatSupabaseError(error));
    }

    if (
        !data ||
        data.status !== "ready" ||
        typeof data.final_video_url !== "string" ||
        !data.final_video_url
    ) {
        return null;
    }

    return {
        title: (data.title as string) || "video",
        finalVideoUrl: data.final_video_url,
    };
}

export async function completeGeneratedVideo(
    videoId: string | undefined,
    input: SaveGeneratedVideoInput
): Promise<{ videoId: string; sceneCount: number }> {
    if (!videoId) {
        return saveGeneratedVideoToDatabase(input);
    }

    const supabase = createAdminClient();

    const { error: videoError } = await supabase
        .from("generated_videos")
        .update({
            title: input.script.title,
            script: input.script.script,
            audio_url: input.voice.audioUrl,
            caption_url: input.captions.captionUrl,
            caption_style: input.captions.captionStyle,
            duration_seconds: input.captions.durationSeconds,
            status: "rendering",
        })
        .eq("id", videoId);

    if (videoError) {
        throw new Error(formatSupabaseError(videoError));
    }

    await supabase
        .from("generated_video_scenes")
        .delete()
        .eq("video_id", videoId);

    if (input.images.scenes.length > 0) {
        const { error: scenesError } = await supabase
            .from("generated_video_scenes")
            .insert(
                input.images.scenes.map((scene) => ({
                    video_id: videoId,
                    scene_number: scene.scene,
                    prompt: scene.prompt,
                    image_url: scene.imageUrl,
                }))
            );

        if (scenesError) {
            throw new Error(formatSupabaseError(scenesError));
        }
    }

    return { videoId, sceneCount: input.images.scenes.length };
}

export async function finalizeGeneratedVideo(
    videoId: string,
    finalVideoUrl: string
) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from("generated_videos")
        .update({
            final_video_url: finalVideoUrl,
            status: "ready",
        })
        .eq("id", videoId);

    if (error) {
        throw new Error(formatSupabaseError(error));
    }
}

export async function saveGeneratedVideoToDatabase(
    input: SaveGeneratedVideoInput
): Promise<{ videoId: string; sceneCount: number }> {
    const supabase = createAdminClient();

    const { data: video, error: videoError } = await supabase
        .from("generated_videos")
        .insert({
            series_id: input.seriesId,
            clerk_user_id: input.clerkUserId,
            title: input.script.title,
            script: input.script.script,
            audio_url: input.voice.audioUrl,
            caption_url: input.captions.captionUrl,
            caption_style: input.captions.captionStyle,
            duration_seconds: input.captions.durationSeconds,
            status: "rendering",
        })
        .select("id")
        .single();

    if (videoError) {
        throw new Error(formatSupabaseError(videoError));
    }

    const videoId = video.id as string;

    if (input.images.scenes.length > 0) {
        const { error: scenesError } = await supabase
            .from("generated_video_scenes")
            .insert(
                input.images.scenes.map((scene) => ({
                    video_id: videoId,
                    scene_number: scene.scene,
                    prompt: scene.prompt,
                    image_url: scene.imageUrl,
                }))
            );

        if (scenesError) {
            throw new Error(formatSupabaseError(scenesError));
        }
    }

    return { videoId, sceneCount: input.images.scenes.length };
}

export async function fetchGeneratedVideosForSeries(
    seriesId: string,
    clerkUserId: string
): Promise<{ videos: GeneratedVideoRecord[]; error: string | null }> {
    let supabase;
    try {
        supabase = createAdminClient();
    } catch (err) {
        return {
            videos: [],
            error: err instanceof Error ? err.message : "Database not configured",
        };
    }

    const { data, error } = await supabase
        .from("generated_videos")
        .select(
            "id, series_id, clerk_user_id, title, script, audio_url, caption_url, caption_style, duration_seconds, status, created_at"
        )
        .eq("series_id", seriesId)
        .eq("clerk_user_id", clerkUserId)
        .order("created_at", { ascending: false });

    if (error) {
        return { videos: [], error: error.message };
    }

    return {
        videos: (data ?? []).map((row) => ({
            id: row.id,
            seriesId: row.series_id,
            clerkUserId: row.clerk_user_id,
            title: row.title,
            script: row.script,
            audioUrl: row.audio_url,
            captionUrl: row.caption_url,
            captionStyle: row.caption_style,
            durationSeconds: row.duration_seconds,
            status: row.status,
            createdAt: row.created_at,
        })),
        error: null,
    };
}

export async function fetchGeneratedVideoScenes(videoId: string) {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("generated_video_scenes")
        .select("id, scene_number, prompt, image_url, created_at")
        .eq("video_id", videoId)
        .order("scene_number", { ascending: true });

    if (error) {
        return { scenes: [], error: error.message };
    }

    return {
        scenes: (data ?? []).map((row) => ({
            id: row.id,
            sceneNumber: row.scene_number,
            prompt: row.prompt,
            imageUrl: row.image_url,
            createdAt: row.created_at,
        })),
        error: null,
    };
}
