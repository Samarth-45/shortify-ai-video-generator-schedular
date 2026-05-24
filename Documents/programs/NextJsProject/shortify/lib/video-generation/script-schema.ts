import { z } from "zod";

export const generatedVideoScriptSchema = z.object({
    title: z.string().min(1),
    script: z.string().min(1),
    imagePrompts: z
        .array(
            z.object({
                scene: z.number().int().positive(),
                prompt: z.string().min(1),
            })
        )
        .min(1),
});

export type GeneratedVideoScript = z.infer<typeof generatedVideoScriptSchema>;

export const geminiVideoScriptResponseSchema = {
    type: "object",
    properties: {
        title: { type: "string", description: "Catchy short-form video title" },
        script: {
            type: "string",
            description:
                "Full voiceover script in natural spoken English, no stage directions",
        },
        imagePrompts: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    scene: { type: "integer" },
                    prompt: {
                        type: "string",
                        description:
                            "Detailed visual prompt for this scene matching the video style",
                    },
                },
                required: ["scene", "prompt"],
            },
        },
    },
    required: ["title", "script", "imagePrompts"],
} as const;

export function getImagePromptCountRange(videoDuration: string): {
    min: number;
    max: number;
    label: string;
} {
    if (videoDuration === "60-70") {
        return { min: 5, max: 6, label: "60–70 seconds" };
    }

    return { min: 4, max: 5, label: "30–50 seconds" };
}

export function formatNicheForPrompt(niche: string): string {
    if (niche.startsWith("custom:")) {
        return niche.slice("custom:".length);
    }
    return niche.replace(/-/g, " ");
}
