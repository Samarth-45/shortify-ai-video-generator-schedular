import type { CaptionCue, CaptionWord } from "../caption-schema";

const MAX_WORDS_PER_CUE = 4;
const PAUSE_SPLIT_SECONDS = 0.45;

/** Groups word-level timings into short on-screen caption chunks for Remotion-style rendering */
export function buildCaptionCuesFromWords(words: CaptionWord[]): CaptionCue[] {
    if (words.length === 0) return [];

    const cues: CaptionCue[] = [];
    let chunk: CaptionWord[] = [];

    const flush = () => {
        if (chunk.length === 0) return;
        cues.push({
            text: chunk.map((w) => w.word).join(" "),
            start: chunk[0].start,
            end: chunk[chunk.length - 1].end,
            words: [...chunk],
        });
        chunk = [];
    };

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const prev = words[i - 1];

        if (
            chunk.length > 0 &&
            prev &&
            word.start - prev.end >= PAUSE_SPLIT_SECONDS
        ) {
            flush();
        }

        chunk.push(word);

        if (chunk.length >= MAX_WORDS_PER_CUE) {
            flush();
        }
    }

    flush();
    return cues;
}

/** Fallback when STT is unavailable: spread script words evenly across audio duration */
export function buildCaptionCuesFromScript(
    script: string,
    durationSeconds: number
): CaptionCue[] {
    const tokens = script
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean);

    if (tokens.length === 0 || durationSeconds <= 0) return [];

    const words: CaptionWord[] = tokens.map((word, index) => {
        const start = (index / tokens.length) * durationSeconds;
        const end = ((index + 1) / tokens.length) * durationSeconds;
        return { word, start, end };
    });

    return buildCaptionCuesFromWords(words);
}
