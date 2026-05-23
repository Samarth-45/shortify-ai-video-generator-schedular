import type { PostgrestError } from "@supabase/supabase-js";
import type { SeriesStatus } from "@/lib/series";

/** DB may still use the old check constraint without `active`. */
export function isSeriesStatusConstraintError(
    error: PostgrestError | null
): boolean {
    if (!error) return false;
    const text = [error.message, error.details, error.hint].filter(Boolean).join(" ");
    return text.includes("series_status_check");
}

/** `scheduled` is allowed on legacy schemas and treated as active in the app. */
export function fallbackStatusIfNeeded(status: SeriesStatus): SeriesStatus {
    if (status === "active") return "scheduled";
    return status;
}
