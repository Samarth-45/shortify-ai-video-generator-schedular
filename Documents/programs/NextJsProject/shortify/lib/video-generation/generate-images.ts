import Replicate from "replicate";
import type { SeriesRecord } from "@/lib/series";
import { getVideoStyleById } from "@/lib/video-style";
import type { GeneratedImagesResult } from "./image-schema";
import type { GeneratedVideoScript } from "./script-schema";
import { persistRemoteImage } from "./upload-image";

const DEFAULT_MODEL = "google/imagen-4";

type ImagenInput = {
    prompt: string;
    aspect_ratio: string;
    safety_filter_level: string;
    output_format: string;
};

type SafetyLevel =
    | "block_low_and_above"
    | "block_medium_and_above"
    | "block_only_high";

const SAFETY_FALLBACK_ORDER: SafetyLevel[] = [
    "block_only_high",
    "block_medium_and_above",
    "block_low_and_above",
];

function getReplicateClient() {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
        throw new Error(
            "REPLICATE_API_TOKEN is not set. Add it to .env.local for image generation."
        );
    }
    return new Replicate({ auth: token });
}

function getConfiguredSafety(): SafetyLevel {
    const level = process.env.REPLICATE_SAFETY_FILTER_LEVEL;
    if (
        level === "block_low_and_above" ||
        level === "block_medium_and_above" ||
        level === "block_only_high"
    ) {
        return level;
    }
    return "block_only_high";
}

function isBlockedImageError(message: string): boolean {
    const lower = message.toLowerCase();
    return (
        lower.includes("no image content") ||
        lower.includes("blocked") ||
        lower.includes("safety") ||
        lower.includes("rai") ||
        lower.includes("content policy")
    );
}

function resolveReplicateOutputUrl(output: unknown): string {
    if (typeof output === "string") {
        return output;
    }

    if (output && typeof output === "object") {
        if ("toString" in output && typeof output.toString === "function") {
            const asString = output.toString();
            if (asString.startsWith("http")) return asString;
        }

        if ("url" in output) {
            const urlValue = (output as { url: unknown }).url;
            if (typeof urlValue === "function") {
                const url = urlValue.call(output);
                return url instanceof URL ? url.href : String(url);
            }
            if (urlValue instanceof URL) return urlValue.href;
            if (typeof urlValue === "string") return urlValue;
        }
    }

    if (Array.isArray(output) && output.length > 0) {
        return resolveReplicateOutputUrl(output[0]);
    }

    throw new Error("Replicate returned an unexpected image output format");
}

function buildImagenInput(
    prompt: string,
    safetyFilterLevel: SafetyLevel
): ImagenInput {
    return {
        prompt: prompt.slice(0, 2000),
        aspect_ratio: process.env.REPLICATE_ASPECT_RATIO ?? "9:16",
        safety_filter_level: safetyFilterLevel,
        output_format: "jpg",
    };
}

function buildScenePrompt(series: SeriesRecord, prompt: string): string {
    const style = getVideoStyleById(series.videoStyle);
    if (!style) return prompt;
    return `${prompt}. Visual style: ${style.label}, high quality, suitable for short-form social video.`;
}

async function runImagenPrediction(
    replicate: Replicate,
    input: ImagenInput
): Promise<string> {
    const model = process.env.REPLICATE_IMAGE_MODEL ?? DEFAULT_MODEL;

    try {
        const output = await replicate.run(model, { input });
        return resolveReplicateOutputUrl(output);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(
            `Replicate ${model} failed (safety=${input.safety_filter_level}): ${message}`
        );
    }
}

async function generateSceneImage(
    replicate: Replicate,
    prompt: string
): Promise<string> {
    const configured = getConfiguredSafety();
    const attempts = [
        configured,
        ...SAFETY_FALLBACK_ORDER.filter((level) => level !== configured),
    ];

    let lastError: Error | null = null;

    for (const safetyFilterLevel of attempts) {
        try {
            return await runImagenPrediction(
                replicate,
                buildImagenInput(prompt, safetyFilterLevel)
            );
        } catch (err) {
            const error =
                err instanceof Error ? err : new Error(String(err));
            lastError = error;

            if (!isBlockedImageError(error.message)) {
                throw error;
            }
        }
    }

    throw new Error(
        [
            "Image generation was blocked for all safety levels.",
            "Try a different script/scene prompt or set REPLICATE_SAFETY_FILTER_LEVEL=block_only_high.",
            lastError?.message ?? "",
        ]
            .filter(Boolean)
            .join(" ")
    );
}

export async function generateImagesFromScript(
    series: SeriesRecord,
    script: GeneratedVideoScript
): Promise<GeneratedImagesResult> {
    const replicate = getReplicateClient();
    const scenes: GeneratedImagesResult["scenes"] = [];

    for (const { scene, prompt } of script.imagePrompts) {
        const fullPrompt = buildScenePrompt(series, prompt);
        const remoteUrl = await generateSceneImage(replicate, fullPrompt);
        const imageUrl = await persistRemoteImage(series.id, scene, remoteUrl);

        scenes.push({ scene, prompt, imageUrl });
    }

    return { scenes };
}
