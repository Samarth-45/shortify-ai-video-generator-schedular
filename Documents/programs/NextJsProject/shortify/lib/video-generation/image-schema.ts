export type GeneratedSceneImage = {
    scene: number;
    prompt: string;
    imageUrl: string;
};

export type GeneratedImagesResult = {
    scenes: GeneratedSceneImage[];
};
