"use client";

import { Check } from "lucide-react";

const steps = [
    { number: 1, label: "Niche" },
    { number: 2, label: "Language" },
    { number: 3, label: "Style" },
    { number: 4, label: "Music" },
    { number: 5, label: "Captions" },
    { number: 6, label: "Details" },
];

interface ProgressStepperProps {
    currentStep: number;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.number;
                    const isActive = currentStep === step.number;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step.number} className="flex flex-1 items-center">
                            {/* Step circle + label */}
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300
                    ${isCompleted
                                            ? "border-violet-600 bg-violet-600 text-white"
                                            : isActive
                                                ? "border-violet-600 bg-violet-50 text-violet-700 ring-4 ring-violet-100"
                                                : "border-gray-200 bg-white text-gray-400"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <span
                                    className={`mt-2 text-xs font-medium whitespace-nowrap
                    ${isCompleted
                                            ? "text-violet-600"
                                            : isActive
                                                ? "text-violet-700"
                                                : "text-gray-400"
                                        }`}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {!isLast && (
                                <div className="flex-1 px-3 -mt-5">
                                    <div className="h-[3px] w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ease-out
                        ${isCompleted
                                                    ? "w-full bg-violet-600"
                                                    : "w-0 bg-violet-600"
                                                }`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
