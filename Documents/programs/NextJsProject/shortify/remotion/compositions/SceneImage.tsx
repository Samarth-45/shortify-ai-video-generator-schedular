import {
    AbsoluteFill,
    Img,
    interpolate,
    useCurrentFrame,
} from "remotion";
import type { SceneAnimation } from "../types";

type SceneImageProps = {
    src: string;
    animation: SceneAnimation;
    durationInFrames: number;
};

export function SceneImage({ src, animation, durationInFrames }: SceneImageProps) {
    const frame = useCurrentFrame();
    const progress = Math.min(1, frame / Math.max(1, durationInFrames - 1));

    let opacity = 1;
    let scale = 1;
    let translateY = 0;

    switch (animation) {
        case "fade-in":
            opacity = interpolate(progress, [0, 0.2], [0, 1], {
                extrapolateRight: "clamp",
            });
            scale = interpolate(progress, [0, 1], [1.05, 1], {
                extrapolateRight: "clamp",
            });
            break;
        case "zoom-in":
            opacity = interpolate(progress, [0, 0.15], [0, 1], {
                extrapolateRight: "clamp",
            });
            scale = interpolate(progress, [0, 1], [1.2, 1], {
                extrapolateRight: "clamp",
            });
            break;
        case "slide-up":
            opacity = interpolate(progress, [0, 0.15], [0, 1], {
                extrapolateRight: "clamp",
            });
            translateY = interpolate(progress, [0, 1], [80, 0], {
                extrapolateRight: "clamp",
            });
            scale = interpolate(progress, [0, 1], [1.08, 1], {
                extrapolateRight: "clamp",
            });
            break;
        case "slide-down":
            opacity = interpolate(progress, [0, 0.15], [0, 1], {
                extrapolateRight: "clamp",
            });
            translateY = interpolate(progress, [0, 1], [-80, 0], {
                extrapolateRight: "clamp",
            });
            scale = interpolate(progress, [0, 1], [1.08, 1], {
                extrapolateRight: "clamp",
            });
            break;
    }

    return (
        <AbsoluteFill
            style={{
                opacity,
                transform: `translateY(${translateY}px) scale(${scale})`,
            }}
        >
            <Img
                src={src}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
        </AbsoluteFill>
    );
}
