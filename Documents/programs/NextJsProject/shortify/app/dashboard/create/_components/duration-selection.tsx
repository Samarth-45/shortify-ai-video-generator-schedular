"use client";

import { Clock, Zap, Film, Tv } from "lucide-react";

const durations = [
    {
        value: "30",
        label: "30 seconds",
        icon: Zap,
        badge: "Quick",
        description: "Ideal for fast-paced content & reels",
        color: "text-amber-500",
        bg: "bg-amber-50",
        activeBorder: "border-amber-400 bg-amber-50/60",
        activeBadge: "bg-amber-100 text-amber-700",
    },
    {
        value: "60",
        label: "60 seconds",
        icon: Clock,
        badge: "Popular",
        description: "Best for storytelling & explainers",
        color: "text-violet-500",
        bg: "bg-violet-50",
        activeBorder: "border-violet-400 bg-violet-50/60",
        activeBadge: "bg-violet-100 text-violet-700",
    },
    {
        value: "90",
        label: "90 seconds",
        icon: Film,
        badge: "Standard",
        description: "Great for in-depth topic coverage",
        color: "text-blue-500",
        bg: "bg-blue-50",
        activeBorder: "border-blue-400 bg-blue-50/60",
        activeBadge: "bg-blue-100 text-blue-700",
    },
    {
        value: "120",
        label: "2 minutes",
        icon: Tv,
        badge: "Long-form",
        description: "Perfect for detailed tutorials",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        activeBorder: "border-emerald-400 bg-emerald-50/60",
        activeBadge: "bg-emerald-100 text-emerald-700",
    },
];

interface DurationSelectionProps {
    selectedDuration: string | null;
    onSelect: (duration: string) => void;
}

export function DurationSelection({ selectedDuration, onSelect }: DurationSelectionProps) {
    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Video Duration</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose how long each video in your series will be.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {durations.map((d) => {
                    const Icon = d.icon;
                    const isSelected = selectedDuration === d.value;

                    return (
                        <button
                            key={d.value}
                            onClick={() => onSelect(d.value)}
                            className={`group flex flex-col gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-200 hover:shadow-md
                                ${isSelected
                                    ? `${d.activeBorder} shadow-sm`
                                    : "border-gray-100 bg-white hover:border-gray-200"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${d.bg}`}>
                                    <Icon className={`h-6 w-6 ${d.color}`} />
                                </div>
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                        ${isSelected ? d.activeBadge : "bg-gray-100 text-gray-500"}`}
                                >
                                    {d.badge}
                                </span>
                            </div>
                            <div>
                                <p className={`text-lg font-bold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                                    {d.label}
                                </p>
                                <p className="mt-0.5 text-sm text-gray-400">{d.description}</p>
                            </div>

                            {/* Selection dot */}
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 self-end transition-all
                                ${isSelected ? "border-violet-600 bg-violet-600" : "border-gray-200 bg-white"}`}
                            >
                                {isSelected && (
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
