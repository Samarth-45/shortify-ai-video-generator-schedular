import { createAdminClient } from "@/lib/supabase/admin";
import type { TimedCaptions } from "./caption-schema";

const STORAGE_BUCKET = process.env.SUPABASE_AUDIO_BUCKET ?? "voiceovers";

export async function uploadTimedCaptions(
    seriesId: string,
    captions: TimedCaptions
): Promise<string> {
    const supabase = createAdminClient();
    const path = `series/${seriesId}/captions-${Date.now()}.json`;
    const body = JSON.stringify(captions);

    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, body, {
            contentType: "application/json",
            upsert: false,
        });

    if (error) {
        throw new Error(`Failed to upload captions: ${error.message}`);
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
        throw new Error("Uploaded captions but could not resolve public URL");
    }

    return data.publicUrl;
}
