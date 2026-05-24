"use client";

import Image from "next/image";
import { format } from "date-fns";
import { Calendar, Clock, Film, Loader2, Play } from "lucide-react";
import type { VideoListItem } from "@/lib/generated-videos-db";

type VideoCardProps = {
    video: VideoListItem;
};

function statusBadgeClass(status: string): string {
    if (status === "ready") {
        return "bg-emerald-500 text-white";
    }
    if (status === "failed") {
        return "bg-red-500 text-white";
    }
    if (status === "generating") {
        return "bg-violet-600 text-white";
    }
    return "bg-violet-500 text-white";
}

function statusBadgeLabel(status: string): string {
    if (status === "ready") return "READY";
    if (status === "rendering") return "RENDERING";
    if (status === "failed") return "FAILED";
    if (status === "generating") return "GENERATING";
    return status.toUpperCase();
}

export function VideoCard({ video }: VideoCardProps) {
    const isGenerating = video.status === "generating";
    const created = new Date(video.createdAt);
    const dateLabel = format(created, "MMM dd, yyyy").toUpperCase();
    const timeLabel = format(created, "hh:mm a");

    const displayTitle = isGenerating
        ? video.title.replace(/^Generating:\s*/i, "") || "New video"
        : video.title;

    return (
        <article
            className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                isGenerating
                    ? "border-violet-200 ring-2 ring-violet-100"
                    : "border-gray-100 hover:border-violet-100 hover:shadow-lg"
            }`}
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                {isGenerating ? (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-50 to-fuchsia-50">
                        <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
                    </div>
                ) : video.thumbnailUrl ? (
                    <Image
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, 320px"
                        unoptimized
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <Film className="h-12 w-12" />
                    </div>
                )}

                <span
                    className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider shadow-md ${statusBadgeClass(video.status)}`}
                >
                    {isGenerating ? (
                        <span className="inline-flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            {statusBadgeLabel(video.status)}
                        </span>
                    ) : (
                        statusBadgeLabel(video.status)
                    )}
                </span>

                {!isGenerating && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/85 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
                            <Play className="ml-1 h-6 w-6 fill-violet-600 text-violet-600" />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                <h3 className="line-clamp-2 text-[1.05rem] font-bold leading-snug text-violet-700">
                    {isGenerating ? "Generating video…" : displayTitle}
                </h3>

                <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Film className="h-4 w-4 shrink-0 text-violet-500" />
                    <span className="line-clamp-1">{video.seriesCategory}</span>
                </p>

                {isGenerating ? (
                    <p className="mt-3 text-xs leading-relaxed text-violet-600/80">
                        Creating script, voiceover, captions, and scene
                        images…
                    </p>
                ) : (
                    <div className="mt-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {dateLabel}
                        </span>
                        <span className="inline-flex items-center gap-1.5 normal-case">
                            <Clock className="h-3.5 w-3.5" />
                            {timeLabel}
                        </span>
                    </div>
                )}
            </div>
        </article>
    );
}
