import type { CaptionWord } from "../caption-schema";

const DEEPGRAM_LISTEN_URL = "https://api.deepgram.com/v1/listen";

type DeepgramWord = {
    word: string;
    start: number;
    end: number;
    punctuated_word?: string;
};

type DeepgramListenResponse = {
    results?: {
        channels?: Array<{
            alternatives?: Array<{
                words?: DeepgramWord[];
            }>;
        }>;
    };
    metadata?: {
        duration?: number;
    };
};

export type TranscriptionResult = {
    words: CaptionWord[];
    durationSeconds: number;
};

function mapDeepgramWords(raw: DeepgramWord[]): CaptionWord[] {
    return raw
        .filter((w) => w.word.trim().length > 0)
        .map((w) => ({
            word: (w.punctuated_word ?? w.word).trim(),
            start: w.start,
            end: w.end,
        }));
}

export async function transcribeAudioUrlWithDeepgram(
    audioUrl: string,
    language?: string
): Promise<TranscriptionResult> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        throw new Error(
            "DEEPGRAM_API_KEY is not set. Required for caption timing from voiceover audio."
        );
    }

    const url = new URL(DEEPGRAM_LISTEN_URL);
    url.searchParams.set("model", "nova-2");
    url.searchParams.set("smart_format", "true");
    url.searchParams.set("punctuate", "true");
    url.searchParams.set("utterances", "false");

    if (language) {
        const lang = language.split("-")[0];
        if (lang) url.searchParams.set("language", lang);
    }

    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({ url: audioUrl }),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(
            `Deepgram transcription failed (${response.status}): ${details.slice(0, 500)}`
        );
    }

    const payload = (await response.json()) as DeepgramListenResponse;
    const rawWords =
        payload.results?.channels?.[0]?.alternatives?.[0]?.words ?? [];

    const words = mapDeepgramWords(rawWords);
    if (words.length === 0) {
        throw new Error("Deepgram returned no word timings for the voiceover");
    }

    const durationSeconds =
        payload.metadata?.duration ??
        words[words.length - 1]?.end ??
        0;

    return { words, durationSeconds };
}
