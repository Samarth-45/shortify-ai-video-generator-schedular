import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchSeriesForUser } from "@/lib/series-db";
import { insertSeriesForUser } from "@/lib/series-api";
import { isCompleteSeriesForm, type SeriesFormData } from "@/lib/series";

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { series, error } = await fetchSeriesForUser(userId);

    if (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ series });
}

export async function POST(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
        return NextResponse.json(
            { error: "Missing or invalid series fields" },
            { status: 400 }
        );
    }

    const form = body as Partial<SeriesFormData>;

    if (!isCompleteSeriesForm(form)) {
        return NextResponse.json(
            { error: "Missing or invalid series fields" },
            { status: 400 }
        );
    }

    try {
        const result = await insertSeriesForUser(userId, form);
        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
        return NextResponse.json({ id: result.id }, { status: 201 });
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
