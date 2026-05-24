import { createAdminClient } from "@/lib/supabase/admin";

const MEDIA_BUCKET = process.env.SUPABASE_AUDIO_BUCKET ?? "voiceovers";

export async function uploadGeneratedImage(
    seriesId: string,
    sceneNumber: number,
    image: ArrayBuffer,
    extension = "png"
): Promise<string> {
    const supabase = createAdminClient();
    const path = `series/${seriesId}/scene-${sceneNumber}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, image, {
            contentType: extension === "jpg" || extension === "jpeg" ? "image/jpeg" : "image/png",
            upsert: false,
        });

    if (error) {
        throw new Error(`Failed to upload scene image: ${error.message}`);
    }

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    if (!data.publicUrl) {
        throw new Error("Uploaded image but could not resolve public URL");
    }

    return data.publicUrl;
}

async function downloadImage(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download generated image (${response.status})`);
    }
    return response.arrayBuffer();
}

export async function persistRemoteImage(
    seriesId: string,
    sceneNumber: number,
    remoteUrl: string
): Promise<string> {
    const buffer = await downloadImage(remoteUrl);
    const extension = remoteUrl.includes(".jpg") || remoteUrl.includes(".jpeg")
        ? "jpg"
        : "png";
    return uploadGeneratedImage(seriesId, sceneNumber, buffer, extension);
}
