"use client";

import { Calendar, Clock, Repeat, Zap } from "lucide-react";

const frequencies = [
    {
        value: "daily",
        label: "Daily",
        icon: Zap,
        description: "One video every day — maximum growth.",
        color: "text-amber-500",
        bg: "bg-amber-50",
        activeBorder: "border-amber-400 bg-amber-50/60",
    },
    {
        value: "every_2_days",
        label: "Every 2 Days",
        icon: Repeat,
        description: "Consistent cadence without burning out.",
        color: "text-violet-500",
        bg: "bg-violet-50",
        activeBorder: "border-violet-400 bg-violet-50/60",
    },
    {
        value: "weekly",
        label: "Weekly",
        icon: Calendar,
        description: "One video per week — quality over quantity.",
        color: "text-blue-500",
        bg: "bg-blue-50",
        activeBorder: "border-blue-400 bg-blue-50/60",
    },
    {
        value: "custom",
        label: "Custom",
        icon: Clock,
        description: "Set your own schedule with full control.",
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        activeBorder: "border-emerald-400 bg-emerald-50/60",
    },
];

const timeSlots = [
    "06:00 AM", "08:00 AM", "10:00 AM",
    "12:00 PM", "02:00 PM", "04:00 PM",
    "06:00 PM", "08:00 PM", "10:00 PM",
];

interface ScheduleSelectionProps {
    selectedSchedule: string | null;
    onSelect: (schedule: string) => void;
}

export function ScheduleSelection({ selectedSchedule, onSelect }: ScheduleSelectionProps) {
    // schedule is stored as "frequency|time" e.g. "daily|08:00 AM"
    const [freq, time] = selectedSchedule ? selectedSchedule.split("|") : ["", ""];

    const handleFreqSelect = (f: string) => {
        onSelect(`${f}|${time || "08:00 AM"}`);
    };

    const handleTimeSelect = (t: string) => {
        onSelect(`${freq || "daily"}|${t}`);
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Publishing Schedule</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose how often and when your videos will be published automatically.
                </p>
            </div>

            {/* Frequency */}
            <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Posting Frequency
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {frequencies.map((f) => {
                        const Icon = f.icon;
                        const isSelected = freq === f.value;
                        return (
                            <button
                                key={f.value}
                                onClick={() => handleFreqSelect(f.value)}
                                className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 hover:shadow-md
                                    ${isSelected
                                        ? `${f.activeBorder} shadow-sm`
                                        : "border-gray-100 bg-white hover:border-gray-200"
                                    }`}
                            >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.bg}`}>
                                    <Icon className={`h-5 w-5 ${f.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-[0.9rem] font-semibold ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                                        {f.label}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{f.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Slot */}
            <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Preferred Publishing Time
                    <span className="ml-2 text-xs font-normal text-gray-400">(in your local timezone)</span>
                </label>
                <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                    <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((slot) => {
                            const isSelected = time === slot;
                            return (
                                <button
                                    key={slot}
                                    onClick={() => handleTimeSelect(slot)}
                                    className={`rounded-xl border-2 py-2.5 text-sm font-medium transition-all duration-150
                                        ${isSelected
                                            ? "border-violet-400 bg-violet-50 text-violet-700 shadow-sm"
                                            : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        }`}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Summary pill */}
            {freq && time && (
                <div className="flex items-center gap-2 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                    <Calendar className="h-4 w-4 text-violet-500 shrink-0" />
                    <p className="text-sm text-violet-700">
                        Videos will publish{" "}
                        <span className="font-semibold">
                            {frequencies.find(f => f.value === freq)?.label.toLowerCase()}
                        </span>{" "}
                        at{" "}
                        <span className="font-semibold">{time}</span>.
                    </p>
                </div>
            )}
        </div>
    );
}
