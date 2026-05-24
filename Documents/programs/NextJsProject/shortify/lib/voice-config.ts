import {
    DeepgramVoices,
    FonadalabVoices,
    Language,
} from "@/app/dashboard/create/_data/constant";

export type VoiceProvider = "deepgram" | "fonadalab";

export function getVoiceProviderForLanguage(languageCode: string): VoiceProvider {
    const lang = Language.find((l) => l.modelLangCode === languageCode);
    if (!lang) {
        throw new Error(`Unsupported language code: ${languageCode}`);
    }
    return lang.modelName === "fonadalab" ? "fonadalab" : "deepgram";
}

export function assertVoiceMatchesProvider(
    voiceId: string,
    provider: VoiceProvider
): void {
    const voices = provider === "deepgram" ? DeepgramVoices : FonadalabVoices;
    const match = voices.some((v) => v.modelName === voiceId);
    if (!match) {
        throw new Error(
            `Voice "${voiceId}" is not valid for provider ${provider}`
        );
    }
}
