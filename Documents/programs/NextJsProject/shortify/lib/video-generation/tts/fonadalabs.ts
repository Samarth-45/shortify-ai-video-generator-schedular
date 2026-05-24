const FONADALABS_API_URL = "https://api.fonadalabs.ai/v1/tts/synthesize";

async function extractAudioFromJsonResponse(response: Response): Promise<ArrayBuffer> {
    const payload = await response.json();
    const audioUrl: string | undefined =
        payload?.data?.audio_url ?? payload?.audio_url ?? payload?.url;
    const audioBase64: string | undefined =
        payload?.data?.audio_base64 ?? payload?.audio_base64 ?? payload?.audio;

    if (audioUrl) {
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            throw new Error("Failed to fetch generated audio file from FonadaLabs");
        }
        return audioResponse.arrayBuffer();
    }

    if (audioBase64) {
        return Uint8Array.from(Buffer.from(audioBase64, "base64")).buffer;
    }

    throw new Error("FonadaLabs returned an unexpected response payload");
}

export type FonadalabsTtsInput = {
    text: string;
    voice: string;
    language: string;
};

export async function synthesizeWithFonadalabs(
    input: FonadalabsTtsInput
): Promise<ArrayBuffer> {
    const apiKey = process.env.FONADALABS_API_KEY;
    if (!apiKey) {
        throw new Error(
            "FONADALABS_API_KEY is not set. Add it to .env.local for Indian-language TTS."
        );
    }

    const response = await fetch(FONADALABS_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json, audio/mpeg, audio/wav",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            text: input.text,
            voice: input.voice,
            language: input.language,
            format: "mp3",
        }),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(
            `FonadaLabs TTS failed (${response.status}): ${details.slice(0, 500)}`
        );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.startsWith("audio/")) {
        return response.arrayBuffer();
    }

    return extractAudioFromJsonResponse(response);
}
