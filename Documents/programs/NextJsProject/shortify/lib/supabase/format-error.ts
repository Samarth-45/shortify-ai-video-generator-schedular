import type { PostgrestError } from "@supabase/supabase-js";

export function formatSupabaseError(error: PostgrestError | null): string {
    if (!error) return "Unknown Supabase error";

    if (error.message?.includes("fetch failed")) {
        return (
            "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local " +
            "(Project Settings → API → Project URL). The project may be paused, deleted, or the URL may be wrong."
        );
    }

    const message = [error.message, error.details, error.hint]
        .filter(Boolean)
        .join(" — ");

    if (message.includes("series_status_check")) {
        return (
            message +
            " — Run supabase/migrations/20260523120600_add_active_series_status.sql in the Supabase SQL Editor."
        );
    }

    return message;
}
