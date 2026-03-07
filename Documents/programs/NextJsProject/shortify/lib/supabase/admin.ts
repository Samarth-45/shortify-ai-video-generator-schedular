import { createClient } from "@supabase/supabase-js";

// Admin client using service role key — bypasses Row Level Security
// Only use server-side (API routes, webhooks, server actions)
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}
