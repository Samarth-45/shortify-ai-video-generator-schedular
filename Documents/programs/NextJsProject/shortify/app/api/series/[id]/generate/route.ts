import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createGeneratingVideoPlaceholder } from "@/lib/generated-videos-db";
import { inngest } from "@/lib/inngest/client";
import { fetchSeriesById } from "@/lib/series-db";
import { getSeriesOwnedByUser, updateSeriesStatus } from "@/lib/series-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const owned = await getSeriesOwnedByUser(id, userId);
        if (owned.error) {
            return NextResponse.json({ error: owned.error }, { status: 500 });
        }
        if (!owned.data) {
            return NextResponse.json({ error: "Series not found" }, { status: 404 });
        }

        const { series, error: seriesError } = await fetchSeriesById(id, userId);
        if (seriesError) {
            return NextResponse.json({ error: seriesError }, { status: 500 });
        }
        if (!series) {
            return NextResponse.json({ error: "Series not found" }, { status: 404 });
        }

        const result = await updateSeriesStatus(id, userId, "generating");
        if (result.error) {
            const status = result.error === "Series not found" ? 404 : 500;
            return NextResponse.json({ error: result.error }, { status });
        }

        const videoId = await createGeneratingVideoPlaceholder(
            id,
            userId,
            {
                seriesName: series.seriesName,
                captionStyle: series.captionStyle,
            }
        );

        const { ids } = await inngest.send({
            name: "shortify/video.generate",
            data: {
                seriesId: id,
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
        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Database not configured",
            },
            { status: 500 }
        );
    }
}
