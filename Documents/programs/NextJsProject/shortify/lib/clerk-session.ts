import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { User } from "@clerk/nextjs/server";

export async function requireUserId(): Promise<string> {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return userId;
}

/** Uses session cookie when Clerk Backend API is unreachable. */
export async function safeCurrentUser(): Promise<User | null> {
    try {
        return await currentUser();
    } catch (err) {
        console.warn(
            "[Clerk] currentUser() failed — using session only:",
            err instanceof Error ? err.message : err
        );
        return null;
    }
}
