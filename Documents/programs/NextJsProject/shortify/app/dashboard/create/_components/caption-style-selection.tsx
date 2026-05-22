"use client";

import { Check, Subtitles } from "lucide-react";
import { CaptionStylePreview, CaptionStyles } from "@/lib/caption-styles";

interface CaptionStyleSelectionProps {
    selectedStyle: string | null;
    onSelect: (styleId: string) => void;
}

export function CaptionStyleSelection({
    selectedStyle,
    onSelect,
}: CaptionStyleSelectionProps) {
    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                    <Subtitles className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Caption Style</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Pick an animated caption style for your videos. Each preview loops so you can see how words appear on screen.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {CaptionStyles.map((style) => {
                    const isSelected = selectedStyle === style.id;

                    return (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => onSelect(style.id)}
                            className={`group flex flex-col rounded-2xl border-2 p-3 text-left transition-all duration-200 hover:shadow-md
                                ${isSelected
                                    ? "border-violet-400 bg-violet-50/50 shadow-sm ring-1 ring-violet-200"
                                    : "border-gray-100 bg-white hover:border-gray-200"
                                }`}
                        >
                            <div className="relative">
                                <CaptionStylePreview style={style} />
                                {isSelected && (
                                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 shadow-md">
                                        <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            <div className="mt-3 px-1">
                                <p
                                    className={`text-sm font-bold transition-colors
                                        ${isSelected ? "text-violet-700" : "text-gray-800"}`}
                                >
                                    {style.label}
                                </p>
                                <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">
                                    {style.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
