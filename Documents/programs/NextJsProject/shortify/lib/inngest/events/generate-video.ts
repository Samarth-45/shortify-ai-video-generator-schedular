import { NonRetriableError } from "inngest";
import { z } from "zod";
import { fetchLatestSeriesIdsForDev } from "@/lib/series-db";

export const generateVideoEventDataSchema = z.object({
    seriesId: z.string().uuid(),
    clerkUserId: z.string().min(1),
    videoId: z.string().uuid().optional(),
});

export type GenerateVideoEventData = z.infer<typeof generateVideoEventDataSchema>;

function stripInngestMetadata(data: unknown): unknown {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return data;
    }

    const record = data as Record<string, unknown>;
    const { _inngest: _ignored, ...rest } = record;

    return Object.keys(rest).length > 0 ? rest : data;
}

export function parseGenerateVideoEventData(
    data: unknown,
    eventName?: string
): GenerateVideoEventData {
    const parsed = generateVideoEventDataSchema.safeParse(
        stripInngestMetadata(data)
    );

    if (parsed.success) {
        return parsed.data;
    }

    const hint =
        eventName === "inngest/function.invoked"
            ? "In Inngest Dev Server → Invoke, paste under Event data:"
            : "When triggering from the app, use POST /api/series/{id}/generate.";

    throw new NonRetriableError(
        [
            "Missing or invalid seriesId / clerkUserId in event data.",
            hint,
            `Example: { "seriesId": "<uuid>", "clerkUserId": "user_..." }`,
            `Received: ${JSON.stringify(data ?? null)}`,
        ].join(" ")
    );
}

/**
 * Resolves event payload for production sends and local manual invokes.
 * In dev, empty Inngest "Invoke" uses env vars or the latest series in Supabase.
 */
export async function resolveGenerateVideoEventData(
    data: unknown,
    eventName?: string
): Promise<GenerateVideoEventData> {
    const cleaned = stripInngestMetadata(data);
    const direct = generateVideoEventDataSchema.safeParse(cleaned);
    if (direct.success) {
        return direct.data;
    }

    const isDevManualInvoke =
        process.env.NODE_ENV === "development" &&
        eventName === "inngest/function.invoked";

    if (isDevManualInvoke) {
        const envSeriesId = process.env.INNGEST_DEV_SERIES_ID;
        const envClerkUserId = process.env.INNGEST_DEV_CLERK_USER_ID;

        if (envSeriesId && envClerkUserId) {
            const fromEnv = generateVideoEventDataSchema.safeParse({
                seriesId: envSeriesId,
                clerkUserId: envClerkUserId,
            });
            if (fromEnv.success) {
                console.warn(
                    "[Inngest dev] Using INNGEST_DEV_SERIES_ID / INNGEST_DEV_CLERK_USER_ID for manual invoke."
                );
                return fromEnv.data;
            }
        }

        const latest = await fetchLatestSeriesIdsForDev();
        if (latest) {
            const fromDb = generateVideoEventDataSchema.safeParse(latest);
            if (fromDb.success) {
                console.warn(
                    `[Inngest dev] Manual invoke had empty data — using latest series ${latest.seriesId}.`
                );
                return fromDb.data;
            }
        }
    }

    return parseGenerateVideoEventData(data, eventName);
}
