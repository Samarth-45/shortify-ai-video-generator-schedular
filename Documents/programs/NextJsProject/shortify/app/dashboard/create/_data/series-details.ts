import { Instagram, Mail, Youtube } from "lucide-react";

export const VideoDurationOptions = [
    { value: "30-50", label: "30–50 sec video" },
    { value: "60-70", label: "60–70 sec video" },
] as const;

export const PublishPlatforms = [
    {
        id: "youtube",
        label: "YouTube",
        icon: Youtube,
        color: "text-red-600",
        bg: "bg-red-50",
        activeBorder: "border-red-400 bg-red-50/80",
    },
    {
        id: "instagram",
        label: "Instagram",
        icon: Instagram,
        color: "text-pink-600",
        bg: "bg-pink-50",
        activeBorder: "border-pink-400 bg-pink-50/80",
    },
    {
        id: "email",
        label: "Email",
        icon: Mail,
        color: "text-blue-600",
        bg: "bg-blue-50",
        activeBorder: "border-blue-400 bg-blue-50/80",
    },
] as const;

export const PublishTimeSlots = [
    "06:00 AM",
    "08:00 AM",
    "10:00 AM",
    "12:00 PM",
    "02:00 PM",
    "04:00 PM",
    "06:00 PM",
    "08:00 PM",
    "10:00 PM",
] as const;

export type VideoDurationValue = (typeof VideoDurationOptions)[number]["value"];
export type PlatformId = (typeof PublishPlatforms)[number]["id"];

export function getPlatformLabel(id: string): string {
    return PublishPlatforms.find((p) => p.id === id)?.label ?? id;
}

export function getVideoDurationLabel(value: string | null): string {
    return VideoDurationOptions.find((d) => d.value === value)?.label ?? "—";
}

/** "04:00 PM" → "16:00" for <input type="time" /> */
export function publishTimeToInputValue(time: string | null): string {
    if (!time) return "";
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return "";
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
}

/** "16:00" → "04:00 PM" for form state */
export function inputValueToPublishTime(value: string): string {
    if (!value) return "";
    const [hStr, mStr] = value.split(":");
    const hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return value;
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function isPresetPublishTime(time: string | null): boolean {
    if (!time) return false;
    return (PublishTimeSlots as readonly string[]).includes(time);
}
