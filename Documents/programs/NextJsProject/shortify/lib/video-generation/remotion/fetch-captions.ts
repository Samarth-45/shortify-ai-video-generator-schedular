import { timedCaptionsSchema, type TimedCaptions } from "../caption-schema";

export async function fetchTimedCaptionsFromUrl(
    captionUrl: string
): Promise<TimedCaptions> {
    const response = await fetch(captionUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch captions (${response.status})`);
    }

    const json: unknown = await response.json();
    return timedCaptionsSchema.parse(json);
}
