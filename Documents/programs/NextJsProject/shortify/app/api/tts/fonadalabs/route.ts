import { NextRequest, NextResponse } from "next/server";

const FONADALABS_API_KEY = process.env.FONADALABS_API_KEY;
const FONADALABS_API_URL = "https://api.fonadalabs.ai/v1/tts/synthesize";

async function extractAudioFromJsonResponse(response: Response) {
    const payload = await response.json();
    const audioUrl: string | undefined =
        payload?.data?.audio_url ?? payload?.audio_url ?? payload?.url;
    const audioBase64: string | undefined =
        payload?.data?.audio_base64 ?? payload?.audio_base64 ?? payload?.audio;

    if (audioUrl) {
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
            throw new Error("Failed to fetch generated audio file");
        }

        return audioResponse.arrayBuffer();
    }

    if (audioBase64) {
        return Uint8Array.from(Buffer.from(audioBase64, "base64")).buffer;
    }

    throw new Error("FonadaLabs returned an unexpected response payload");
}

export async function POST(req: NextRequest) {
    try {
        if (!FONADALABS_API_KEY) {
            return NextResponse.json(
                { error: "FonadaLabs API key not configured" },
                { status: 500 }
            );
        }

        const { text, voice, language } = await req.json();

        if (!text || !voice || !language) {
            return NextResponse.json(
                { error: "Missing required fields: text, voice, language" },
                { status: 400 }
            );
        }

        const response = await fetch(FONADALABS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json, audio/mpeg, audio/wav",
                Authorization: `Bearer ${FONADALABS_API_KEY}`,
            },
            body: JSON.stringify({
                text,
                voice,
                language,
                format: "mp3",
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("FonadaLabs API error:", response.status, errorData);
            return NextResponse.json(
                { error: "Failed to generate speech", details: errorData },
                { status: response.status }
            );
        }

        const contentType = response.headers.get("content-type") ?? "";
        const audioBuffer = contentType.startsWith("audio/")
            ? await response.arrayBuffer()
            : await extractAudioFromJsonResponse(response);

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error("TTS generation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
