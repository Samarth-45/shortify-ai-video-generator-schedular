"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProgressStepper } from "./_components/progress-stepper";
import { NicheSelection } from "./_components/niche-selection";
import { LanguageVoiceSelection } from "./_components/language-voice-selection";
import { VideoStyleSelection } from "./_components/video-style-selection";
import { BackgroundMusicSelection } from "./_components/background-music-selection";
import { CaptionStyleSelection } from "./_components/caption-style-selection";
import { SeriesDetailsForm } from "./_components/series-details-form";
import { StepFooter } from "./_components/step-footer";

// ── Global form state for all steps ──
export interface SeriesFormData {
    niche: string | null;
    language: string | null;
    voice: string | null;
    videoStyle: string | null;
    backgroundMusic: string[];
    captionStyle: string | null;
    seriesName: string;
    videoDuration: string | null;
    platforms: string[];
    publishTime: string | null;
}

const TOTAL_STEPS = 6;

const initialFormData: SeriesFormData = {
    niche: null,
    language: null,
    voice: null,
    videoStyle: null,
    backgroundMusic: [],
    captionStyle: null,
    seriesName: "",
    videoDuration: null,
    platforms: [],
    publishTime: null,
};

export default function CreateSeriesPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<SeriesFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateFormData = <K extends keyof SeriesFormData>(
        key: K,
        value: SeriesFormData[K]
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const toggleBackgroundMusic = (trackId: string) => {
        setFormData((prev) => {
            const selected = prev.backgroundMusic.includes(trackId)
                ? prev.backgroundMusic.filter((id) => id !== trackId)
                : [...prev.backgroundMusic, trackId];
            return { ...prev, backgroundMusic: selected };
        });
    };

    const togglePlatform = (platformId: string) => {
        setFormData((prev) => {
            const selected = prev.platforms.includes(platformId)
                ? prev.platforms.filter((id) => id !== platformId)
                : [...prev.platforms, platformId];
            return { ...prev, platforms: selected };
        });
    };

    const handleContinue = () => {
        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // TODO: call API route to save series to Supabase
            await new Promise((res) => setTimeout(res, 1500));
            router.push("/dashboard?created=1");
        } catch (err) {
            console.error("Failed to create series:", err);
            setIsSubmitting(false);
        }
    };

    const canContinue = (() => {
        switch (currentStep) {
            case 1: return !!formData.niche;
            case 2: return !!formData.language && !!formData.voice;
            case 3: return !!formData.videoStyle;
            case 4: return formData.backgroundMusic.length > 0;
            case 5: return !!formData.captionStyle;
            case 6: return false; // final step uses Schedule button
            default: return false;
        }
    })();

    const isLastStep = currentStep === TOTAL_STEPS;

    return (
        <div className="min-h-[calc(100vh-4rem)] pb-12">
            <div className="mb-8 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        Create New Series
                    </h1>
                    <p className="text-sm text-gray-500">
                        Set up your AI-generated video series in a few simple steps
                    </p>
                </div>
            </div>

            <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <ProgressStepper currentStep={currentStep} />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                {currentStep === 1 && (
                    <NicheSelection
                        selectedNiche={formData.niche}
                        onSelect={(niche) => updateFormData("niche", niche)}
                    />
                )}

                {currentStep === 2 && (
                    <LanguageVoiceSelection
                        selectedLanguage={formData.language}
                        selectedVoice={formData.voice}
                        onSelectLanguage={(lang) => updateFormData("language", lang)}
                        onSelectVoice={(voice) => updateFormData("voice", voice)}
                    />
                )}

                {currentStep === 3 && (
                    <VideoStyleSelection
                        currentStep={currentStep}
                        totalSteps={TOTAL_STEPS}
                        selectedStyle={formData.videoStyle}
                        onSelect={(style) => updateFormData("videoStyle", style)}
                    />
                )}

                {currentStep === 4 && (
                    <BackgroundMusicSelection
                        selectedTracks={formData.backgroundMusic}
                        onToggleTrack={toggleBackgroundMusic}
                    />
                )}

                {currentStep === 5 && (
                    <CaptionStyleSelection
                        selectedStyle={formData.captionStyle}
                        onSelect={(style) => updateFormData("captionStyle", style)}
                    />
                )}

                {currentStep === 6 && (
                    <SeriesDetailsForm
                        seriesName={formData.seriesName}
                        videoDuration={formData.videoDuration}
                        platforms={formData.platforms}
                        publishTime={formData.publishTime}
                        onSeriesNameChange={(name) => updateFormData("seriesName", name)}
                        onVideoDurationChange={(d) => updateFormData("videoDuration", d)}
                        onTogglePlatform={togglePlatform}
                        onPublishTimeChange={(t) => updateFormData("publishTime", t)}
                        onSchedule={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>

            {!isLastStep && (
                <StepFooter
                    currentStep={currentStep}
                    totalSteps={TOTAL_STEPS}
                    onBack={handleBack}
                    onContinue={handleContinue}
                    canContinue={canContinue}
                />
            )}

            {isLastStep && (
                <div className="mt-6 flex justify-start">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                </div>
            )}
        </div>
    );
}
