export function getAppBaseUrl(): string {
    const fromEnv =
        process.env.NEXT_PUBLIC_APP_URL ??
        process.env.APP_URL ??
        (process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : undefined);

    if (fromEnv) {
        return fromEnv.replace(/\/$/, "");
    }

    return "http://localhost:3000";
}
