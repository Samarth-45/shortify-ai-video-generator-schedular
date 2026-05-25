import { ApiError, GoogleGenAI } from "@google/genai";
import { NonRetriableError, RetryAfterError } from "inngest";
import type { SeriesRecord } from "@/lib/series";
import { getVideoStyleById } from "@/lib/video-style";
import {
    formatNicheForPrompt,
    geminiVideoScriptResponseSchema,
    generatedVideoScriptSchema,
    getImagePromptCountRange,
    type GeneratedVideoScript,
} from "./script-schema";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

/** Maps friendly names to official Gemini API model IDs */
const GEMINI_MODEL_ALIASES: Record<string, string> = {
    "gemini-3.5-flash": "gemini-3.5-flash",
    "gemini-3.1-pro": "gemini-3.1-pro-preview",
    "gemini-3.1-pro-preview": "gemini-3.1-pro-preview",
};

function resolveGeminiModel(): string {
    const configured = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    return GEMINI_MODEL_ALIASES[configured] ?? configured;
}

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY is not set. Add it to .env.local to generate video scripts."
        );
    }

    return new GoogleGenAI({ apiKey });
}

function buildScriptPrompt(series: SeriesRecord): string {
    const style = getVideoStyleById(series.videoStyle);
    const { min, max, label } = getImagePromptCountRange(series.videoDuration);
    const niche = formatNicheForPrompt(series.niche);

    return `You are an expert short-form video scriptwriter for social media (YouTube Shorts, Instagram Reels).

Create a complete video package for this series:

Series name: ${series.seriesName}
Niche / topic: ${niche}
Target duration: ${label} (${series.videoDuration})
Visual style: ${style?.label ?? series.videoStyle}
Language code: ${series.language}

Requirements:
1. Write a natural, conversational voiceover script that sounds spoken aloud — no bullet points, no markdown, no scene labels inside the script, no hashtags.
2. Match pacing to the target duration (roughly 75–90 words for 30–50 sec, 130–160 words for 60–70 sec).
3. Hook the viewer in the first 2 seconds.
4. Provide a catchy video title (under 70 characters).
5. Provide exactly ${min} to ${max} image prompts — one per scene. Each prompt must describe a single visual frame in ${style?.label ?? series.videoStyle} style, tied to the script, suitable for AI image generation. Include subject, setting, lighting, and mood.
6. Image prompts MUST be family-friendly and pass strict AI safety filters: no violence, weapons, blood, injury, nudity, drugs, hate, political conflict, real celebrities, or readable text/watermarks. Prefer landscapes, objects, animals, or stylized characters in wholesome everyday settings.

Return ONLY valid JSON matching the schema. No markdown fences, no commentary.`;
}

function parseGeminiJson(text: string): unknown {
    const trimmed = text.trim();
    const withoutFences = trimmed
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    return JSON.parse(withoutFences);
}

function buildMockScript(series: SeriesRecord): GeneratedVideoScript {
    const { min } = getImagePromptCountRange(series.videoDuration);
    const style = getVideoStyleById(series.videoStyle);
    const niche = formatNicheForPrompt(series.niche);

    const imagePrompts = Array.from({ length: min }, (_, i) => ({
        scene: i + 1,
        prompt: `${style?.label ?? series.videoStyle} scene ${i + 1} about ${niche}, cinematic lighting`,
    }));

    return {
        title: `${series.seriesName} — Episode 1`,
        script: `Did you know this one fact about ${niche}? Here is something most people miss. Let me break it down in seconds so you can use it today. Follow for more ${series.seriesName} videos.`,
        imagePrompts,
    };
}

function handleGeminiApiError(err: unknown): never {
    if (!(err instanceof ApiError) || err.status !== 429) {
        throw err;
    }

    const message = err.message;
    const retryMatch = message.match(/retry in ([\d.]+)s/i);
    const dailyQuotaExceeded =
        message.includes("PerDay") || message.includes("limit: 0");

    if (dailyQuotaExceeded) {
        throw new NonRetriableError(
            [
                "Gemini free-tier quota exceeded for this model/API key.",
                "Wait for the daily reset, enable billing at https://aistudio.google.com/apikey,",
                "try GEMINI_MODEL=gemini-3.5-flash, or set GEMINI_USE_MOCK=1 for local testing.",
            ].join(" ")
        );
    }

    const retryMs = retryMatch
        ? Math.ceil(parseFloat(retryMatch[1]) * 1000) + 2000
        : 60_000;

    throw new RetryAfterError(
        `Gemini rate limit — retrying in ${Math.round(retryMs / 1000)}s.`,
        retryMs,
        { cause: err }
    );
}

export async function generateVideoScriptWithGemini(
    series: SeriesRecord
): Promise<GeneratedVideoScript> {
    if (process.env.GEMINI_USE_MOCK === "1") {
        console.warn("[Gemini] GEMINI_USE_MOCK=1 — returning placeholder script.");
        return buildMockScript(series);
    }

    const ai = getGeminiClient();
    const model = resolveGeminiModel();
    const { min, max } = getImagePromptCountRange(series.videoDuration);

    let response;
    try {
        response = await ai.models.generateContent({
            model,
            contents: buildScriptPrompt(series),
            config: {
                responseMimeType: "application/json",
                responseSchema: geminiVideoScriptResponseSchema,
                temperature: 0.8,
            },
        });
    } catch (err) {
        handleGeminiApiError(err);
    }

    const rawText = response!.text;
    if (!rawText) {
        throw new Error("Gemini returned an empty response for video script");
    }

    let parsed: unknown;
    try {
        parsed = parseGeminiJson(rawText);
    } catch {
        throw new Error("Gemini response was not valid JSON");
    }

    const result = generatedVideoScriptSchema.parse(parsed);

    if (result.imagePrompts.length < min || result.imagePrompts.length > max) {
        throw new Error(
            `Expected ${min}-${max} image prompts, got ${result.imagePrompts.length}`
        );
    }

    return result;
}
