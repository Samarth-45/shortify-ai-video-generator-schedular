"use client";

import { Lightbulb, Laugh, Flame, BookOpen, Sparkles, Heart } from "lucide-react";

const scriptStyles = [
    {
        value: "educational",
        label: "Educational",
        icon: BookOpen,
        description: "Teach something new. Clear, informative, credible.",
        example: '"Did you know that 90% of ocean life is still unexplored?"',
        color: "text-blue-500",
        bg: "bg-blue-50",
        activeBorder: "border-blue-400 bg-blue-50/50",
        activeBadge: "bg-blue-100 text-blue-700",
    },
    {
        value: "humorous",
        label: "Humorous",
        icon: Laugh,
        description: "Make your audience laugh. Light, witty, relatable.",
        example: '"Why did the AI cross the road? To optimize the other side."',
        color: "text-amber-500",
        bg: "bg-amber-50",
        activeBorder: "border-amber-400 bg-amber-50/50",
        activeBadge: "bg-amber-100 text-amber-700",
    },
    {
        value: "inspirational",
        label: "Inspirational",
        icon: Sparkles,
        description: "Motivate and uplift. Emotional, powerful, uplifting.",
        example: '"Every great achievement started with a single small step."',
        color: "text-violet-500",
        bg: "bg-violet-50",
        activeBorder: "border-violet-400 bg-violet-50/50",
        activeBadge: "bg-violet-100 text-violet-700",
    },
    {
        value: "dramatic",
        label: "Dramatic",
        icon: Flame,
        description: "Build suspense and tension. Vivid, intense storytelling.",
        example: '"The moment that changed everything happened at midnight…"',
        color: "text-red-500",
        bg: "bg-red-50",
        activeBorder: "border-red-400 bg-red-50/50",
        activeBadge: "bg-red-100 text-red-700",
    },
    {
        value: "listicle",
        label: "Listicle",
        icon: Lightbulb,
        description: "Top 5, Top 10 formats. Easy to follow, high retention.",
        example: '"5 habits that millionaires practice every single morning."',
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        activeBorder: "border-emerald-400 bg-emerald-50/50",
        activeBadge: "bg-emerald-100 text-emerald-700",
    },
    {
        value: "story",
        label: "Story",
        icon: Heart,
        description: "Real or fictional narrative. Personal, human, engaging.",
        example: '"A boy from a small village who became a global icon…"',
        color: "text-pink-500",
        bg: "bg-pink-50",
        activeBorder: "border-pink-400 bg-pink-50/50",
        activeBadge: "bg-pink-100 text-pink-700",
    },
];

interface ScriptStyleSelectionProps {
    selectedScript: string | null;
    onSelect: (style: string) => void;
}

export function ScriptStyleSelection({ selectedScript, onSelect }: ScriptStyleSelectionProps) {
    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Script Style</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose the tone and style for your AI-generated video scripts.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {scriptStyles.map((style) => {
                    const Icon = style.icon;
                    const isSelected = selectedScript === style.value;

                    return (
                        <button
                            key={style.value}
                            onClick={() => onSelect(style.value)}
                            className={`flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition-all duration-200 hover:shadow-md
                                ${isSelected
                                    ? `${style.activeBorder} shadow-sm`
                                    : "border-gray-100 bg-white hover:border-gray-200"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
                                    <Icon className={`h-5 w-5 ${style.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-[0.925rem] font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                                            {style.label}
                                        </p>
                                        {isSelected && (
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${style.activeBadge}`}>
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{style.description}</p>
                                </div>
                            </div>

                            {/* Example quote */}
                            <p className={`rounded-xl px-3 py-2 text-[0.75rem] italic leading-relaxed
                                ${isSelected ? "bg-white/80 text-gray-600" : "bg-gray-50 text-gray-400"}`}>
                                {style.example}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
