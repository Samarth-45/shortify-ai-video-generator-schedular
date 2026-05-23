"use client";

import { Calendar, Check, Clock, Info, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    PublishPlatforms,
    PublishTimeSlots,
    VideoDurationOptions,
    inputValueToPublishTime,
    publishTimeToInputValue,
} from "../_data/series-details";

interface SeriesDetailsFormProps {
    seriesName: string;
    videoDuration: string | null;
    platforms: string[];
    publishTime: string | null;
    onSeriesNameChange: (name: string) => void;
    onVideoDurationChange: (duration: string) => void;
    onTogglePlatform: (platformId: string) => void;
    onPublishTimeChange: (time: string) => void;
    onSchedule: () => void;
    isSubmitting: boolean;
    isEditMode?: boolean;
}

export function SeriesDetailsForm({
    seriesName,
    videoDuration,
    platforms,
    publishTime,
    onSeriesNameChange,
    onVideoDurationChange,
    onTogglePlatform,
    onPublishTimeChange,
    onSchedule,
    isSubmitting,
    isEditMode = false,
}: SeriesDetailsFormProps) {
    const canSchedule =
        seriesName.trim().length > 0 &&
        !!videoDuration &&
        platforms.length > 0 &&
        !!publishTime?.trim();

    const timeInputValue = publishTimeToInputValue(publishTime);

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Series Details</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Name your series, set video length, pick platforms, and choose when to publish.
                </p>
            </div>

            {/* Series name */}
            <div className="space-y-2">
                <Label htmlFor="series-name">Series Name</Label>
                <Input
                    id="series-name"
                    placeholder="e.g. Daily Motivation Shorts"
                    value={seriesName}
                    onChange={(e) => onSeriesNameChange(e.target.value)}
                    className="h-11 rounded-xl"
                />
            </div>

            {/* Video duration */}
            <div className="space-y-2">
                <Label>Video Duration</Label>
                <Select
                    value={videoDuration ?? undefined}
                    onValueChange={onVideoDurationChange}
                >
                    <SelectTrigger className="h-11 w-full rounded-xl">
                        <SelectValue placeholder="Select video duration" />
                    </SelectTrigger>
                    <SelectContent>
                        {VideoDurationOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Platforms — YouTube, Instagram, Email only */}
            <div className="space-y-3">
                <Label>Platforms</Label>
                <div className="grid grid-cols-3 gap-3">
                    {PublishPlatforms.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = platforms.includes(platform.id);

                        return (
                            <button
                                key={platform.id}
                                type="button"
                                onClick={() => onTogglePlatform(platform.id)}
                                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 hover:shadow-md
                                    ${isSelected
                                        ? `${platform.activeBorder} shadow-sm`
                                        : "border-gray-100 bg-white hover:border-gray-200"
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600">
                                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                    </div>
                                )}
                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${platform.bg}`}
                                >
                                    <Icon className={`h-5 w-5 ${platform.color}`} />
                                </div>
                                <span
                                    className={`text-sm font-semibold ${isSelected ? "text-gray-900" : "text-gray-600"}`}
                                >
                                    {platform.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Publish time */}
            <div className="space-y-3">
                <Label>
                    Time to Publish
                    <span className="ml-2 text-xs font-normal text-gray-400">
                        (your local timezone)
                    </span>
                </Label>
                <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                    <div className="grid grid-cols-3 gap-2">
                        {PublishTimeSlots.map((slot) => {
                            const isSelected = publishTime === slot;
                            return (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => onPublishTimeChange(slot)}
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

                    <div className="relative border-t border-gray-100 pt-3">
                        <Label
                            htmlFor="publish-time-custom"
                            className="mb-2 text-xs font-medium text-gray-500"
                        >
                            Or enter a custom time
                        </Label>
                        <div className="relative">
                            <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                id="publish-time-custom"
                                type="time"
                                value={timeInputValue}
                                onChange={(e) =>
                                    onPublishTimeChange(
                                        inputValueToPublishTime(e.target.value)
                                    )
                                }
                                className="h-11 rounded-xl pl-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>
                        {publishTime && (
                            <p className="mt-2 text-xs text-violet-600">
                                Selected: <span className="font-semibold">{publishTime}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-sm text-amber-800/90">
                        Video will generate 3–6 hours before video publish
                    </p>
                </div>
            </div>

            {/* Schedule CTA */}
            <button
                type="button"
                onClick={onSchedule}
                disabled={!canSchedule || isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditMode ? "Saving…" : "Scheduling…"}
                    </>
                ) : (
                    <>
                        <Calendar className="h-4 w-4" />
                        {isEditMode ? "Save changes" : "Schedule"}
                    </>
                )}
            </button>
        </div>
    );
}
