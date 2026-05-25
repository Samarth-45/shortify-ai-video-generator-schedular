import type { CaptionStyleId } from "@/lib/caption-styles/types";
import type {
    SceneAnimation,
    ShortVideoCaptionChunk,
    ShortVideoProps,
    ShortVideoScene,
} from "@/remotion/types";
import { SHORT_VIDEO_FPS } from "@/remotion/types";
import type { TimedCaptions } from "../caption-schema";
import type { GeneratedSceneImage } from "../image-schema";

const SCENE_ANIMATIONS: SceneAnimation[] = [
    "fade-in",
    "zoom-in",
    "slide-up",
    "slide-down",
];

const WORDS_PER_CAPTION = 3;

function secondsToFrame(seconds: number): number {
    return Math.max(0, Math.round(seconds * SHORT_VIDEO_FPS));
}

export function buildCaptionChunks(
    captions: TimedCaptions,
    wordsPerChunk = WORDS_PER_CAPTION
): ShortVideoCaptionChunk[] {
    const words = captions.cues.flatMap((cue) => cue.words);
    if (words.length === 0) return [];

    const chunks: ShortVideoCaptionChunk[] = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
        const slice = words.slice(i, i + wordsPerChunk);
        const fromFrame = secondsToFrame(slice[0].start);
        const endFrame = secondsToFrame(slice[slice.length - 1].end);
        const durationInFrames = Math.max(1, endFrame - fromFrame);

        chunks.push({
            text: slice.map((w) => w.word).join(" "),
            fromFrame,
            durationInFrames,
        });
    }

    return chunks;
}

export function buildSceneTimeline(
    scenes: GeneratedSceneImage[],
    durationSeconds: number
): ShortVideoScene[] {
    if (scenes.length === 0) return [];

    const totalFrames = Math.max(
        30,
        secondsToFrame(durationSeconds || scenes.length * 90)
    );
    const framesPerScene = Math.floor(totalFrames / scenes.length);

    return scenes.map((scene, index) => {
        const fromFrame = index * framesPerScene;
        const durationInFrames =
            index === scenes.length - 1
                ? totalFrames - fromFrame
                : framesPerScene;

        return {
            imageUrl: scene.imageUrl,
            fromFrame,
            durationInFrames: Math.max(1, durationInFrames),
            animation: SCENE_ANIMATIONS[index % SCENE_ANIMATIONS.length],
        };
    });
}

export function prepareShortVideoProps(input: {
    audioUrl: string;
    captionStyleId: string;
    durationSeconds: number;
    captions: TimedCaptions;
    scenes: GeneratedSceneImage[];
}): ShortVideoProps {
    const durationInFrames = Math.max(
        30,
        secondsToFrame(input.durationSeconds || input.captions.durationSeconds)
    );

    return {
        audioUrl: input.audioUrl,
        durationInFrames,
        captionStyleId: input.captionStyleId as CaptionStyleId,
        scenes: buildSceneTimeline(input.scenes, input.durationSeconds),
        captionChunks: buildCaptionChunks(input.captions),
    };
}
