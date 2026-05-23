"use client";

import { useState, useRef } from "react";
import { Play, Pause, User, Check } from "lucide-react";
import {
    Language,
    DeepgramVoices,
    FonadalabVoices,
    type VoiceType,
} from "../_data/constant";

interface LanguageVoiceSelectionProps {
    selectedLanguage: string | null;
    selectedVoice: string | null;
    onSelectLanguage: (langCode: string) => void;
    onSelectVoice: (voiceName: string) => void;
}

export function LanguageVoiceSelection({
    selectedLanguage,
    selectedVoice,
    onSelectLanguage,
    onSelectVoice,
}: LanguageVoiceSelectionProps) {
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Get the selected language's model to determine which voices to show
    const selectedLangObj = Language.find(
        (l) => l.modelLangCode === selectedLanguage
    );
    const voiceModel = selectedLangObj?.modelName;

    const voices: VoiceType[] =
        voiceModel === "deepgram"
            ? DeepgramVoices
            : voiceModel === "fonadalab"
                ? FonadalabVoices
                : [];

    const handlePlayPreview = (voice: VoiceType) => {
        setPreviewError(null);

        // If currently playing this voice, stop it
        if (playingVoice === voice.modelName) {
            audioRef.current?.pause();
            audioRef.current = null;
            setPlayingVoice(null);
            return;
        }

        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // For fonadalab voices, try static file first, then fallback to live TTS
        const playStaticPreview = () => {
            const audio = new Audio('/voice/' + voice.preview);
            audio.onended = () => {
                setPlayingVoice(null);
                audioRef.current = null;
            };
            audio.onerror = () => {
                // Fallback: try live TTS preview via API for fonadalab voices
                if (voice.model === "fonadalab" && selectedLanguage) {
                    playLiveTTSPreview(voice);
                } else {
                    setPlayingVoice(null);
                    setPreviewError(voice.modelName);
                    audioRef.current = null;
                    setTimeout(() => setPreviewError(null), 3000);
                }
            };
            audio.play().catch(() => {
                if (voice.model === "fonadalab" && selectedLanguage) {
                    playLiveTTSPreview(voice);
                } else {
                    setPlayingVoice(null);
                    setPreviewError(voice.modelName);
                    setTimeout(() => setPreviewError(null), 3000);
                }
            });
            audioRef.current = audio;
            setPlayingVoice(voice.modelName);
        };

        playStaticPreview();
    };

    // Live TTS preview via Fonado Labs API
    const playLiveTTSPreview = async (voice: VoiceType) => {
        try {
            // Sample text in the selected language for preview
            const sampleTexts: Record<string, string> = {
                "hi-IN": "नमस्ते, मैं आपका AI सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?",
                "mr-IN": "नमस्कार, मी तुमचा AI सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
                "te-IN": "నమస్కారం, నేను మీ AI సహాయకుడిని. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను?",
                "ta-IN": "வணக்கம், நான் உங்கள் AI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
                "kn-IN": "ನಮಸ್ಕಾರ, ನಾನು ನಿಮ್ಮ AI ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
                "bn-IN": "নমস্কার, আমি আপনার AI সহায়ক। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
                "gu-IN": "નમસ્તે, હું તમારો AI સહાયક છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?",
                "ml-IN": "നമസ്കാരം, ഞാൻ നിങ്ങളുടെ AI സഹായിയാണ്. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
            };

            const text = sampleTexts[selectedLanguage ?? ""] ?? sampleTexts["hi-IN"];

            const response = await fetch("/api/tts/fonadalabs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    voice: voice.modelName,
                    language: selectedLanguage,
                }),
            });

            if (!response.ok) {
                throw new Error("TTS API failed");
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onended = () => {
                setPlayingVoice(null);
                audioRef.current = null;
                URL.revokeObjectURL(audioUrl);
            };
            audio.onerror = () => {
                setPlayingVoice(null);
                setPreviewError(voice.modelName);
                audioRef.current = null;
                URL.revokeObjectURL(audioUrl);
                setTimeout(() => setPreviewError(null), 3000);
            };

            await audio.play();
            audioRef.current = audio;
        } catch {
            setPlayingVoice(null);
            setPreviewError(voice.modelName);
            setTimeout(() => setPreviewError(null), 3000);
        }
    };

    return (
        <div className="mx-auto max-w-3xl">
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                    Language & Voice Selection
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Choose a language for your video narration, then pick a voice.
                </p>
            </div>

            {/* Language Selection */}
            <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Select Language
                </label>
                <div className="h-[220px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm custom-scrollbar">
                    <div className="grid grid-cols-2 gap-2">
                        {Language.map((lang) => {
                            const isSelected = selectedLanguage === lang.modelLangCode;

                            return (
                                <button
                                    key={lang.modelLangCode}
                                    onClick={() => {
                                        onSelectLanguage(lang.modelLangCode);
                                        // Reset voice when language changes
                                        onSelectVoice("");
                                    }}
                                    className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200
                    ${isSelected
                                            ? "border-violet-300 bg-violet-50 shadow-sm"
                                            : "border-transparent hover:bg-gray-50"
                                        }`}
                                >
                                    <span className="text-2xl">{lang.countryFlag}</span>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-[0.9rem] font-semibold ${isSelected ? "text-violet-700" : "text-gray-700"
                                                }`}
                                        >
                                            {lang.language}
                                        </p>
                                        <p className="text-[0.7rem] text-gray-400 uppercase tracking-wide">
                                            {lang.modelName} · {lang.modelLangCode}
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Voice Selection — appears after language is selected */}
            {selectedLanguage && voices.length > 0 && (
                <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-700">
                        Select Voice
                        <span className="ml-2 text-xs font-normal text-gray-400">
                            ({voiceModel} model · {voices.length} voices)
                        </span>
                    </label>
                    <div className="h-[300px] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm custom-scrollbar">
                        <div className="space-y-2">
                            {voices.map((voice) => {
                                const isSelected = selectedVoice === voice.modelName;
                                const isPlaying = playingVoice === voice.modelName;

                                const hasError = previewError === voice.modelName;

                                return (
                                    <div
                                        key={voice.modelName}
                                        onClick={() => onSelectVoice(voice.modelName)}
                                        className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-4 text-left transition-all duration-200 cursor-pointer
                      ${isSelected
                                                ? "border-violet-300 bg-violet-50 shadow-sm"
                                                : "border-transparent hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* Avatar / Gender Icon */}
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${voice.gender === "female"
                                                ? "bg-pink-50"
                                                : "bg-blue-50"
                                                }`}
                                        >
                                            <User
                                                className={`h-5 w-5 ${voice.gender === "female"
                                                    ? "text-pink-500"
                                                    : "text-blue-500"
                                                    }`}
                                            />
                                        </div>

                                        {/* Voice Info */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-[0.925rem] font-semibold capitalize ${isSelected ? "text-gray-900" : "text-gray-700"
                                                    }`}
                                            >
                                                {voice.modelName.replace(/-/g, " ")}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${voice.gender === "female"
                                                        ? "bg-pink-100 text-pink-600"
                                                        : "bg-blue-100 text-blue-600"
                                                        }`}
                                                >
                                                    {voice.gender}
                                                </span>
                                                <span className="text-[0.7rem] text-gray-400">
                                                    {voice.model}
                                                </span>
                                                {hasError && (
                                                    <span className="text-[0.65rem] text-red-500 font-medium">
                                                        Audio not found
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Preview Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePlayPreview(voice);
                                            }}
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${hasError
                                                ? "bg-red-100 text-red-500"
                                                : isPlaying
                                                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                            title={hasError ? "Audio file not found" : isPlaying ? "Pause preview" : "Play preview"}
                                        >
                                            {isPlaying ? (
                                                <Pause className="h-4 w-4" />
                                            ) : (
                                                <Play className="h-4 w-4 ml-0.5" />
                                            )}
                                        </button>

                                        {/* Selection indicator */}
                                        <div
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200
                        ${isSelected
                                                    ? "border-violet-600 bg-violet-600"
                                                    : "border-gray-200 bg-white"
                                                }`}
                                        >
                                            {isSelected && (
                                                <Check className="h-3 w-3 text-white" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Prompt to select language */}
            {!selectedLanguage && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                    <p className="text-sm text-gray-400">
                        Select a language above to see available voices
                    </p>
                </div>
            )}
        </div>
    );
}
