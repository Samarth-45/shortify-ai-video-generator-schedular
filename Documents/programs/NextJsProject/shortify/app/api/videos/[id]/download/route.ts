import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchGeneratedVideoForDownload } from "@/lib/generated-videos-db";

type RouteContext = { params: Promise<{ id: string }> };

function downloadFilename(title: string): string {
    const base = title
        .replace(/^Generating:\s*/i, "")
        .replace(/[^\w\s.-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    return `${base || "shortify-video"}.mp4`;
}

export async function GET(_req: Request, context: RouteContext) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    let video: { title: string; finalVideoUrl: string } | null;
    try {
        video = await fetchGeneratedVideoForDownload(id, userId);
    } catch (err) {
        const message =
            err instanceof Error ? err.message : "Failed to load video";
        return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const upstream = await fetch(video.finalVideoUrl);
    if (!upstream.ok || !upstream.body) {
        return NextResponse.json(
            { error: "Could not fetch video file" },
            { status: 502 }
        );
    }

    const filename = downloadFilename(video.title);
    const contentType =
        upstream.headers.get("content-type") ?? "video/mp4";

    return new NextResponse(upstream.body, {
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "private, no-cache",
        },
    });
}
