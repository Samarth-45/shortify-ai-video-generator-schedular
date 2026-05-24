import { getCaptionStyleById } from "@/lib/caption-styles";
import type { SeriesRecord } from "@/lib/series";
import type { TimedCaptions } from "./caption-schema";
import { buildCaptionCuesFromScript, buildCaptionCuesFromWords } from "./captions/build-cues";
import { transcribeAudioUrlWithDeepgram } from "./captions/deepgram-transcribe";
import { uploadTimedCaptions } from "./upload-captions";

export type GeneratedCaptions = TimedCaptions & {
    captionUrl: string;
};

function estimateMp3DurationSeconds(byteLength: number): number {
    return Math.max(1, (byteLength * 8) / 128_000);
}

export async function generateCaptionsForVoiceover(
    series: SeriesRecord,
    script: string,
    audioUrl: string,
    audioByteLength?: number
): Promise<GeneratedCaptions> {
    const style = getCaptionStyleById(series.captionStyle);
    if (!style) {
        throw new Error(`Unknown caption style: ${series.captionStyle}`);
    }

    let cues;
    let durationSeconds: number;

    try {
        const transcription = await transcribeAudioUrlWithDeepgram(
            audioUrl,
            series.language
        );
        durationSeconds = transcription.durationSeconds;
        cues = buildCaptionCuesFromWords(transcription.words);
    } catch (err) {
        console.warn(
            "[captions] Deepgram transcription failed, using script timing fallback:",
            err instanceof Error ? err.message : err
        );
        durationSeconds =
            audioByteLength != null
                ? estimateMp3DurationSeconds(audioByteLength)
                : Math.max(5, script.split(/\s+/).length * 0.35);
        cues = buildCaptionCuesFromScript(script, durationSeconds);
    }

    if (cues.length === 0) {
        throw new Error("Could not build caption cues from voiceover or script");
    }

    const timedCaptions: TimedCaptions = {
        styleId: series.captionStyle,
        durationSeconds,
        cues,
    };

    const captionUrl = await uploadTimedCaptions(series.id, timedCaptions);

    return { ...timedCaptions, captionUrl };
}
