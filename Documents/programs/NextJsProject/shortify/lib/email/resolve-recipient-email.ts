import { createClerkClient } from "@clerk/backend";
import { fetchUserEmailByClerkId } from "@/lib/users-db";

export async function resolveRecipientEmail(
    clerkUserId: string
): Promise<string | null> {
    try {
        const fromDb = await fetchUserEmailByClerkId(clerkUserId);
        if (fromDb) {
            return fromDb;
        }
    } catch (err) {
        console.warn(
            "[email] Supabase user lookup failed:",
            err instanceof Error ? err.message : err
        );
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
        return null;
    }

    try {
        const clerk = createClerkClient({ secretKey });
        const user = await clerk.users.getUser(clerkUserId);
        const primaryId = user.primaryEmailAddressId;
        const primary = user.emailAddresses.find(
            (entry) => entry.id === primaryId
        );
        return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
    } catch (err) {
        console.warn(
            "[email] Clerk user lookup failed:",
            err instanceof Error ? err.message : err
        );
        return null;
    }
}
