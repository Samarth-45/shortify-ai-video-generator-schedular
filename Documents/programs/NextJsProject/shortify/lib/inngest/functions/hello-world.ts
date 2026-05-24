import { inngest } from "@/lib/inngest/client";

export const helloWorld = inngest.createFunction(
    {
        id: "hello-world",
        name: "Hello World",
        triggers: { event: "shortify/hello.world" },
    },
    async ({ event, step }) => {
        const result = await step.run("log-greeting", async () => {
            const name =
                typeof event.data?.name === "string" ? event.data.name : "World";
            console.log(`[Inngest] Hello, ${name}!`, event.data);
            return { message: `Hello, ${name}!` };
        });

        await step.sleep("pause", "1s");

        return {
            ok: true,
            ...result,
            receivedAt: new Date().toISOString(),
        };
    }
);
