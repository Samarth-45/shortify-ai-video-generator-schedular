import type { CaptionStyleId } from "@/lib/caption-styles/types";

export const SHORT_VIDEO_COMPOSITION_ID = "ShortVideo";
export const SHORT_VIDEO_FPS = 30;
export const SHORT_VIDEO_WIDTH = 1080;
export const SHORT_VIDEO_HEIGHT = 1920;

export type SceneAnimation = "fade-in" | "zoom-in" | "slide-up" | "slide-down";

export type ShortVideoScene = {
    imageUrl: string;
    fromFrame: number;
    durationInFrames: number;
    animation: SceneAnimation;
};

export type ShortVideoCaptionChunk = {
    text: string;
    fromFrame: number;
    durationInFrames: number;
};

export type ShortVideoProps = {
    audioUrl: string;
    durationInFrames: number;
    captionStyleId: CaptionStyleId;
    scenes: ShortVideoScene[];
    captionChunks: ShortVideoCaptionChunk[];
};

export const defaultShortVideoProps: ShortVideoProps = {
    audioUrl: "",
    durationInFrames: 300,
    captionStyleId: "karaoke",
    scenes: [],
    captionChunks: [],
};
