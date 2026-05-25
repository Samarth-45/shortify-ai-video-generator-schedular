"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Film, Loader2 } from "lucide-react";
import type { VideoListItem } from "@/lib/generated-videos-db";
import { VideoCard } from "./video-card";

export function VideosPageContent() {
    const searchParams = useSearchParams();
    const seriesFilter = searchParams.get("series");

    const [videos, setVideos] = useState<VideoListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadVideos = useCallback(async () => {
        setError(null);
        try {
            const res = await fetch("/api/videos", { cache: "no-store" });
            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    typeof payload.error === "string"
                        ? payload.error
                        : "Failed to load videos"
                );
            }

            setVideos(Array.isArray(payload.videos) ? payload.videos : []);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load videos"
            );
            setVideos([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    const hasInProgressVideos = videos.some(
        (video) =>
            video.status === "generating" || video.status === "rendering"
    );

    const displayedVideos = seriesFilter
        ? videos.filter((video) => video.seriesId === seriesFilter)
        : videos;

    useEffect(() => {
        if (!hasInProgressVideos) return;

        const interval = setInterval(() => {
            void loadVideos();
        }, 4000);

        return () => clearInterval(interval);
    }, [hasInProgressVideos, loadVideos]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Generated Videos
                </h1>
                <p className="mt-2 text-gray-500">
                    Manage and view all your generated content.
                </p>
            </div>

            {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading videos…
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedVideos.map((video) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            onRetryStarted={loadVideos}
                            onDeleted={loadVideos}
                        />
                    ))}

                    {displayedVideos.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                            <Film className="mb-3 h-10 w-10 text-gray-300" />
                            <p className="text-sm font-medium text-gray-600">
                                No videos yet
                            </p>
                            <p className="mt-1 max-w-sm text-xs text-gray-400">
                                Generate a video from a series on the dashboard
                                to see it here.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
