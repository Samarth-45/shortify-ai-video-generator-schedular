import type { PostgrestError } from "@supabase/supabase-js";

export function formatSupabaseError(error: PostgrestError | null): string {
    if (!error) return "Unknown Supabase error";

    if (error.message?.includes("fetch failed")) {
        return (
            "Cannot reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL in .env.local " +
            "(Project Settings → API → Project URL). The project may be paused, deleted, or the URL may be wrong."
        );
    }

    return [error.message, error.details, error.hint].filter(Boolean).join(" — ");
}
