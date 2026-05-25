import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchSeriesById } from "@/lib/series-db";
import { resetStuckGeneration } from "@/lib/generation-failure";
import {
    deleteSeriesOwnedByUser,
    updateSeriesFromForm,
    updateSeriesStatus,
} from "@/lib/series-api";
import {
    isCompleteSeriesForm,
    type SeriesFormData,
    type SeriesStatus,
} from "@/lib/series";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_STATUSES: SeriesStatus[] = [
    "active",
    "scheduled",
    "generating",
    "published",
    "failed",
    "cancelled",
];

export async function GET(_req: Request, context: RouteContext) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const { series, error } = await fetchSeriesById(id, userId);

    if (error) {
        return NextResponse.json({ error }, { status: 500 });
    }

    if (!series) {
        return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    return NextResponse.json({ series });
}

export async function PATCH(req: Request, context: RouteContext) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const action =
        "action" in body ? (body as { action?: string }).action : undefined;

    if (action === "reset-generation") {
        try {
            const status = await resetStuckGeneration(id, userId);
            return NextResponse.json({ status });
        } catch (err) {
            return NextResponse.json(
                {
                    error:
                        err instanceof Error
                            ? err.message
                            : "Failed to reset series",
                },
                { status: 500 }
            );
        }
    }

    if (action === "pause" || action === "resume") {
        const nextStatus: SeriesStatus =
            action === "pause" ? "cancelled" : "active";

        try {
            const result = await updateSeriesStatus(id, userId, nextStatus);
            if (result.error) {
                const status = result.error === "Series not found" ? 404 : 500;
                return NextResponse.json({ error: result.error }, { status });
            }
            return NextResponse.json({ status: result.status });
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

    if (isCompleteSeriesForm(body as Partial<SeriesFormData>)) {
        try {
            const result = await updateSeriesFromForm(
                id,
                userId,
                body as SeriesFormData
            );
            if (result.error) {
                const status = result.error.includes("not found") ? 404 : 500;
                return NextResponse.json({ error: result.error }, { status });
            }
            return NextResponse.json({ id: result.id });
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

    if (
        "status" in body &&
        typeof (body as { status: string }).status === "string" &&
        VALID_STATUSES.includes((body as { status: SeriesStatus }).status)
    ) {
        try {
            const result = await updateSeriesStatus(
                id,
                userId,
                (body as { status: SeriesStatus }).status
            );
            if (result.error) {
                const status = result.error === "Series not found" ? 404 : 500;
                return NextResponse.json({ error: result.error }, { status });
            }
            return NextResponse.json({ status: result.status });
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

    return NextResponse.json(
        {
            error:
                "Provide action (pause|resume|reset-generation), full series form fields, or a valid status",
        },
        { status: 400 }
    );
}

export async function DELETE(_req: Request, context: RouteContext) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    try {
        const result = await deleteSeriesOwnedByUser(id, userId);
        if (result.error) {
            const status = result.error === "Series not found" ? 404 : 500;
            return NextResponse.json({ error: result.error }, { status });
        }
        return NextResponse.json({ success: true });
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
