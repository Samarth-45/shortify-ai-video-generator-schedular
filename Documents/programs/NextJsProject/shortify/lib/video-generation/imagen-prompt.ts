const BLOCKED_TERMS =
    /\b(gore|blood|nude|naked|nsfw|weapon|gun|knife|kill|murder|terror|drug|suicide|sexy|erotic|porn|hitler|nazi|isis|war zone|corpse|dead body)\b/gi;

const SAFE_IMAGE_PREFIX =
    "Family-friendly illustration for a short video. No violence, weapons, blood, nudity, drugs, hate symbols, political propaganda, real celebrity likenesses, or readable text. ";

export function sanitizeImagePrompt(prompt: string): string {
    const cleaned = prompt
        .replace(BLOCKED_TERMS, "")
        .replace(/\s{2,}/g, " ")
        .trim();

    return `${SAFE_IMAGE_PREFIX}${cleaned}`.slice(0, 2000);
}

export function buildSafeFallbackImagePrompt(
    niche: string,
    styleLabel: string,
    sceneNumber: number
): string {
    return sanitizeImagePrompt(
        `Peaceful abstract visual metaphor for ${niche}, scene ${sceneNumber}, ${styleLabel} art style, soft cinematic lighting, vertical 9:16 composition, simple shapes and colors, no people, wholesome and calm mood.`
    );
}

/** Ultra-minimal prompt for Flux / last-chance model attempts. */
export function buildMinimalScenePrompt(sceneNumber: number): string {
    return `Soft gradient sky and gentle hills, abstract calm landscape, vertical portrait composition, pastel colors, scene ${sceneNumber}, no people, no faces, no text, no logos, wallpaper style.`;
}
