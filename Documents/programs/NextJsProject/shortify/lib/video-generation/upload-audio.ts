import { createAdminClient } from "@/lib/supabase/admin";

/** Override in .env.local if your bucket name differs (e.g. voiceovers) */
const AUDIO_BUCKET =
    process.env.SUPABASE_AUDIO_BUCKET ?? "voiceovers";

export async function uploadGeneratedAudio(
    seriesId: string,
    audio: ArrayBuffer,
    extension = "mp3"
): Promise<string> {
    const supabase = createAdminClient();
    const path = `series/${seriesId}/voiceover-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(path, audio, {
            contentType: "audio/mpeg",
            upsert: false,
        });

    if (error) {
        throw new Error(
            `Failed to upload audio (${error.message}). Create a public Supabase Storage bucket named "${AUDIO_BUCKET}".`
        );
    }

    const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
        throw new Error("Uploaded audio but could not resolve public URL");
    }

    return data.publicUrl;
}
