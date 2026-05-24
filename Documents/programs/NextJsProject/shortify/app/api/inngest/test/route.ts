import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";

/** Dev helper: POST to trigger the hello-world Inngest function */
export async function POST(req: Request) {
    let name = "Shortify";
    try {
        const body = await req.json();
        if (body && typeof body === "object" && typeof body.name === "string") {
            name = body.name;
        }
    } catch {
        // empty body is fine
    }

    const { ids } = await inngest.send({
        name: "shortify/hello.world",
        data: { name },
    });

    return NextResponse.json({
        ok: true,
        message: "Hello world event sent",
        eventIds: ids,
    });
}
