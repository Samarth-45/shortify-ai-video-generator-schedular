import { getPlunkPublicKey, getPlunkSecretKey } from "./plunk-keys";

const PLUNK_TRACK_URL = "https://next-api.useplunk.com/v1/track";

export type PlunkTrackInput = {
    email: string;
    event: string;
    data?: Record<string, unknown>;
};

/**
 * Records a Plunk contact event. Uses public key (pk_*) when set;
 * falls back to secret key (sk_*) if only that is configured.
 */
export async function trackPlunkEvent(input: PlunkTrackInput): Promise<void> {
    const publicKey = getPlunkPublicKey();
    const secretKey = getPlunkSecretKey();
    const apiKey = publicKey?.startsWith("pk_")
        ? publicKey
        : secretKey?.startsWith("sk_")
          ? secretKey
          : undefined;

    if (!apiKey) {
        throw new Error(
            "Plunk track is not configured. Set PLUNK_PUBLIC_KEY (pk_*) or PLUNK_SECRET_KEY (sk_*)."
        );
    }

    const response = await fetch(PLUNK_TRACK_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: input.email,
            event: input.event,
            data: input.data ?? {},
        }),
    });

    if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(
            `Plunk track failed (${response.status}): ${details.slice(0, 500)}`
        );
    }
}
