"use client";

import { useState } from "react";
import Link from "next/link";
import { useSeriesData } from "./series-data-provider";
import { formatDistanceToNow } from "date-fns";
import {
    MoreVertical,
    Pencil,
    Play,
    Pause,
    Trash2,
    Film,
    Sparkles,
    Loader2,
} from "lucide-react";
import { VideoStyleImage } from "@/components/video-style-image";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getVideoStyleById, getVideoStyleImageBase } from "@/lib/video-style";
import { isSeriesPaused, type SeriesRecord } from "@/lib/series";

interface SeriesCardProps {
    series: SeriesRecord;
}

export function SeriesCard({ series }: SeriesCardProps) {
    const { refresh: refreshSeries } = useSeriesData();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [videosOpen, setVideosOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const style = getVideoStyleById(series.videoStyle);
    const imageBase = getVideoStyleImageBase(series.videoStyle);
    const paused = isSeriesPaused(series.status);
    const editHref = `/dashboard/create?edit=${series.id}`;

    const createdLabel = formatDistanceToNow(new Date(series.createdAt), {
        addSuffix: true,
    });

    async function patchSeries(action: "pause" | "resume") {
        setIsUpdatingStatus(true);
        setError(null);
        try {
            const res = await fetch(`/api/series/${series.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload.error ?? "Failed to update series");
            }
            refreshSeries();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to update series"
            );
        } finally {
            setIsUpdatingStatus(false);
        }
    }

    async function handleDelete() {
        setIsDeleting(true);
        setError(null);
        try {
            const res = await fetch(`/api/series/${series.id}`, {
                method: "DELETE",
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload.error ?? "Failed to delete series");
            }
            setDeleteOpen(false);
            refreshSeries();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete series"
            );
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleGenerate() {
        setIsGenerating(true);
        setError(null);
        try {
            const res = await fetch(`/api/series/${series.id}/generate`, {
                method: "POST",
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(payload.error ?? "Failed to start generation");
            }
            refreshSeries();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to start generation"
            );
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <>
            <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-[9/16] w-full bg-gray-100">
                    <VideoStyleImage
                        basePath={imageBase}
                        label={style?.label ?? series.videoStyle}
                        sizes="(max-width: 640px) 50vw, 280px"
                    />

                    <Link
                        href={editHref}
                        className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md transition-colors hover:bg-white hover:text-violet-700"
                        aria-label={`Edit ${series.seriesName}`}
                    >
                        <Pencil className="h-4 w-4" />
                    </Link>

                    <div className="absolute left-2.5 top-2.5">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md transition-colors hover:bg-white hover:text-gray-900"
                                    aria-label="Series options"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href={editHref}>
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    disabled={isUpdatingStatus}
                                    onClick={() =>
                                        patchSeries(paused ? "resume" : "pause")
                                    }
                                >
                                    {paused ? (
                                        <Play className="h-4 w-4" />
                                    ) : (
                                        <Pause className="h-4 w-4" />
                                    )}
                                    {paused ? "Resume series" : "Pause series"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {series.status === "generating" && (
                        <div className="absolute inset-x-0 bottom-0 bg-violet-600/90 px-3 py-1.5 text-center text-xs font-semibold text-white">
                            Generating…
                        </div>
                    )}
                    {paused && (
                        <div className="absolute inset-x-0 bottom-0 bg-gray-900/75 px-3 py-1.5 text-center text-xs font-semibold text-white">
                            Paused
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-sm font-bold text-gray-900">
                        {series.seriesName}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Created {createdLabel}</p>
                    {style && (
                        <p className="mt-0.5 text-xs text-gray-400">{style.label} style</p>
                    )}

                    {error && (
                        <p className="mt-2 text-xs text-red-600">{error}</p>
                    )}

                    <div className="mt-4 flex flex-col gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full rounded-xl"
                            onClick={() => setVideosOpen(true)}
                        >
                            <Film className="h-4 w-4" />
                            View generated videos
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500"
                            disabled={
                                isGenerating ||
                                series.status === "generating" ||
                                paused
                            }
                            onClick={handleGenerate}
                        >
                            {isGenerating || series.status === "generating" ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generate video
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </article>

            <Dialog open={videosOpen} onOpenChange={setVideosOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{series.seriesName}</DialogTitle>
                        <DialogDescription>
                            Videos generated for this series will appear here.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
                        <Film className="mb-3 h-10 w-10 text-gray-300" />
                        <p className="text-sm font-medium text-gray-600">
                            No videos yet
                        </p>
                        <p className="mt-1 max-w-xs text-xs text-gray-400">
                            Use Generate video to create your first short for this
                            series.
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete series?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes &quot;{series.seriesName}&quot;
                            and cannot be undone.
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
                                handleDelete();
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
