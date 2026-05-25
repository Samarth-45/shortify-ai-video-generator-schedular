import type { CaptionStyleId } from "@/lib/caption-styles/types";
import type { GeneratedSceneImage } from "../image-schema";
import { fetchTimedCaptionsFromUrl } from "./fetch-captions";
import { prepareShortVideoProps } from "./prepare-props";
import type { ShortVideoProps } from "@/remotion/types";
import {
    resolveRenderOutput,
    startRender,
    type RenderJob,
} from "./render-final-video";

export type ComposeFinalVideoInput = {
    seriesId: string;
    audioUrl: string;
    captionUrl: string;
    captionStyleId: string;
    durationSeconds: number;
    scenes: GeneratedSceneImage[];
};

export async function prepareVideoRenderProps(
    input: ComposeFinalVideoInput
): Promise<ShortVideoProps> {
    const captions = await fetchTimedCaptionsFromUrl(input.captionUrl);

    const props = prepareShortVideoProps({
        audioUrl: input.audioUrl,
        captionStyleId: input.captionStyleId as CaptionStyleId,
        durationSeconds: input.durationSeconds || captions.durationSeconds,
        captions,
        scenes: input.scenes,
    });

    if (props.scenes.length === 0) {
        throw new Error("Cannot compose video without scene images");
    }

    if (!input.audioUrl) {
        throw new Error("Cannot compose video without voiceover audio");
    }

    return props;
}

export async function startFinalVideoRender(
    input: ComposeFinalVideoInput
): Promise<RenderJob> {
    const props = await prepareVideoRenderProps(input);
    return startRender(props, input.seriesId);
}

export async function waitForFinalVideoRender(job: RenderJob): Promise<string> {
    return resolveRenderOutput(job);
}

/** Single-step compose (legacy). Prefer start + wait in Inngest. */
export async function composeAndRenderFinalVideo(
    input: ComposeFinalVideoInput
): Promise<string> {
    const job = await startFinalVideoRender(input);
    return waitForFinalVideoRender(job);
}
