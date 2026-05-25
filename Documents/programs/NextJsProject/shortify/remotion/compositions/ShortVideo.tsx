import { AbsoluteFill, Audio, Sequence } from "remotion";
import type { ShortVideoProps } from "../types";
import { CaptionOverlay } from "./CaptionOverlay";
import { SceneImage } from "./SceneImage";

export function ShortVideo({
    audioUrl,
    scenes,
    captionChunks,
    captionStyleId,
}: ShortVideoProps) {
    return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
            {audioUrl ? <Audio src={audioUrl} /> : null}

            {scenes.map((scene, index) => (
                <Sequence
                    key={`scene-${index}`}
                    from={scene.fromFrame}
                    durationInFrames={scene.durationInFrames}
                >
                    <SceneImage
                        src={scene.imageUrl}
                        animation={scene.animation}
                        durationInFrames={scene.durationInFrames}
                    />
                </Sequence>
            ))}

            {captionChunks.map((chunk, index) => (
                <Sequence
                    key={`caption-${index}`}
                    from={chunk.fromFrame}
                    durationInFrames={chunk.durationInFrames}
                >
                    <CaptionOverlay
                        text={chunk.text}
                        captionStyleId={captionStyleId}
                    />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
}
