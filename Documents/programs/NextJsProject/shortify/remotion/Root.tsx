import { Composition } from "remotion";
import { ShortVideo } from "./compositions/ShortVideo";
import {
    SHORT_VIDEO_COMPOSITION_ID,
    SHORT_VIDEO_FPS,
    SHORT_VIDEO_HEIGHT,
    SHORT_VIDEO_WIDTH,
    defaultShortVideoProps,
} from "./types";

export const RemotionRoot = () => {
    return (
        <Composition
            id={SHORT_VIDEO_COMPOSITION_ID}
            component={ShortVideo}
            durationInFrames={defaultShortVideoProps.durationInFrames}
            fps={SHORT_VIDEO_FPS}
            width={SHORT_VIDEO_WIDTH}
            height={SHORT_VIDEO_HEIGHT}
            defaultProps={defaultShortVideoProps}
            calculateMetadata={async ({ props }) => ({
                durationInFrames: Math.max(
                    30,
                    props.durationInFrames ?? defaultShortVideoProps.durationInFrames
                ),
            })}
        />
    );
};
