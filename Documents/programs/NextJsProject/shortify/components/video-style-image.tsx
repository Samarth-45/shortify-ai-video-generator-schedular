"use client";

import { useState } from "react";
import Image from "next/image";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg"] as const;

function getNextImageSrc(basePath: string, extIndex: number): string {
    return `${basePath}${IMAGE_EXTENSIONS[extIndex]}`;
}

interface VideoStyleImageProps {
    basePath: string;
    label: string;
    className?: string;
    sizes?: string;
}

export function VideoStyleImage({
    basePath,
    label,
    className = "object-cover object-center",
    sizes = "280px",
}: VideoStyleImageProps) {
    const [extIndex, setExtIndex] = useState(0);
    const src = getNextImageSrc(basePath, extIndex);

    return (
        <Image
            key={src}
            src={src}
            alt={label}
            fill
            sizes={sizes}
            className={className}
            onError={() => {
                if (extIndex < IMAGE_EXTENSIONS.length - 1) {
                    setExtIndex((i) => i + 1);
                }
            }}
        />
    );
}
