import { createAdminClient } from "@/lib/supabase/admin";
import { mapSeriesFromDb, type SeriesRecord, type SeriesRow } from "@/lib/series";

export async function fetchSeriesForUser(
    clerkUserId: string
): Promise<{ series: SeriesRecord[]; error: string | null }> {
    let supabase;
    try {
        supabase = createAdminClient();
    } catch (err) {
        return {
            series: [],
            error:
                err instanceof Error
                    ? err.message
                    : "Database not configured",
        };
    }

    const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("clerk_user_id", clerkUserId)
        .order("created_at", { ascending: false });

    if (error) {
        return { series: [], error: error.message };
    }

    return {
        series: (data as SeriesRow[]).map(mapSeriesFromDb),
        error: null,
    };
}

export async function fetchSeriesById(
    seriesId: string,
    clerkUserId: string
): Promise<{ series: SeriesRecord | null; error: string | null }> {
    let supabase;
    try {
        supabase = createAdminClient();
    } catch (err) {
        return {
            series: null,
            error:
                err instanceof Error
                    ? err.message
                    : "Database not configured",
        };
    }

    const { data, error } = await supabase
        .from("series")
        .select("*")
        .eq("id", seriesId)
        .eq("clerk_user_id", clerkUserId)
        .maybeSingle();

    if (error) {
        return { series: null, error: error.message };
    }

    if (!data) {
        return { series: null, error: null };
    }

    return {
        series: mapSeriesFromDb(data as SeriesRow),
        error: null,
    };
}

/** Dev-only: used when invoking the function manually from Inngest with empty payload */
export async function fetchLatestSeriesIdsForDev(): Promise<{
    seriesId: string;
    clerkUserId: string;
} | null> {
    let supabase;
    try {
        supabase = createAdminClient();
    } catch {
        return null;
    }

    const { data, error } = await supabase
        .from("series")
        .select("id, clerk_user_id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error || !data) {
        return null;
    }

    return {
        seriesId: data.id,
        clerkUserId: data.clerk_user_id,
    };
}
