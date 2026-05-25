"use client";

import { useState } from "react";
import {
    Ghost,
    Flame,
    Brain,
    Heart,
    Dumbbell,
    DollarSign,
    Lightbulb,
    Laugh,
    BookOpen,
    Globe,
    Sparkles,
    Pencil,
} from "lucide-react";
const availableNiches = [
    {
        id: "scary-stories",
        name: "Scary Stories",
        description: "Chilling tales and horror narratives that keep viewers on edge",
        icon: Ghost,
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-200",
        activeBg: "bg-purple-100",
    },
    {
        id: "motivation",
        name: "Motivation",
        description: "Inspirational content to uplift and drive your audience forward",
        icon: Flame,
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        activeBg: "bg-orange-100",
    },
    {
        id: "psychology-facts",
        name: "Psychology Facts",
        description: "Fascinating insights into human behavior and the mind",
        icon: Brain,
        color: "text-pink-600",
        bg: "bg-pink-50",
        border: "border-pink-200",
        activeBg: "bg-pink-100",
    },
    {
        id: "relationship-advice",
        name: "Relationship Advice",
        description: "Tips and wisdom for building stronger connections",
        icon: Heart,
        color: "text-red-500",
        bg: "bg-red-50",
        border: "border-red-200",
        activeBg: "bg-red-100",
    },
    {
        id: "fitness-health",
        name: "Fitness & Health",
        description: "Workout routines, nutrition tips, and wellness content",
        icon: Dumbbell,
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        activeBg: "bg-green-100",
    },
    {
        id: "money-finance",
        name: "Money & Finance",
        description: "Personal finance, investing, and wealth-building strategies",
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        activeBg: "bg-emerald-100",
    },
    {
        id: "life-hacks",
        name: "Life Hacks",
        description: "Clever tricks and shortcuts to make everyday life easier",
        icon: Lightbulb,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        activeBg: "bg-amber-100",
    },
    {
        id: "comedy-memes",
        name: "Comedy & Memes",
        description: "Humorous content and trending meme compilations",
        icon: Laugh,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        activeBg: "bg-yellow-100",
    },
    {
        id: "history-facts",
        name: "History & Facts",
        description: "Surprising historical events and little-known facts",
        icon: BookOpen,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        activeBg: "bg-blue-100",
    },
    {
        id: "tech-science",
        name: "Tech & Science",
        description: "Latest in technology, space, and scientific discoveries",
        icon: Globe,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        activeBg: "bg-cyan-100",
    },
];

interface NicheSelectionProps {
    selectedNiche: string | null;
    onSelect: (nicheId: string) => void;
}

export function NicheSelection({
    selectedNiche,
    onSelect,
}: NicheSelectionProps) {
    const [activeTab, setActiveTab] = useState<"available" | "custom">(
        "available"
    );
    const [customNiche, setCustomNiche] = useState("");

    const parentCustomNiche = selectedNiche?.startsWith("custom:")
        ? selectedNiche.slice("custom:".length)
        : null;
    const tab = parentCustomNiche !== null ? "custom" : activeTab;
    const customNicheValue = parentCustomNiche ?? customNiche;

    return (
        <div className="mx-auto max-w-3xl">
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Select Your Niche</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose a content niche for your video series or create your own.
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-5 flex rounded-xl bg-gray-100 p-1">
                <button
                    onClick={() => setActiveTab("available")}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200
            ${tab === "available"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Sparkles className="mr-2 inline h-4 w-4" />
                    Available Niches
                </button>
                <button
                    onClick={() => setActiveTab("custom")}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200
            ${tab === "custom"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <Pencil className="mr-2 inline h-4 w-4" />
                    Custom Niche
                </button>
            </div>

            {/* Available Niches Tab */}
            {tab === "available" && (
                <div className="h-[420px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm custom-scrollbar">
                    <div className="space-y-2">
                        {availableNiches.map((niche) => {
                            const isSelected = selectedNiche === niche.id;

                            return (
                                <button
                                    key={niche.id}
                                    onClick={() => onSelect(niche.id)}
                                    className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-4 text-left transition-all duration-200
                    ${isSelected
                                            ? `${niche.activeBg} ${niche.border} shadow-sm`
                                            : "border-transparent hover:bg-gray-50"
                                        }`}
                                >
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${niche.bg}`}
                                    >
                                        <niche.icon className={`h-5 w-5 ${niche.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-[0.925rem] font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"
                                                }`}
                                        >
                                            {niche.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                                            {niche.description}
                                        </p>
                                    </div>
                                    {/* Selection indicator */}
                                    <div
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200
                      ${isSelected
                                                ? "border-violet-600 bg-violet-600"
                                                : "border-gray-200 bg-white"
                                            }`}
                                    >
                                        {isSelected && (
                                            <svg
                                                className="h-3 w-3 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Custom Niche Tab */}
            {tab === "custom" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Describe your niche
                    </label>
                    <textarea
                        value={customNicheValue}
                        onChange={(e) => {
                            setCustomNiche(e.target.value);
                            if (e.target.value.trim()) {
                                onSelect(`custom:${e.target.value.trim()}`);
                            }
                        }}
                        placeholder="e.g., Underwater Photography Tips — Short videos about capturing stunning shots beneath the surface"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none h-32 transition-all"
                    />
                    <p className="mt-2 text-xs text-gray-400">
                        Be specific about the type of content you want to create. The AI
                        will use this to generate relevant scripts and visuals.
                    </p>
                </div>
            )}
        </div>
    );
}
