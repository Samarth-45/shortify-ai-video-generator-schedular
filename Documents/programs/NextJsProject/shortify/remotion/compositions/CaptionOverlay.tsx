import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from "remotion";
import { getRemotionCaptionStyle } from "@/lib/caption-styles";
import type { CaptionStyleId } from "@/lib/caption-styles/types";

type CaptionOverlayProps = {
    text: string;
    captionStyleId: CaptionStyleId;
};

export function CaptionOverlay({ text, captionStyleId }: CaptionOverlayProps) {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const style = getRemotionCaptionStyle(captionStyleId);

    const enter = spring({
        frame,
        fps,
        config: { damping: 14, stiffness: 120 },
    });

    const opacity = interpolate(enter, [0, 1], [0, 1]);
    const scale =
        style.animation.type === "pop"
            ? interpolate(enter, [0, 1], [0.6, 1])
            : style.animation.type === "bounce"
              ? interpolate(enter, [0, 1], [0.85, 1])
              : 1;

    const translateY =
        style.animation.type === "fade-up"
            ? interpolate(enter, [0, 1], [30, 0])
            : 0;

    const displayText =
        style.textTransform === "uppercase" ? text.toUpperCase() : text;

    return (
        <AbsoluteFill
            style={{
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 180,
                paddingLeft: 48,
                paddingRight: 48,
            }}
        >
            <div
                style={{
                    opacity,
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    fontFamily: style.fontFamily,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    color: style.color,
                    letterSpacing: style.letterSpacing,
                    textAlign: style.textAlign ?? "center",
                    textTransform: style.textTransform,
                    WebkitTextStroke: style.stroke
                        ? `${style.stroke.width}px ${style.stroke.color}`
                        : undefined,
                    paintOrder: "stroke fill",
                    backgroundColor: style.backgroundColor,
                    padding: style.backgroundColor
                        ? `${style.paddingY ?? 8}px ${style.paddingX ?? 16}px`
                        : undefined,
                    borderRadius: style.borderRadius,
                    maxWidth: "90%",
                    lineHeight: 1.15,
                }}
            >
                {displayText}
            </div>
        </AbsoluteFill>
    );
}
