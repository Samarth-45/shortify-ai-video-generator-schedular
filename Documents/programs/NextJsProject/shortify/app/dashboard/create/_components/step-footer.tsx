"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepFooterProps {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onContinue: () => void;
    canContinue: boolean;
}

export function StepFooter({
    currentStep,
    totalSteps,
    onBack,
    onContinue,
    canContinue,
}: StepFooterProps) {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between">
            {/* Back button — hidden on first step but still takes space */}
            <div>
                {!isFirstStep && (
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="h-11 px-6 gap-2 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 text-sm font-semibold"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                )}
            </div>

            {/* Continue / Finish button */}
            <Button
                onClick={onContinue}
                disabled={!canContinue}
                className="h-11 px-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-md shadow-violet-500/20 text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all gap-2"
            >
                {isLastStep ? "Finish" : "Continue"}
                {!isLastStep && <ArrowRight className="h-4 w-4" />}
            </Button>
        </div>
    );
}
