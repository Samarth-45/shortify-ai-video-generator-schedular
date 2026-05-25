import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
    fetchGeneratedVideoForRetry,
    resetGeneratedVideoForRetry,
} from "@/lib/generated-videos-db";
import { inngest } from "@/lib/inngest/client";
import { fetchSeriesById } from "@/lib/series-db";
import { getSeriesOwnedByUser, updateSeriesStatus } from "@/lib/series-api";

type RouteContext = { params: Promise<{ id: string }> };

const RETRYABLE_STATUSES = new Set(["failed", "generating", "rendering"]);
/** In-progress runs younger than this are not retried (avoids duplicate jobs). */
const STUCK_IN_PROGRESS_MS = 10 * 60 * 1000;

function isStuckInProgress(video: {
    status: string;
    updatedAt: string;
}): boolean {
    if (video.status !== "generating" && video.status !== "rendering") {
        return false;
    }
    const updated = new Date(video.updatedAt).getTime();
    return Date.now() - updated >= STUCK_IN_PROGRESS_MS;
}

export async function POST(_req: Request, context: RouteContext) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: videoId } = await context.params;

    try {
        const video = await fetchGeneratedVideoForRetry(videoId, userId);
        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        if (!RETRYABLE_STATUSES.has(video.status)) {
            return NextResponse.json(
                { error: "Only failed or stuck videos can be retried" },
                { status: 400 }
            );
        }

        if (
            (video.status === "generating" || video.status === "rendering") &&
            !isStuckInProgress(video)
        ) {
            return NextResponse.json(
                {
                    error:
                        "This video is still generating. Wait a few minutes or try again if it appears stuck.",
                },
                { status: 409 }
            );
        }

        const owned = await getSeriesOwnedByUser(video.seriesId, userId);
        if (owned.error) {
            return NextResponse.json({ error: owned.error }, { status: 500 });
        }
        if (!owned.data) {
            return NextResponse.json({ error: "Series not found" }, { status: 404 });
        }

        const { series, error: seriesError } = await fetchSeriesById(
            video.seriesId,
            userId
        );
        if (seriesError) {
            return NextResponse.json({ error: seriesError }, { status: 500 });
        }
        if (!series) {
            return NextResponse.json({ error: "Series not found" }, { status: 404 });
        }

        await resetGeneratedVideoForRetry(videoId, {
            seriesName: series.seriesName,
            captionStyle: series.captionStyle,
        });

        const statusResult = await updateSeriesStatus(
            video.seriesId,
            userId,
            "generating"
        );
        if (statusResult.error) {
            return NextResponse.json(
                { error: statusResult.error },
                { status: 500 }
            );
        }

        const { ids } = await inngest.send({
            name: "shortify/video.generate",
            data: {
                seriesId: video.seriesId,
                clerkUserId: userId,
                videoId,
            },
        });

        return NextResponse.json({
            status: "generating",
            videoId,
            eventIds: ids,
        });
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Failed to retry generation";
        const causeCode =
            err instanceof Error &&
            err.cause &&
            typeof err.cause === "object" &&
            "code" in err.cause
                ? String((err.cause as { code?: string }).code)
                : "";

        if (
            message.includes("fetch failed") &&
            (causeCode === "ECONNREFUSED" || process.env.INNGEST_DEV === "1")
        ) {
            return NextResponse.json(
                {
                    error:
                        "Inngest dev server is not running. Start it with: npm run dev:inngest",
                },
                { status: 503 }
            );
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
