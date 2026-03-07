"use server";

import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function syncUserToSupabase() {
    const user = await currentUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const supabase = createAdminClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", user.id)
        .single();

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

    const { error } = await supabase.from("users").insert({
        user_id: user.id,
        name,
        email,
        credits: 0,
    });

    if (error) {
        console.error("Supabase insert error:", error);
        return { success: false, error: error.message };
    }

    console.log(`User synced to Supabase: ${email}`);
    return { success: true, message: "User created" };
}
