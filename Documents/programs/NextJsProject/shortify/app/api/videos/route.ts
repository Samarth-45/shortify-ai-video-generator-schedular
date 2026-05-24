import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchGeneratedVideosForUser } from "@/lib/generated-videos-db";

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videos, error } = await fetchGeneratedVideosForUser(userId);

    if (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ videos });
}
