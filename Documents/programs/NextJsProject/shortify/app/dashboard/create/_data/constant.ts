export const Language = [
    {
        language: "English",
        countryCode: "US",
        countryFlag: "🇺🇸",
        modelName: "deepgram",
        modelLangCode: "en-US",
    },
    {
        language: "Spanish",
        countryCode: "MX",
        countryFlag: "🇲🇽",
        modelName: "deepgram",
        modelLangCode: "es-MX",
    },
    {
        language: "German",
        countryCode: "DE",
        countryFlag: "🇩🇪",
        modelName: "deepgram",
        modelLangCode: "de-DE",
    },
    {
        language: "Hindi",
        countryCode: "IN",
        countryFlag: "🇮🇳",
        modelName: "fonadalab",
        modelLangCode: "hi-IN",
    },
    {
        language: "Marathi",
        countryCode: "IN",
        countryFlag: "🇮🇳",
        modelName: "fonadalab",
        modelLangCode: "mr-IN",
    },
    {
        language: "Telugu",
        countryCode: "IN",
        countryFlag: "🇮🇳",
        modelName: "fonadalab",
        modelLangCode: "te-IN",
    },
    {
        language: "Tamil",
        countryCode: "IN",
        countryFlag: "🇮🇳",
        modelName: "fonadalab",
        modelLangCode: "ta-IN",
    },
    {
        language: "Kannada",
        countryCode: "IN",
        countryFlag: "🇮🇳",
        modelName: "fonadalab",
        modelLangCode: "kn-IN",
    },
    {
        language: "Bengali",
        countryCode: "IN",
        countryFlag: "🇮🇳",
        modelName: "fonadalab",
        modelLangCode: "bn-IN",
    },
    {
        language: "Gujarati",
        countryCode: "IN",
        countryFlag: "🇮🇳",
        modelName: "fonadalab",
        modelLangCode: "gu-IN",
    },
    {
        language: "Malayalam",
        countryCode: "IN",
        countryFlag: "🇮🇳",
        modelName: "fonadalab",
        modelLangCode: "ml-IN",
    },
    {
        language: "French",
        countryCode: "FR",
        countryFlag: "🇫🇷",
        modelName: "deepgram",
        modelLangCode: "fr-FR",
    },
    {
        language: "Dutch",
        countryCode: "NL",
        countryFlag: "🇳🇱",
        modelName: "deepgram",
        modelLangCode: "nl-NL",
    },
    {
        language: "Italian",
        countryCode: "IT",
        countryFlag: "🇮🇹",
        modelName: "deepgram",
        modelLangCode: "it-IT",
    },
    {
        language: "Japanese",
        countryCode: "JP",
        countryFlag: "🇯🇵",
        modelName: "deepgram",
        modelLangCode: "ja-JP",
    },
];

export const DeepgramVoices = [
    {
        model: "deepgram",
        modelName: "aura-2-odysseus-en",
        preview: "deepgram-aura-2-odysseus-en.mp3",
        gender: "male",
    },
    {
        model: "deepgram",
        modelName: "aura-2-thalia-en",
        preview: "deepgram-aura-2-thalia-en.mp3",
        gender: "female",
    },
    {
        model: "deepgram",
        modelName: "aura-2-amalthea-en",
        preview: "deepgram-aura-2-amalthea-en.mp3",
        gender: "female",
    },
    {
        model: "deepgram",
        modelName: "aura-2-andromeda-en",
        preview: "deepgram-aura-2-andromeda-en.mp3",
        gender: "female",
    },
    {
        model: "deepgram",
        modelName: "aura-2-apollo-en",
        preview: "deepgram-aura-2-apollo-en.mp3",
        gender: "male",
    },
];

export const FonadalabVoices = [
    {
        model: "fonadalab",
        modelName: "vanee",
        preview: "fonadalab-vanee.mp3",
        gender: "female",
    },
    {
        model: "fonadalab",
        modelName: "chitraa",
        preview: "fonadalab-chitraa.mp3",
        gender: "female",
    },
    {
        model: "fonadalab",
        modelName: "raaga",
        preview: "fonadalab-raaga.mp3",
        gender: "male",
    },
    {
        model: "fonadalab",
        modelName: "nirvani",
        preview: "fonadalab-nirvani.mp3",
        gender: "female",
    },
    {
        model: "fonadalab",
        modelName: "dhwani",
        preview: "fonadalab-dhwani.mp3",
        gender: "male",
    },
    {
        model: "fonadalab",
        modelName: "kavya",
        preview: "fonadalab-kavya.mp3",
        gender: "female",
    },
];

/** Add .jpg / .png files to public/video-style/ — same base name overrides SVG fallback */
export const VideoStyles = [
    {
        id: "cinematic",
        label: "Cinematic",
        image: "/video-style/cinematic",
    },
    {
        id: "pixar-3d",
        label: "Pixar 3D",
        image: "/video-style/pixar-3d",
    },
    {
        id: "anime",
        label: "Anime",
        image: "/video-style/anime",
    },
    {
        id: "realistic",
        label: "Realistic",
        image: "/video-style/realistic",
    },
    {
        id: "documentary",
        label: "Documentary",
        image: "/video-style/documentary",
    },
] as const;

export const BackgroundMusic = [
    {
        id: "instagram-reels-marketing-469052",
        title: "Instagram Reels Marketing",
        description: "Upbeat marketing vibe for reels",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/instagram-reels-marketing-music-469052.mp3",
        badge: "Trending",
    },
    {
        id: "basketball-reels-461852",
        title: "Basketball Reels",
        description: "Energetic sports background track",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/basketball-instagram-reels-music-461852.mp3?updatedAt=1769281317499",
        badge: "Sports",
    },
    {
        id: "instagram-marketing-384448",
        title: "Social Marketing Beat",
        description: "Catchy loop for promo content",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/instagram-reels-marketing-music-384448.mp3?updatedAt=1769281317524",
        badge: "Popular",
    },
    {
        id: "trending-reels-447249",
        title: "Trending Reels Music",
        description: "Viral-style background for short videos",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/trending-instagram-reels-music-447249.mp3?updatedAt=1769281316618",
        badge: "Viral",
    },
    {
        id: "dramatic-hip-hop-148505",
        title: "Dramatic Hip Hop Jazz",
        description: "Bold cinematic hip-hop with jazz tones",
        url: "https://ik.imagekit.io/Tubeguruji/BgMusic/dramatic-hip-hop-music-background-jazz-music-for-short-video-148505.mp3?updatedAt=1769281315001",
        badge: "Cinematic",
    },
] as const;

export type LanguageType = (typeof Language)[number];
export type VoiceType = (typeof DeepgramVoices)[number] | (typeof FonadalabVoices)[number];
export type VideoStyleType = (typeof VideoStyles)[number];
export type BackgroundMusicType = (typeof BackgroundMusic)[number];

export type { CaptionStyleId, CaptionStyleDefinition, RemotionCaptionStyle } from "@/lib/caption-styles";
