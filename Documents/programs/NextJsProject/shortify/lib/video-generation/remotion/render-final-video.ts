import { mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import type { ShortVideoProps } from "@/remotion/types";
import {
    SHORT_VIDEO_COMPOSITION_ID,
    SHORT_VIDEO_FPS,
} from "@/remotion/types";
import { uploadFinalVideoFile } from "./upload-final-video";

export type LambdaRenderJob = {
    mode: "lambda";
    renderId: string;
    bucketName: string;
};

export type LocalRenderJob = {
    mode: "local";
    finalVideoUrl: string;
};

export type RenderJob = LambdaRenderJob | LocalRenderJob;

export function canUseLambdaRender(): boolean {
    return Boolean(
        process.env.REMOTION_LAMBDA_FUNCTION_NAME &&
            process.env.REMOTION_SERVE_URL &&
            process.env.REMOTION_AWS_REGION
    );
}

/** Renderer Lambdas only; +1 orchestrator must fit AWS account concurrency (often 10 on new accounts). */
const DEFAULT_MAX_RENDERER_LAMBDAS = 7;

function resolveFramesPerLambda(durationInFrames: number): number {
    const fromEnv = process.env.REMOTION_FRAMES_PER_LAMBDA;
    if (fromEnv) {
        const parsed = Number(fromEnv);
        if (Number.isFinite(parsed) && parsed > 0) {
            return Math.floor(parsed);
        }
    }
    return Math.max(60, Math.ceil(durationInFrames / DEFAULT_MAX_RENDERER_LAMBDAS));
}

/** Remotion allows framesPerLambda or concurrency, not both. */
function resolveLambdaConcurrency(): number | undefined {
    const fromEnv = process.env.REMOTION_LAMBDA_CONCURRENCY;
    if (fromEnv) {
        const parsed = Number(fromEnv);
        if (Number.isFinite(parsed) && parsed > 0) {
            return Math.floor(parsed);
        }
    }
    return undefined;
}

function formatLambdaRenderError(message: string): string {
    if (
        message.includes("Concurrency limit") ||
        message.includes("ConcurrentInvocation") ||
        message.includes("Rate Exceeded")
    ) {
        return (
            `${message} — AWS Lambda concurrency is too low for this video. ` +
            "Set REMOTION_FRAMES_PER_LAMBDA=120 (or higher) in .env.local, or request a quota increase: npx remotion lambda quotas increase"
        );
    }
    return message;
}

export async function startRenderOnLambda(
    inputProps: ShortVideoProps
): Promise<LambdaRenderJob> {
    const { renderMediaOnLambda } = await import("@remotion/lambda/client");

    const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;
    const serveUrl = process.env.REMOTION_SERVE_URL!;
    const region = process.env.REMOTION_AWS_REGION! as Parameters<
        typeof renderMediaOnLambda
    >[0]["region"];

    const framesPerLambda = resolveFramesPerLambda(inputProps.durationInFrames);
    const concurrency =
        process.env.REMOTION_FRAMES_PER_LAMBDA === undefined
            ? resolveLambdaConcurrency()
            : undefined;

    const parallelism =
        concurrency !== undefined
            ? `concurrency=${concurrency}`
            : `framesPerLambda=${framesPerLambda}`;
    console.info(
        `[render-video] Lambda render: ${inputProps.durationInFrames} frames, ${parallelism}`
    );

    const { renderId, bucketName } = await renderMediaOnLambda({
        region,
        functionName,
        serveUrl,
        composition: SHORT_VIDEO_COMPOSITION_ID,
        inputProps,
        codec: "h264",
        imageFormat: "jpeg",
        ...(concurrency !== undefined ? { concurrency } : { framesPerLambda }),
        maxRetries: 2,
        privacy: "public",
    });

    return { mode: "lambda", renderId, bucketName };
}

const LAMBDA_POLL_INTERVAL_MS = 5000;
const LAMBDA_POLL_MAX_ATTEMPTS = 180;

function isAwsRateLimitError(err: unknown): boolean {
    const message = err instanceof Error ? err.message : String(err);
    return (
        message.includes("TooManyRequests") ||
        message.includes("Rate Exceeded") ||
        message.includes("Throttling") ||
        message.includes("Concurrency limit") ||
        message.includes("ConcurrentInvocation")
    );
}

async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getLambdaRenderProgress(
    getRenderProgress: typeof import("@remotion/lambda/client").getRenderProgress,
    input: Parameters<typeof import("@remotion/lambda/client").getRenderProgress>[0]
) {
    const maxRetries = 8;
    for (let retry = 0; retry <= maxRetries; retry++) {
        try {
            return await getRenderProgress(input);
        } catch (err) {
            if (!isAwsRateLimitError(err) || retry === maxRetries) {
                throw err;
            }
            const backoffMs = Math.min(30_000, 2000 * 2 ** retry);
            console.warn(
                `[render-video] AWS rate limit — retrying progress poll in ${backoffMs}ms`
            );
            await sleep(backoffMs);
        }
    }

    throw new Error("Lambda render progress poll failed after rate-limit retries");
}

export async function waitForLambdaRender(job: LambdaRenderJob): Promise<string> {
    const { getRenderProgress, LambdaClientInternals } = await import(
        "@remotion/lambda/client"
    );

    const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME!;
    const region = process.env.REMOTION_AWS_REGION! as Parameters<
        typeof import("@remotion/lambda/client").getRenderProgress
    >[0]["region"];

    // Read progress from S3 instead of invoking Lambda every poll (avoids TooManyRequests).
    const skipLambdaInvocation = Boolean(
        LambdaClientInternals.parseFunctionName(functionName)
    );

    const progressInput = {
        renderId: job.renderId,
        bucketName: job.bucketName,
        functionName,
        region,
        skipLambdaInvocation,
    };

    for (let attempt = 0; attempt < LAMBDA_POLL_MAX_ATTEMPTS; attempt++) {
        if (attempt > 0) {
            await sleep(LAMBDA_POLL_INTERVAL_MS);
        }

        const progress = await getLambdaRenderProgress(
            getRenderProgress,
            progressInput
        );

        if (progress.fatalErrorEncountered) {
            const raw =
                progress.errors?.[0]?.message ?? "Lambda render failed";
            throw new Error(formatLambdaRenderError(raw));
        }

        if (progress.done && progress.outputFile) {
            return progress.outputFile;
        }
    }

    throw new Error("Lambda render timed out waiting for completion");
}

async function renderLocallyToFile(
    inputProps: ShortVideoProps,
    outputPath: string
): Promise<void> {
    const { bundle } = await import("@remotion/bundler");
    const { renderMedia, selectComposition } = await import("@remotion/renderer");

    const entryPoint = join(process.cwd(), "remotion", "index.ts");

    const bundled = await bundle({
        entryPoint,
        webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
        serveUrl: bundled,
        id: SHORT_VIDEO_COMPOSITION_ID,
        inputProps,
    });

    await renderMedia({
        composition: {
            ...composition,
            durationInFrames: inputProps.durationInFrames,
            fps: SHORT_VIDEO_FPS,
        },
        serveUrl: bundled,
        codec: "h264",
        outputLocation: outputPath,
        inputProps,
        chromiumOptions: {
            disableWebSecurity: true,
        },
    });
}

export async function startLocalRender(
    inputProps: ShortVideoProps,
    seriesId: string
): Promise<LocalRenderJob> {
    const tempDir = await mkdtemp(join(tmpdir(), "shortify-remotion-"));
    const outputPath = join(tempDir, "final.mp4");

    try {
        await renderLocallyToFile(inputProps, outputPath);
        const finalVideoUrl = await uploadFinalVideoFile(seriesId, outputPath);
        return { mode: "local", finalVideoUrl };
    } finally {
        await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
    }
}

export async function startRender(
    inputProps: ShortVideoProps,
    seriesId: string
): Promise<RenderJob> {
    if (canUseLambdaRender()) {
        return startRenderOnLambda(inputProps);
    }
    return startLocalRender(inputProps, seriesId);
}

export async function resolveRenderOutput(job: RenderJob): Promise<string> {
    if (job.mode === "local") {
        return job.finalVideoUrl;
    }
    return waitForLambdaRender(job);
}
