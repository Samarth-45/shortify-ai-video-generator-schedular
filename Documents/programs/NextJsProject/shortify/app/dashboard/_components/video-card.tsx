"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
    Calendar,
    Clock,
    Download,
    Film,
    Loader2,
    Play,
    RotateCcw,
    Trash2,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { VideoListItem } from "@/lib/generated-videos-db";

const STUCK_IN_PROGRESS_MS = 10 * 60 * 1000;

type VideoCardProps = {
    video: VideoListItem;
    onRetryStarted?: () => void;
    onDeleted?: () => void;
};

function statusBadgeClass(status: string): string {
    if (status === "ready") {
        return "bg-emerald-500 text-white";
    }
    if (status === "failed") {
        return "bg-red-500 text-white";
    }
    if (status === "generating" || status === "rendering") {
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

function stripGeneratingPrefix(title: string): string {
    return title.replace(/^Generating:\s*/i, "").trim() || "New video";
}

export function VideoCard({ video, onRetryStarted, onDeleted }: VideoCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryError, setRetryError] = useState<string | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const isGenerating = video.status === "generating";
    const isRendering = video.status === "rendering";
    const isFailed = video.status === "failed";
    const isInProgress = isGenerating || isRendering;
    const canPlay = video.status === "ready" && Boolean(video.finalVideoUrl);

    const staleMs =
        Date.now() - new Date(video.updatedAt ?? video.createdAt).getTime();
    const isStuckInProgress =
        isInProgress && staleMs >= STUCK_IN_PROGRESS_MS;
    const canRetry = isFailed || isStuckInProgress;

    async function handleDownload() {
        if (!canPlay || isDownloading) return;

        setIsDownloading(true);
        try {
            const res = await fetch(`/api/videos/${video.id}/download`);
            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(
                    typeof payload.error === "string"
                        ? payload.error
                        : "Download failed"
                );
            }

            const blob = await res.blob();
            const disposition = res.headers.get("Content-Disposition") ?? "";
            const match = disposition.match(/filename="([^"]+)"/);
            const filename = match?.[1] ?? "shortify-video.mp4";

            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = filename;
            anchor.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("[video-card] download failed:", err);
        } finally {
            setIsDownloading(false);
        }
    }

    const created = new Date(video.createdAt);
    const dateLabel = format(created, "MMM dd, yyyy").toUpperCase();
    const timeLabel = format(created, "hh:mm a");

    const displayTitle =
        isGenerating || isFailed
            ? stripGeneratingPrefix(video.title)
            : video.title;

    async function handleDelete() {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const res = await fetch(`/api/videos/${video.id}`, {
                method: "DELETE",
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(
                    typeof payload.error === "string"
                        ? payload.error
                        : "Failed to delete video"
                );
            }
            setDeleteOpen(false);
            onDeleted?.();
        } catch (err) {
            setDeleteError(
                err instanceof Error ? err.message : "Failed to delete video"
            );
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleRetry() {
        if (!canRetry || isRetrying) return;

        setIsRetrying(true);
        setRetryError(null);
        try {
            const res = await fetch(`/api/videos/${video.id}/retry`, {
                method: "POST",
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(
                    typeof payload.error === "string"
                        ? payload.error
                        : "Could not restart generation"
                );
            }
            onRetryStarted?.();
        } catch (err) {
            setRetryError(
                err instanceof Error
                    ? err.message
                    : "Could not restart generation"
            );
        } finally {
            setIsRetrying(false);
        }
    }

    const thumbnail = (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
            {isInProgress ? (
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

            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteOpen(true);
                }}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-600 shadow-md transition-colors hover:bg-white hover:text-red-600"
                aria-label={`Delete ${displayTitle}`}
            >
                <Trash2 className="h-4 w-4" />
            </button>

            <span
                className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider shadow-md ${statusBadgeClass(video.status)}`}
            >
                {isInProgress ? (
                    <span className="inline-flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {statusBadgeLabel(video.status)}
                    </span>
                ) : (
                    statusBadgeLabel(video.status)
                )}
            </span>

            {canPlay && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/85 shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
                        <Play className="ml-1 h-6 w-6 fill-violet-600 text-violet-600" />
                    </div>
                </div>
            )}
        </div>
    );

    const body = (
        <>
            <h3 className="line-clamp-2 text-[1.05rem] font-bold leading-snug text-violet-700">
                {isGenerating
                    ? "Generating video…"
                    : isRendering
                      ? "Rendering final video…"
                      : displayTitle}
            </h3>

            <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Film className="h-4 w-4 shrink-0 text-violet-500" />
                <span className="line-clamp-1">{video.seriesCategory}</span>
            </p>

            {isFailed ? (
                <p className="mt-3 text-xs leading-relaxed text-red-600/90">
                    Generation did not finish. Try again to rerun the full
                    pipeline.
                </p>
            ) : isGenerating ? (
                <p className="mt-3 text-xs leading-relaxed text-violet-600/80">
                    Creating script, voiceover, captions, and scene images…
                </p>
            ) : isRendering ? (
                <p className="mt-3 text-xs leading-relaxed text-violet-600/80">
                    Composing scenes, syncing captions with voiceover, and
                    exporting MP4…
                </p>
            ) : (
                <>
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
                    {canPlay && (
                        <button
                            type="button"
                            onClick={() => void handleDownload()}
                            disabled={isDownloading}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            {isDownloading ? "Downloading…" : "Download MP4"}
                        </button>
                    )}
                </>
            )}
            {(canRetry || retryError) && (
                <div className="mt-3 space-y-2">
                    {retryError && (
                        <p className="text-xs text-red-600">{retryError}</p>
                    )}
                    {canRetry && (
                        <button
                            type="button"
                            onClick={() => void handleRetry()}
                            disabled={isRetrying}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isRetrying ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RotateCcw className="h-4 w-4" />
                            )}
                            {isRetrying ? "Starting…" : "Try again"}
                        </button>
                    )}
                </div>
            )}
        </>
    );

    return (
        <>
            <article
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${
                    isFailed
                        ? "border-red-100 hover:border-red-200"
                        : isInProgress
                          ? "border-violet-200 ring-2 ring-violet-100"
                          : "border-gray-100 hover:border-violet-100 hover:shadow-lg"
                }`}
            >
                {canPlay ? (
                    <Link
                        href={video.finalVideoUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                    >
                        {thumbnail}
                    </Link>
                ) : (
                    thumbnail
                )}

                <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
                    {body}
                    {deleteError && (
                        <p className="mt-2 text-xs text-red-600">{deleteError}</p>
                    )}
                </div>
            </article>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete video?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes &quot;{displayTitle}&quot; from
                            your library. The series is not deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                void handleDelete();
                            }}
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
