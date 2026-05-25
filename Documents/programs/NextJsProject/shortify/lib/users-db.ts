import { createAdminClient } from "@/lib/supabase/admin";
import { formatSupabaseError } from "@/lib/supabase/format-error";

export async function fetchUserEmailByClerkId(
    clerkUserId: string
): Promise<string | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", clerkUserId)
        .maybeSingle();

    if (error) {
        throw new Error(formatSupabaseError(error));
    }

    return (data?.email as string | undefined) ?? null;
}

export async function fetchUserNameByClerkId(
    clerkUserId: string
): Promise<string | null> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("id", clerkUserId)
        .maybeSingle();

    if (error) {
        throw new Error(formatSupabaseError(error));
    }

    return (data?.name as string | undefined) ?? null;
}
