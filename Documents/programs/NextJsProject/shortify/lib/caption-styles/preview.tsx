"use client";

import { cn } from "@/lib/utils";
import type { CaptionStyleDefinition } from "./types";

interface CaptionStylePreviewProps {
    style: CaptionStyleDefinition;
    className?: string;
}

export function CaptionStylePreview({ style, className }: CaptionStylePreviewProps) {
    const isTypewriter = style.id === "typewriter";

    return (
        <div
            className={cn(
                "relative flex aspect-[9/16] w-full items-end justify-center overflow-hidden rounded-xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-3",
                className
            )}
        >
            {/* Fake video frame accents */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(124,58,237,0.15),transparent_60%)]" />

            <div
                className={cn(
                    "caption-preview-root relative z-10 mb-6 w-full text-center",
                    style.previewClass
                )}
            >
                {isTypewriter ? (
                    <p className="caption-typewriter-line mx-auto inline-block text-sm font-semibold tracking-tight">
                        {style.previewWords[0]}
                    </p>
                ) : (
                    <p className="flex flex-wrap items-center justify-center gap-1.5">
                        {style.previewWords.map((word, i) => (
                            <span
                                key={`${style.id}-${word}-${i}`}
                                className="caption-preview-word text-sm font-bold leading-tight"
                            >
                                {word}
                            </span>
                        ))}
                    </p>
                )}
            </div>
        </div>
    );
}
