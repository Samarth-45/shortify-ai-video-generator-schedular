"use client";

import { Suspense } from "react";
import { Film, Plus } from "lucide-react";
import Link from "next/link";
import { SeriesDataProvider } from "./series-data-provider";
import { DashboardStats } from "./dashboard-stats";
import { SeriesList } from "./series-list";

export function DashboardSeriesSection() {
    return (
        <SeriesDataProvider>
            <Suspense
                fallback={
                    <div className="text-sm text-gray-500">Loading stats…</div>
                }
            >
                <DashboardStats />
            </Suspense>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Your Series
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage scheduled series and generate videos.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/create"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                        <Plus className="h-4 w-4" />
                        New series
                    </Link>
                </div>

                <Suspense
                    fallback={
                        <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                            <Film className="mr-2 h-5 w-5 animate-pulse text-violet-400" />
                            Loading series…
                        </div>
                    }
                >
                    <SeriesList />
                </Suspense>
            </div>
        </SeriesDataProvider>
    );
}
