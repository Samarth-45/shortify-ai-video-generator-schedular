/** Server-only secret key (sk_*) — required for POST /v1/send */
export function getPlunkSecretKey(): string | undefined {
    return process.env.PLUNK_SECRET_KEY;
}

/** Public key (pk_*) — safe for /v1/track (browser or server) */
export function getPlunkPublicKey(): string | undefined {
    return (
        process.env.PLUNK_PUBLIC_KEY ??
        process.env.NEXT_PUBLIC_PLUNK_PUBLIC_KEY
    );
}

export function isPlunkSendConfigured(): boolean {
    const secret = getPlunkSecretKey();
    return Boolean(secret?.startsWith("sk_") && process.env.PLUNK_FROM_EMAIL);
}

export function isPlunkTrackConfigured(): boolean {
    const key = getPlunkPublicKey();
    return Boolean(key?.startsWith("pk_"));
}
