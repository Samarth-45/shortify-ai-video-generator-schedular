import { VideoStyles } from "@/app/dashboard/create/_data/constant";

export function getVideoStyleById(styleId: string) {
    return VideoStyles.find((s) => s.id === styleId);
}

export function getVideoStyleImageBase(styleId: string): string {
    return getVideoStyleById(styleId)?.image ?? "/video-style/cinematic";
}
