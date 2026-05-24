import { NextRequest, NextResponse } from "next/server";
import { synthesizeWithFonadalabs } from "@/lib/video-generation/tts/fonadalabs";

export async function POST(req: NextRequest) {
    try {
        const { text, voice, language } = await req.json();

        if (!text || !voice || !language) {
            return NextResponse.json(
                { error: "Missing required fields: text, voice, language" },
                { status: 400 }
            );
        }

        const audioBuffer = await synthesizeWithFonadalabs({ text, voice, language });

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Content-Length": audioBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error("TTS generation error:", error);
        const message =
            error instanceof Error ? error.message : "Internal server error";
        const status = message.includes("not set") ? 500 : 502;
        return NextResponse.json({ error: message }, { status });
    }
}
