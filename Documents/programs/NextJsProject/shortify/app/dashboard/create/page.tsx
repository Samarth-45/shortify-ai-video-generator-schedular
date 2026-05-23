"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ProgressStepper } from "./_components/progress-stepper";
import { NicheSelection } from "./_components/niche-selection";
import { LanguageVoiceSelection } from "./_components/language-voice-selection";
import { VideoStyleSelection } from "./_components/video-style-selection";
import { BackgroundMusicSelection } from "./_components/background-music-selection";
import { CaptionStyleSelection } from "./_components/caption-style-selection";
import { SeriesDetailsForm } from "./_components/series-details-form";
import { StepFooter } from "./_components/step-footer";
import {
    seriesRecordToFormData,
    type SeriesFormData,
    type SeriesRecord,
} from "@/lib/series";

export type { SeriesFormData };

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

function CreateSeriesForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<SeriesFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isLoadingSeries, setIsLoadingSeries] = useState(!!editId);
    const [loadError, setLoadError] = useState<string | null>(null);

    const isEditMode = !!editId;

    const loadSeries = useCallback(async () => {
        if (!editId) {
            setFormData(initialFormData);
            setIsLoadingSeries(false);
            setLoadError(null);
            return;
        }

        setIsLoadingSeries(true);
        setLoadError(null);

        try {
            const res = await fetch(`/api/series/${editId}`, {
                cache: "no-store",
            });
            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    typeof payload.error === "string"
                        ? payload.error
                        : "Failed to load series"
                );
            }

            const series = payload.series as SeriesRecord | undefined;
            if (!series) {
                throw new Error("Series not found");
            }

            setFormData(seriesRecordToFormData(series));
            setCurrentStep(1);
        } catch (err) {
            setLoadError(
                err instanceof Error ? err.message : "Failed to load series"
            );
            setFormData(initialFormData);
        } finally {
            setIsLoadingSeries(false);
        }
    }, [editId]);

    useEffect(() => {
        loadSeries();
    }, [loadSeries]);

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
        setSubmitError(null);
        try {
            const url = isEditMode ? `/api/series/${editId}` : "/api/series";
            const method = isEditMode ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    typeof payload.error === "string"
                        ? payload.error
                        : isEditMode
                          ? "Failed to update series"
                          : "Failed to schedule series"
                );
            }

            router.push(
                isEditMode ? "/dashboard?updated=1" : "/dashboard?created=1"
            );
        } catch (err) {
            console.error("Failed to save series:", err);
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : isEditMode
                      ? "Failed to update series"
                      : "Failed to schedule series"
            );
            setIsSubmitting(false);
        }
    };

    const canContinue = (() => {
        switch (currentStep) {
            case 1:
                return !!formData.niche;
            case 2:
                return !!formData.language && !!formData.voice;
            case 3:
                return !!formData.videoStyle;
            case 4:
                return formData.backgroundMusic.length > 0;
            case 5:
                return !!formData.captionStyle;
            case 6:
                return false;
            default:
                return false;
        }
    })();

    const isLastStep = currentStep === TOTAL_STEPS;

    if (isLoadingSeries) {
        return (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-sm text-gray-500">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-violet-600" />
                Loading series…
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {loadError}
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                </Link>
            </div>
        );
    }

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
                        {isEditMode ? "Edit Series" : "Create New Series"}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {isEditMode
                            ? "Update your series settings across all steps"
                            : "Set up your AI-generated video series in a few simple steps"}
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
                        onSelectLanguage={(lang) =>
                            updateFormData("language", lang)
                        }
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
                        onSelect={(style) =>
                            updateFormData("captionStyle", style)
                        }
                    />
                )}

                {currentStep === 6 && submitError && (
                    <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {submitError}
                    </p>
                )}

                {currentStep === 6 && (
                    <SeriesDetailsForm
                        seriesName={formData.seriesName}
                        videoDuration={formData.videoDuration}
                        platforms={formData.platforms}
                        publishTime={formData.publishTime}
                        onSeriesNameChange={(name) =>
                            updateFormData("seriesName", name)
                        }
                        onVideoDurationChange={(d) =>
                            updateFormData("videoDuration", d)
                        }
                        onTogglePlatform={togglePlatform}
                        onPublishTimeChange={(t) =>
                            updateFormData("publishTime", t)
                        }
                        onSchedule={handleSubmit}
                        isSubmitting={isSubmitting}
                        isEditMode={isEditMode}
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

export default function CreateSeriesPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-violet-600" />
                    Loading…
                </div>
            }
        >
            <CreateSeriesForm />
        </Suspense>
    );
}
