import { format } from "date-fns";
import { getAppBaseUrl } from "./app-url";

export type VideoReadyEmailContent = {
    recipientName: string;
    videoTitle: string;
    seriesName: string;
    seriesCategory: string;
    durationSeconds: number | null;
    thumbnailUrl: string | null;
    finalVideoUrl: string;
    videoId: string;
};

function formatDuration(seconds: number | null): string {
    if (!seconds || seconds <= 0) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function buildVideoReadyEmailSubject(videoTitle: string): string {
    return `Your video is ready: ${videoTitle}`;
}

export function buildVideoReadyEmailHtml(
    content: VideoReadyEmailContent
): string {
    const baseUrl = getAppBaseUrl();
    const viewUrl = content.finalVideoUrl;
    const downloadUrl = content.finalVideoUrl;
    const dashboardUrl = `${baseUrl}/dashboard/videos`;
    const safeTitle = escapeHtml(content.videoTitle);
    const safeSeries = escapeHtml(content.seriesName);
    const safeCategory = escapeHtml(content.seriesCategory);
    const safeName = escapeHtml(content.recipientName);
    const duration = formatDuration(content.durationSeconds);
    const generatedAt = format(new Date(), "MMMM d, yyyy 'at' h:mm a");

    const thumbnailBlock = content.thumbnailUrl
        ? `<a href="${escapeHtml(viewUrl)}" style="display:block;text-decoration:none;">
        <img src="${escapeHtml(content.thumbnailUrl)}" alt="${safeTitle}" width="100%" style="display:block;width:100%;max-width:520px;height:auto;border-radius:12px;border:0;" />
      </a>`
        : `<div style="background:linear-gradient(135deg,#ede9fe,#fae8ff);border-radius:12px;padding:48px 24px;text-align:center;color:#6d28d9;font-family:system-ui,sans-serif;font-size:14px;">Video preview</div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle} is ready</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Shortify</p>
              <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;">Your video is ready</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#3f3f46;">Hi ${safeName},</p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#3f3f46;">
                <strong style="color:#6d28d9;">${safeTitle}</strong> finished generating and is ready to watch or download.
              </p>
              <div style="margin-bottom:24px;">${thumbnailBlock}</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:28px;background:#fafafa;border-radius:12px;border:1px solid #e4e4e7;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#71717a;">Video details</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#52525b;"><strong style="color:#18181b;">Title:</strong> ${safeTitle}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#52525b;"><strong style="color:#18181b;">Series:</strong> ${safeSeries}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#52525b;"><strong style="color:#18181b;">Category:</strong> ${safeCategory}</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#52525b;"><strong style="color:#18181b;">Duration:</strong> ${duration}</p>
                    <p style="margin:0;font-size:14px;color:#52525b;"><strong style="color:#18181b;">Generated:</strong> ${generatedAt}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="${escapeHtml(viewUrl)}" style="display:inline-block;padding:14px 28px;background:#7c3aed;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">Watch video</a>
                  </td>
                  <td>
                    <a href="${escapeHtml(downloadUrl)}" style="display:inline-block;padding:14px 28px;background:#ffffff;color:#7c3aed;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;border:2px solid #7c3aed;">Download MP4</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:14px;line-height:1.5;">
                <a href="${escapeHtml(dashboardUrl)}" style="color:#7c3aed;font-weight:600;text-decoration:none;">View all videos in your dashboard →</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;text-align:center;">
                You received this email because a video finished generating on Shortify.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
