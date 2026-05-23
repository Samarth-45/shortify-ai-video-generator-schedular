"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Music2, Pause, Play } from "lucide-react";
import { BackgroundMusic } from "../_data/constant";

interface BackgroundMusicSelectionProps {
    selectedTracks: string[];
    onToggleTrack: (trackId: string) => void;
}

function disposeAudio(audio: HTMLAudioElement | null) {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
    audio.onerror = null;
    audio.onpause = null;
    audio.src = "";
    audio.load();
}

export function BackgroundMusicSelection({
    selectedTracks,
    onToggleTrack,
}: BackgroundMusicSelectionProps) {
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const previewSessionRef = useRef(0);

    const stopPreview = () => {
        previewSessionRef.current += 1;
        disposeAudio(audioRef.current);
        audioRef.current = null;
        setPlayingTrackId(null);
    };

    const handlePlayPreview = (trackId: string, url: string) => {
        setPreviewError(null);

        if (playingTrackId === trackId) {
            stopPreview();
            return;
        }

        stopPreview();
        const session = previewSessionRef.current;

        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;

        audio.onended = () => {
            if (previewSessionRef.current !== session) return;
            stopPreview();
        };

        audio.onerror = () => {
            if (previewSessionRef.current !== session) return;
            stopPreview();
            setPreviewError(trackId);
            setTimeout(() => setPreviewError(null), 3000);
        };

        audioRef.current = audio;
        setPlayingTrackId(trackId);

        void audio.play().catch(() => {
            if (previewSessionRef.current !== session) return;
            stopPreview();
            setPreviewError(trackId);
            setTimeout(() => setPreviewError(null), 3000);
        });
    };

    useEffect(() => {
        return () => stopPreview();
    }, []);

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Background Music</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Pick one or more tracks for your series. Preview before selecting.
                </p>
                {selectedTracks.length > 0 && (
                    <p className="mt-2 text-xs font-medium text-violet-600">
                        {selectedTracks.length} track
                        {selectedTracks.length === 1 ? "" : "s"} selected
                    </p>
                )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-50">
                    {BackgroundMusic.map((track, index) => {
                        const isSelected = selectedTracks.includes(track.id);
                        const isPlaying = playingTrackId === track.id;
                        const hasError = previewError === track.id;

                        return (
                            <li key={track.id}>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onToggleTrack(track.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            onToggleTrack(track.id);
                                        }
                                    }}
                                    className={`flex w-full cursor-pointer items-center gap-4 px-4 py-4 text-left transition-all duration-200 sm:px-5
                                        ${isSelected ? "bg-violet-50/80" : "hover:bg-gray-50/80"}`}
                                >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-500">
                                        {index + 1}
                                    </span>

                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                                            ${isSelected ? "bg-violet-100" : "bg-fuchsia-50"}`}
                                    >
                                        <Music2
                                            className={`h-5 w-5 ${isSelected ? "text-violet-600" : "text-fuchsia-500"}`}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p
                                                className={`text-sm font-semibold ${isSelected ? "text-violet-900" : "text-gray-800"}`}
                                            >
                                                {track.title}
                                            </p>
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide
                                                    ${isSelected
                                                        ? "bg-violet-100 text-violet-700"
                                                        : "bg-gray-100 text-gray-500"
                                                    }`}
                                            >
                                                {track.badge}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-xs text-gray-400">
                                            {track.description}
                                        </p>
                                        {hasError && (
                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                Preview unavailable
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePlayPreview(track.id, track.url);
                                        }}
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200
                                            ${hasError
                                                ? "bg-red-100 text-red-500"
                                                : isPlaying
                                                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                        title={isPlaying ? "Pause preview" : "Play preview"}
                                    >
                                        {isPlaying ? (
                                            <Pause className="h-4 w-4" />
                                        ) : (
                                            <Play className="h-4 w-4 ml-0.5" />
                                        )}
                                    </button>

                                    <div
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all
                                            ${isSelected
                                                ? "border-violet-600 bg-violet-600"
                                                : "border-gray-200 bg-white"
                                            }`}
                                    >
                                        {isSelected && (
                                            <Check className="h-3.5 w-3.5 text-white" />
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
