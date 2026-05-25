import path from "path";
import { config as loadEnv } from "dotenv";
import { Config } from "@remotion/cli/config";

// Remotion Lambda CLI reads process.env, not .env.local automatically.
const projectRoot = process.cwd();
loadEnv({ path: path.join(projectRoot, ".env.local") });
loadEnv({ path: path.join(projectRoot, ".env") });

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((config) => ({
    ...config,
    resolve: {
        ...config.resolve,
        alias: {
            ...(config.resolve?.alias ?? {}),
            "@": projectRoot,
        },
    },
}));
