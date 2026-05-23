"use client";

import { Check } from "lucide-react";
import { VideoStyleImage } from "@/components/video-style-image";
import { VideoStyles } from "../_data/constant";

interface VideoStyleSelectionProps {
    currentStep: number;
    totalSteps: number;
    selectedStyle: string | null;
    onSelect: (styleId: string) => void;
}

export function VideoStyleSelection({
    currentStep,
    totalSteps,
    selectedStyle,
    onSelect,
}: VideoStyleSelectionProps) {
    return (
        <div className="mx-auto max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600">
                Step {currentStep} of {totalSteps}
            </p>
            <div className="mt-3 flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300
                            ${i < currentStep ? "bg-violet-600" : "bg-gray-200"}`}
                    />
                ))}
            </div>

            <div className="mt-8 mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Video Style
                </h2>
                <p className="mt-1.5 text-sm text-gray-500">
                    Choose the visual style for your videos.
                </p>
            </div>

            <div className="-mx-2 overflow-x-auto overscroll-x-contain scroll-smooth px-2 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-4 sm:px-4">
                <div className="flex w-max gap-4 pr-4">
                    {VideoStyles.map((style) => {
                        const isSelected = selectedStyle === style.id;

                        return (
                            <button
                                key={style.id}
                                type="button"
                                onClick={() => onSelect(style.id)}
                                className="group shrink-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-2xl"
                            >
                                <div
                                    className={`relative w-[158px] aspect-[9/16] overflow-hidden rounded-2xl transition-all duration-200
                                        ${isSelected
                                            ? "ring-[3px] ring-violet-600 ring-offset-2 shadow-lg shadow-violet-500/20"
                                            : "ring-1 ring-gray-200 hover:ring-gray-300 hover:shadow-md"
                                        }`}
                                >
                                    <VideoStyleImage
                                        basePath={style.image}
                                        label={style.label}
                                    />

                                    {isSelected && (
                                        <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 shadow-md">
                                            <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>
                                <p
                                    className={`mt-2.5 text-center text-sm font-semibold transition-colors
                                        ${isSelected ? "text-violet-700" : "text-gray-600 group-hover:text-gray-900"}`}
                                >
                                    {style.label}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
