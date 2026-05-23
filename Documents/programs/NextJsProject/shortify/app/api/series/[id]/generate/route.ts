import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateSeriesStatus } from "@/lib/series-api";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const result = await updateSeriesStatus(id, userId, "generating");
        if (result.error) {
            const status = result.error === "Series not found" ? 404 : 500;
            return NextResponse.json({ error: result.error }, { status });
        }
        return NextResponse.json({ status: "generating" });
    } catch (err) {
        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Database not configured",
            },
            { status: 500 }
        );
    }
}
