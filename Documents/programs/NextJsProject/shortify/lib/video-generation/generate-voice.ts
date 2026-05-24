import type { SeriesRecord } from "@/lib/series";
import {
    assertVoiceMatchesProvider,
    getVoiceProviderForLanguage,
    type VoiceProvider,
} from "@/lib/voice-config";
import { synthesizeWithDeepgram } from "./tts/deepgram";
import { synthesizeWithFonadalabs } from "./tts/fonadalabs";
import { uploadGeneratedAudio } from "./upload-audio";

export type GeneratedVoiceover = {
    audioUrl: string;
    provider: VoiceProvider;
    voiceModel: string;
    language: string;
    byteLength: number;
};

async function synthesizeVoiceover(
    provider: VoiceProvider,
    series: SeriesRecord,
    script: string
): Promise<ArrayBuffer> {
    if (provider === "fonadalab") {
        return synthesizeWithFonadalabs({
            text: script,
            voice: series.voice,
            language: series.language,
        });
    }

    return synthesizeWithDeepgram({
        text: script,
        model: series.voice,
    });
}

export async function generateVoiceoverForScript(
    series: SeriesRecord,
    script: string
): Promise<GeneratedVoiceover> {
    const trimmed = script.trim();
    if (!trimmed) {
        throw new Error("Cannot generate voiceover from an empty script");
    }

    const provider = getVoiceProviderForLanguage(series.language);
    assertVoiceMatchesProvider(series.voice, provider);

    const audioBuffer = await synthesizeVoiceover(provider, series, trimmed);
    const audioUrl = await uploadGeneratedAudio(series.id, audioBuffer);

    return {
        audioUrl,
        provider,
        voiceModel: series.voice,
        language: series.language,
        byteLength: audioBuffer.byteLength,
    };
}
