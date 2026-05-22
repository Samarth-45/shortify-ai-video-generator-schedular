/** Animation types shared by form preview CSS and Remotion compositions */
export type CaptionAnimationType =
    | "karaoke"
    | "bounce"
    | "typewriter"
    | "pop"
    | "fade-up"
    | "neon";

export type CaptionStyleId =
    | "karaoke"
    | "bounce"
    | "typewriter"
    | "pop"
    | "fade-up"
    | "neon";

/** Remotion-ready styling — import this when building video compositions */
export interface RemotionCaptionStyle {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    stroke?: { color: string; width: number };
    textTransform?: "uppercase" | "none";
    letterSpacing?: string;
    backgroundColor?: string;
    paddingX?: number;
    paddingY?: number;
    borderRadius?: number;
    textAlign?: "center" | "left";
    animation: {
        type: CaptionAnimationType;
        /** Total animation length at 30fps */
        durationInFrames: number;
        staggerFrames?: number;
    };
}

export interface CaptionStyleDefinition {
    id: CaptionStyleId;
    label: string;
    description: string;
    previewWords: string[];
    /** CSS class on the preview container (form UI) */
    previewClass: string;
    remotion: RemotionCaptionStyle;
}
