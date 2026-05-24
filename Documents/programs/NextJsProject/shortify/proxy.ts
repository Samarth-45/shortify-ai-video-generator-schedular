import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/** User-facing routes — no sign-in required */
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
]);

/**
 * Internal endpoints (not app pages). Clerk webhooks and Inngest serve
 * authenticate via their own secrets, not Clerk sessions.
 */
const isSystemRoute = createRouteMatcher([
    "/api/webhooks(.*)",
    "/api/inngest",
]);

export default clerkMiddleware(async (auth, request) => {
    if (isPublicRoute(request) || isSystemRoute(request)) {
        return;
    }

    await auth.protect();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|wav|mp3|ogg|m4a)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
