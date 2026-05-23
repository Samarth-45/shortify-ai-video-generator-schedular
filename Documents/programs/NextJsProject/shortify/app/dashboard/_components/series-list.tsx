"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Film, Loader2, Plus } from "lucide-react";
import { SeriesCard } from "./series-card";
import { useSeriesData } from "./series-data-provider";

export function SeriesList() {
    const searchParams = useSearchParams();
    const justCreated = searchParams.get("created") === "1";
    const justUpdated = searchParams.get("updated") === "1";
    const { series, isLoading, error: fetchError } = useSeriesData();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin text-violet-600" />
                Loading your series…
            </div>
        );
    }

    return (
        <div className="space-y-4">
                {justCreated && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        Series created successfully. It will appear below.
                    </div>
                )}

                {justUpdated && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        Series updated successfully.
                    </div>
                )}

            {fetchError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Could not load series: {fetchError}
                </div>
            )}

            {series.length === 0 && !fetchError ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                    <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                        <Film className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">No series yet</p>
                    <p className="mt-1 text-xs text-gray-400">
                        Create your first AI video series to get started.
                    </p>
                    <Link
                        href="/dashboard/create"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-fuchsia-500"
                    >
                        <Plus className="h-4 w-4" />
                        Create New Series
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {series.map((item) => (
                        <SeriesCard key={item.id} series={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
