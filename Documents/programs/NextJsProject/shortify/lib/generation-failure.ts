import {
    updateGeneratedVideoStatus,
} from "@/lib/generated-videos-db";
import { updateSeriesStatus } from "@/lib/series-api";

export async function markGenerationFailed(
    seriesId: string,
    clerkUserId: string,
    videoId?: string
) {
    const seriesResult = await updateSeriesStatus(
        seriesId,
        clerkUserId,
        "failed"
    );
    if (seriesResult.error) {
        console.error(
            `[markGenerationFailed] series ${seriesId}: ${seriesResult.error}`
        );
    }

    if (videoId) {
        try {
            await updateGeneratedVideoStatus(videoId, "failed");
        } catch (err) {
            console.error(
                `[markGenerationFailed] video ${videoId}:`,
                err instanceof Error ? err.message : err
            );
        }
    }
}

export async function resetStuckGeneration(
    seriesId: string,
    clerkUserId: string
) {
    const result = await updateSeriesStatus(seriesId, clerkUserId, "active");
    if (result.error) {
        throw new Error(result.error);
    }
    return result.status;
}
