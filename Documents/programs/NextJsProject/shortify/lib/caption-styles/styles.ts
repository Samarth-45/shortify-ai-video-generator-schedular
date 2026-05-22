import type { CaptionStyleDefinition, CaptionStyleId } from "./types";

export const CAPTION_PREVIEW_TEXT = ["Create", "amazing", "shorts"];

export const CaptionStyles: readonly CaptionStyleDefinition[] = [
    {
        id: "karaoke",
        label: "Karaoke",
        description: "Words light up one by one like sing-along captions",
        previewWords: CAPTION_PREVIEW_TEXT,
        previewClass: "caption-preview-karaoke",
        remotion: {
            fontFamily: "Inter, sans-serif",
            fontSize: 52,
            fontWeight: 800,
            color: "#ffffff",
            stroke: { color: "#000000", width: 3 },
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            animation: { type: "karaoke", durationInFrames: 90, staggerFrames: 12 },
        },
    },
    {
        id: "bounce",
        label: "Bounce",
        description: "Playful bounce-in for each word",
        previewWords: CAPTION_PREVIEW_TEXT,
        previewClass: "caption-preview-bounce",
        remotion: {
            fontFamily: "Inter, sans-serif",
            fontSize: 48,
            fontWeight: 700,
            color: "#fbbf24",
            stroke: { color: "#1c1917", width: 2 },
            animation: { type: "bounce", durationInFrames: 75, staggerFrames: 10 },
        },
    },
    {
        id: "typewriter",
        label: "Typewriter",
        description: "Classic letter-by-letter reveal with cursor",
        previewWords: ["Create amazing shorts"],
        previewClass: "caption-preview-typewriter",
        remotion: {
            fontFamily: "Geist Mono, monospace",
            fontSize: 40,
            fontWeight: 600,
            color: "#a7f3d0",
            backgroundColor: "rgba(0,0,0,0.55)",
            paddingX: 16,
            paddingY: 10,
            borderRadius: 8,
            animation: { type: "typewriter", durationInFrames: 120 },
        },
    },
    {
        id: "pop",
        label: "Pop",
        description: "Bold scale pop with thick outline",
        previewWords: CAPTION_PREVIEW_TEXT,
        previewClass: "caption-preview-pop",
        remotion: {
            fontFamily: "Inter, sans-serif",
            fontSize: 56,
            fontWeight: 900,
            color: "#ffffff",
            stroke: { color: "#7c3aed", width: 5 },
            textTransform: "uppercase",
            animation: { type: "pop", durationInFrames: 45, staggerFrames: 8 },
        },
    },
    {
        id: "fade-up",
        label: "Fade Up",
        description: "Smooth fade and slide from below",
        previewWords: CAPTION_PREVIEW_TEXT,
        previewClass: "caption-preview-fade-up",
        remotion: {
            fontFamily: "Inter, sans-serif",
            fontSize: 44,
            fontWeight: 600,
            color: "#f8fafc",
            stroke: { color: "#0f172a", width: 2 },
            animation: { type: "fade-up", durationInFrames: 60, staggerFrames: 14 },
        },
    },
    {
        id: "neon",
        label: "Neon Glow",
        description: "Pulsing neon glow for high-energy clips",
        previewWords: CAPTION_PREVIEW_TEXT,
        previewClass: "caption-preview-neon",
        remotion: {
            fontFamily: "Inter, sans-serif",
            fontSize: 50,
            fontWeight: 800,
            color: "#22d3ee",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            animation: { type: "neon", durationInFrames: 90 },
        },
    },
] as const;

export function getCaptionStyleById(
    id: string | null | undefined
): CaptionStyleDefinition | undefined {
    return CaptionStyles.find((s) => s.id === id);
}

export function getRemotionCaptionStyle(id: CaptionStyleId) {
    return getCaptionStyleById(id)!.remotion;
}
