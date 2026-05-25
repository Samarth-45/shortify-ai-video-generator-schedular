import Replicate from "replicate";
import type { SeriesRecord } from "@/lib/series";
import { getVideoStyleById } from "@/lib/video-style";
import {
    buildMinimalScenePrompt,
    buildSafeFallbackImagePrompt,
    sanitizeImagePrompt,
} from "./imagen-prompt";
import type { GeneratedImagesResult } from "./image-schema";
import type { GeneratedVideoScript } from "./script-schema";
import { formatNicheForPrompt } from "./script-schema";
import { persistRemoteImage } from "./upload-image";

const DEFAULT_IMAGEN_MODEL = "google/imagen-4";
const DEFAULT_FLUX_MODEL = "black-forest-labs/flux-schnell";

/** Stock fallbacks when all models block (vertical-friendly). */
const STOCK_SCENE_URLS = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&h=1920&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1920&fit=crop",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&h=1920&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&h=1920&fit=crop",
    "https://images.unsplash.com/photo-1518173946547-0a477e436987?w=1080&h=1920&fit=crop",
    "https://images.unsplash.com/photo-1426604966848-d7adaba47659?w=1080&h=1920&fit=crop",
];

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

const SAFETY_LEVELS: SafetyLevel[] = [
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

function getAspectRatio(): string {
    return process.env.REPLICATE_ASPECT_RATIO ?? "9:16";
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

function isNetworkError(err: unknown): boolean {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("fetch failed")) {
        return true;
    }
    const cause = err instanceof Error ? err.cause : undefined;
    if (!cause || typeof cause !== "object") {
        return false;
    }
    const code =
        "code" in cause && typeof cause.code === "string" ? cause.code : "";
    return (
        code === "EHOSTUNREACH" ||
        code === "ECONNREFUSED" ||
        code === "ETIMEDOUT" ||
        code === "ENOTFOUND"
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
        aspect_ratio: getAspectRatio(),
        safety_filter_level: safetyFilterLevel,
        output_format: "jpg",
    };
}

function buildScenePrompt(series: SeriesRecord, prompt: string): string {
    const style = getVideoStyleById(series.videoStyle);
    const styled = style
        ? `${prompt}. Visual style: ${style.label}, scenic background, no text, no logos.`
        : prompt;
    return sanitizeImagePrompt(styled);
}

async function runReplicateModel(
    replicate: Replicate,
    model: string,
    input: Record<string, unknown>
): Promise<string> {
    try {
        const output = await replicate.run(model, { input });
        return resolveReplicateOutputUrl(output);
    } catch (err) {
        if (isNetworkError(err)) {
            throw new Error(
                "Cannot reach Replicate API (network error). Check internet/VPN, or add a payment method at replicate.com/account/billing to avoid rate limits.",
                { cause: err }
            );
        }
        throw err;
    }
}

async function tryImagen(
    replicate: Replicate,
    prompt: string
): Promise<string | null> {
    const model = process.env.REPLICATE_IMAGE_MODEL ?? DEFAULT_IMAGEN_MODEL;

    for (const safetyFilterLevel of SAFETY_LEVELS) {
        try {
            return await runReplicateModel(
                replicate,
                model,
                buildImagenInput(prompt, safetyFilterLevel) as Record<
                    string,
                    unknown
                >
            );
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (!isBlockedImageError(message)) {
                console.warn(`[generate-images] Imagen error (${model}):`, message);
                return null;
            }
        }
    }

    return null;
}

async function tryFlux(replicate: Replicate, prompt: string): Promise<string | null> {
    const model =
        process.env.REPLICATE_FALLBACK_IMAGE_MODEL ?? DEFAULT_FLUX_MODEL;
    const aspect = getAspectRatio();

    try {
        return await runReplicateModel(replicate, model, {
            prompt: prompt.slice(0, 2000),
            aspect_ratio: aspect,
            num_outputs: 1,
            output_format: "webp",
            output_quality: 90,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[generate-images] Fallback model (${model}) failed:`, message);
        return null;
    }
}

function getStockPlaceholderUrl(sceneNumber: number): string {
    const index = (sceneNumber - 1) % STOCK_SCENE_URLS.length;
    return STOCK_SCENE_URLS[index];
}

async function generateSceneImage(
    replicate: Replicate,
    series: SeriesRecord,
    sceneNumber: number,
    prompt: string
): Promise<{ remoteUrl: string; usedPlaceholder: boolean }> {
    const style = getVideoStyleById(series.videoStyle);
    const niche = formatNicheForPrompt(series.niche);

    const promptVariants = [
        buildScenePrompt(series, prompt),
        buildSafeFallbackImagePrompt(
            niche,
            style?.label ?? series.videoStyle,
            sceneNumber
        ),
        buildMinimalScenePrompt(sceneNumber),
    ];

    for (const variant of promptVariants) {
        try {
            const imagenUrl = await tryImagen(replicate, variant);
            if (imagenUrl) {
                return { remoteUrl: imagenUrl, usedPlaceholder: false };
            }

            const fluxUrl = await tryFlux(replicate, variant);
            if (fluxUrl) {
                console.info(
                    `[generate-images] Scene ${sceneNumber}: used Flux fallback after Imagen blocked`
                );
                return { remoteUrl: fluxUrl, usedPlaceholder: false };
            }
        } catch (err) {
            if (isNetworkError(err)) {
                console.warn(
                    `[generate-images] Scene ${sceneNumber}: Replicate unreachable — using stock placeholder`
                );
                break;
            }
            throw err;
        }
    }

    const stockUrl = getStockPlaceholderUrl(sceneNumber);
    console.warn(
        `[generate-images] Scene ${sceneNumber}: all models blocked — using stock placeholder`
    );
    return { remoteUrl: stockUrl, usedPlaceholder: true };
}

export async function generateImagesFromScript(
    series: SeriesRecord,
    script: GeneratedVideoScript
): Promise<GeneratedImagesResult> {
    const replicate = getReplicateClient();
    const scenes: GeneratedImagesResult["scenes"] = [];
    let placeholderCount = 0;

    for (const { scene, prompt } of script.imagePrompts) {
        const { remoteUrl, usedPlaceholder } = await generateSceneImage(
            replicate,
            series,
            scene,
            prompt
        );
        if (usedPlaceholder) placeholderCount++;

        const imageUrl = await persistRemoteImage(series.id, scene, remoteUrl);
        scenes.push({ scene, prompt, imageUrl });
    }

    if (placeholderCount > 0) {
        console.warn(
            `[generate-images] ${placeholderCount}/${script.imagePrompts.length} scenes used stock placeholders. Consider a gentler niche or simpler style.`
        );
    }

    return { scenes };
}
