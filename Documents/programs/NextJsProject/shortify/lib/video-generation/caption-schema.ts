import { z } from "zod";

export const captionWordSchema = z.object({
    word: z.string(),
    start: z.number(),
    end: z.number(),
});

export const captionCueSchema = z.object({
    text: z.string(),
    start: z.number(),
    end: z.number(),
    words: z.array(captionWordSchema),
});

export const timedCaptionsSchema = z.object({
    styleId: z.string(),
    durationSeconds: z.number(),
    cues: z.array(captionCueSchema),
});

export type CaptionWord = z.infer<typeof captionWordSchema>;
export type CaptionCue = z.infer<typeof captionCueSchema>;
export type TimedCaptions = z.infer<typeof timedCaptionsSchema>;
