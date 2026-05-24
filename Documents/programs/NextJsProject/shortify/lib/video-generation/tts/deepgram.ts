const DEEPGRAM_SPEAK_URL = "https://api.deepgram.com/v1/speak";

export type DeepgramTtsInput = {
    text: string;
    /** Aura model id, e.g. aura-2-thalia-en */
    model: string;
};

export async function synthesizeWithDeepgram(
    input: DeepgramTtsInput
): Promise<ArrayBuffer> {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
        throw new Error(
            "DEEPGRAM_API_KEY is not set. Add it to .env.local for Deepgram TTS."
        );
    }

    const url = new URL(DEEPGRAM_SPEAK_URL);
    url.searchParams.set("model", input.model);

    const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({ text: input.text }),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(
            `Deepgram TTS failed (${response.status}): ${details.slice(0, 500)}`
        );
    }

    return response.arrayBuffer();
}
