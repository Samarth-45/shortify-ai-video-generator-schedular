import { formatNicheForPrompt } from "@/lib/video-generation/script-schema";
import { fetchUserNameByClerkId } from "@/lib/users-db";
import { sendPlunkEmail } from "./plunk-client";
import { isPlunkSendConfigured, isPlunkTrackConfigured } from "./plunk-keys";
import { trackPlunkEvent } from "./plunk-track";
import { resolveRecipientEmail } from "./resolve-recipient-email";
import {
    buildVideoReadyEmailHtml,
    buildVideoReadyEmailSubject,
    type VideoReadyEmailContent,
} from "./video-ready-template";

export type SendVideoReadyNotificationInput = {
    clerkUserId: string;
    videoId: string;
    seriesId: string;
    videoTitle: string;
    seriesName: string;
    niche: string;
    durationSeconds: number | null;
    thumbnailUrl: string | null;
    finalVideoUrl: string;
};

export type SendVideoReadyNotificationResult = {
    sent: boolean;
    skippedReason?: string;
};

export async function sendVideoReadyNotification(
    input: SendVideoReadyNotificationInput
): Promise<SendVideoReadyNotificationResult> {
    if (!isPlunkSendConfigured()) {
        return {
            sent: false,
            skippedReason:
                "Plunk send not configured (need PLUNK_SECRET_KEY sk_* and PLUNK_FROM_EMAIL)",
        };
    }

    const to = await resolveRecipientEmail(input.clerkUserId);
    if (!to) {
        return {
            sent: false,
            skippedReason: "No recipient email found for user",
        };
    }

    let recipientName = "there";
    try {
        const name = await fetchUserNameByClerkId(input.clerkUserId);
        if (name) {
            recipientName = name.split(" ")[0] || name;
        }
    } catch {
        recipientName = to.split("@")[0] ?? "there";
    }

    const content: VideoReadyEmailContent = {
        recipientName,
        videoTitle: input.videoTitle,
        seriesName: input.seriesName,
        seriesCategory: formatNicheForPrompt(input.niche).replace(/\b\w/g, (c) =>
            c.toUpperCase()
        ),
        durationSeconds: input.durationSeconds,
        thumbnailUrl: input.thumbnailUrl,
        finalVideoUrl: input.finalVideoUrl,
        videoId: input.videoId,
    };

    const subject = buildVideoReadyEmailSubject(input.videoTitle);
    const body = buildVideoReadyEmailHtml(content);

    await sendPlunkEmail({
        to,
        toName: recipientName,
        subject,
        body,
        templateId: process.env.PLUNK_VIDEO_READY_TEMPLATE_ID,
    });

    if (isPlunkTrackConfigured()) {
        try {
            await trackPlunkEvent({
                email: to,
                event: "video_ready",
                data: {
                    videoId: input.videoId,
                    seriesId: input.seriesId,
                    videoTitle: input.videoTitle,
                },
            });
        } catch (err) {
            console.warn(
                "[email] Plunk track (video_ready) failed:",
                err instanceof Error ? err.message : err
            );
        }
    }

    return { sent: true };
}
