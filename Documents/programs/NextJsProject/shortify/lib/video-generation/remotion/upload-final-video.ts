import { readFile } from "fs/promises";
import { createAdminClient } from "@/lib/supabase/admin";

const MEDIA_BUCKET = process.env.SUPABASE_AUDIO_BUCKET ?? "voiceovers";

export async function uploadFinalVideoFile(
    seriesId: string,
    filePath: string
): Promise<string> {
    const supabase = createAdminClient();
    const buffer = await readFile(filePath);
    const path = `series/${seriesId}/final-${Date.now()}.mp4`;

    const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, buffer, {
            contentType: "video/mp4",
            upsert: false,
        });

    if (error) {
        throw new Error(`Failed to upload final video: ${error.message}`);
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
        throw new Error("Uploaded video but could not resolve public URL");
    }

    return data.publicUrl;
}
