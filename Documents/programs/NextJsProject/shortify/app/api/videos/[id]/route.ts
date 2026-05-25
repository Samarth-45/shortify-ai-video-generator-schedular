import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteGeneratedVideoOwnedByUser } from "@/lib/generated-videos-db";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const result = await deleteGeneratedVideoOwnedByUser(id, userId);
    if (result.error) {
        const status = result.error === "Video not found" ? 404 : 500;
        return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ ok: true });
}
