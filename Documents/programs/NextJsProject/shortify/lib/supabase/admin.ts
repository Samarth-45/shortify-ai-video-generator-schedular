import { createClient } from "@supabase/supabase-js";

// Admin client using service role key — bypasses Row Level Security
// Only use server-side (API routes, webhooks, server actions)
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error(
            "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
        );
    }

    return createClient(url, serviceRoleKey);
}
