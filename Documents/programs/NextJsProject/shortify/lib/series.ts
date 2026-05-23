export type SeriesStatus =
    | "active"
    | "scheduled"
    | "generating"
    | "published"
    | "failed"
    | "cancelled";

export interface SeriesRecord {
    id: string;
    clerkUserId: string;
    niche: string;
    language: string;
    voice: string;
    videoStyle: string;
    backgroundMusic: string[];
    captionStyle: string;
    seriesName: string;
    videoDuration: string;
    platforms: string[];
    publishTime: string;
    status: SeriesStatus;
    createdAt: string;
    updatedAt: string;
}

export type SeriesRow = {
    id: string;
    clerk_user_id: string;
    niche: string;
    language: string;
    voice: string;
    video_style: string;
    background_music: string[];
    caption_style: string;
    series_name: string;
    video_duration: string;
    platforms: string[];
    publish_time: string;
    status: SeriesStatus;
    created_at: string;
    updated_at: string;
};

export function mapSeriesFromDb(row: SeriesRow): SeriesRecord {
    return {
        id: row.id,
        clerkUserId: row.clerk_user_id,
        niche: row.niche,
        language: row.language,
        voice: row.voice,
        videoStyle: row.video_style,
        backgroundMusic: row.background_music ?? [],
        captionStyle: row.caption_style,
        seriesName: row.series_name,
        videoDuration: row.video_duration,
        platforms: row.platforms ?? [],
        publishTime: row.publish_time,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function isSeriesPaused(status: SeriesStatus): boolean {
    return status === "cancelled";
}

export function isSeriesActive(status: SeriesStatus): boolean {
    return status === "active" || status === "scheduled";
}

export interface SeriesFormData {
    niche: string | null;
    language: string | null;
    voice: string | null;
    videoStyle: string | null;
    backgroundMusic: string[];
    captionStyle: string | null;
    seriesName: string;
    videoDuration: string | null;
    platforms: string[];
    publishTime: string | null;
}

export function isCompleteSeriesForm(
    data: Partial<SeriesFormData>
): data is SeriesFormData & {
    niche: string;
    language: string;
    voice: string;
    videoStyle: string;
    captionStyle: string;
    videoDuration: string;
    publishTime: string;
} {
    return (
        !!data.niche &&
        !!data.language &&
        !!data.voice &&
        !!data.videoStyle &&
        Array.isArray(data.backgroundMusic) &&
        data.backgroundMusic.length > 0 &&
        !!data.captionStyle &&
        typeof data.seriesName === "string" &&
        data.seriesName.trim().length > 0 &&
        !!data.videoDuration &&
        Array.isArray(data.platforms) &&
        data.platforms.length > 0 &&
        !!data.publishTime?.trim()
    );
}

export function seriesRecordToFormData(record: SeriesRecord): SeriesFormData {
    return {
        niche: record.niche,
        language: record.language,
        voice: record.voice,
        videoStyle: record.videoStyle,
        backgroundMusic: record.backgroundMusic,
        captionStyle: record.captionStyle,
        seriesName: record.seriesName,
        videoDuration: record.videoDuration,
        platforms: record.platforms,
        publishTime: record.publishTime,
    };
}

export function toSeriesUpdateRow(
    form: SeriesFormData & {
        niche: string;
        language: string;
        voice: string;
        videoStyle: string;
        captionStyle: string;
        videoDuration: string;
        publishTime: string;
    }
) {
    return {
        niche: form.niche,
        language: form.language,
        voice: form.voice,
        video_style: form.videoStyle,
        background_music: form.backgroundMusic,
        caption_style: form.captionStyle,
        series_name: form.seriesName.trim(),
        video_duration: form.videoDuration,
        platforms: form.platforms,
        publish_time: form.publishTime.trim(),
    };
}

export function toSeriesInsertRow(
    clerkUserId: string,
    form: SeriesFormData & {
        niche: string;
        language: string;
        voice: string;
        videoStyle: string;
        captionStyle: string;
        videoDuration: string;
        publishTime: string;
    }
) {
    return {
        clerk_user_id: clerkUserId,
        niche: form.niche,
        language: form.language,
        voice: form.voice,
        video_style: form.videoStyle,
        background_music: form.backgroundMusic,
        caption_style: form.captionStyle,
        series_name: form.seriesName.trim(),
        video_duration: form.videoDuration,
        platforms: form.platforms,
        publish_time: form.publishTime.trim(),
        status: "active" as const,
    };
}
