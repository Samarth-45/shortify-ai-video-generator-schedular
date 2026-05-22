"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSupabaseError } from "@/lib/supabase/format-error";

export async function syncUserToSupabase() {
    const user = await currentUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    let supabase;
    try {
        supabase = createAdminClient();
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Supabase not configured",
        };
    }

    // Check if user already exists (id = Clerk user id)
    const { data: existingUser, error: lookupError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (lookupError) {
        return { success: false, error: formatSupabaseError(lookupError) };
    }

    if (existingUser) {
        return { success: true, message: "User already exists" };
    }

    // Insert new user
    const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || "User";
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
        return { success: false, error: "No email found" };
    }

    const { error: insertError } = await supabase.from("users").insert({
        id: user.id,
        name,
        email,
    });

    if (insertError) {
        return { success: false, error: formatSupabaseError(insertError) };
    }

    return { success: true, message: "User created" };
}
