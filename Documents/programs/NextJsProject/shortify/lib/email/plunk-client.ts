import { getPlunkSecretKey, isPlunkSendConfigured } from "./plunk-keys";

const PLUNK_API_URL = "https://next-api.useplunk.com/v1/send";

export type PlunkSendInput = {
    to: string;
    toName?: string;
    subject: string;
    body: string;
    templateId?: string;
};

/** @deprecated Use isPlunkSendConfigured */
export function isPlunkConfigured(): boolean {
    return isPlunkSendConfigured();
}

function assertPlunkSendConfig(secretKey: string | undefined): void {
    if (!secretKey) {
        throw new Error("PLUNK_SECRET_KEY is not configured");
    }
    if (secretKey.startsWith("pk_")) {
        throw new Error(
            "PLUNK_SECRET_KEY must be sk_* (secret). Put pk_* in PLUNK_PUBLIC_KEY instead."
        );
    }
    if (!secretKey.startsWith("sk_")) {
        throw new Error(
            "PLUNK_SECRET_KEY should start with sk_. Check Plunk → Settings → API Keys."
        );
    }
    if (!process.env.PLUNK_FROM_EMAIL) {
        throw new Error(
            "PLUNK_FROM_EMAIL is not configured. Use an address on a domain verified in Plunk."
        );
    }
}

export async function sendPlunkEmail(input: PlunkSendInput): Promise<void> {
    const secretKey = getPlunkSecretKey();
    assertPlunkSendConfig(secretKey);

    const fromEmail = process.env.PLUNK_FROM_EMAIL!;

    const fromName = process.env.PLUNK_FROM_NAME ?? "Shortify";

    const payload: Record<string, unknown> = {
        to: input.toName
            ? { name: input.toName, email: input.to }
            : input.to,
        from: { name: fromName, email: fromEmail },
        subject: input.subject,
        body: input.body,
    };

    if (input.templateId) {
        payload.template = input.templateId;
    }

    const response = await fetch(PLUNK_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const details = await response.text().catch(() => "");
        throw new Error(
            `Plunk send failed (${response.status}): ${details.slice(0, 500)}`
        );
    }
}
