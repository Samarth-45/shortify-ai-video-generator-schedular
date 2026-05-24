import { helloWorld } from "./hello-world";
import { generateSeriesVideo } from "./generate-video";

/** All Inngest functions — register new ones here and in app/api/inngest/route.ts */
export const inngestFunctions = [helloWorld, generateSeriesVideo];
