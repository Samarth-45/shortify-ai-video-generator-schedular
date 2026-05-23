"use client";

import { Film, Plus, TrendingUp, Eye, Loader2 } from "lucide-react";
import { useSeriesData } from "./series-data-provider";

export function DashboardStats() {
    const { series, isLoading } = useSeriesData();
    const seriesCount = series.length;
    const generatingCount = series.filter((s) => s.status === "generating").length;

    const stats = [
        {
            title: "Total Series",
            value: isLoading ? "—" : String(seriesCount),
            change: isLoading ? "Loading…" : `${seriesCount} active`,
            icon: Film,
            color: "text-violet-600",
            bg: "bg-violet-50",
        },
        {
            title: "Generating",
            value: isLoading ? "—" : String(generatingCount),
            change: isLoading
                ? "Loading…"
                : generatingCount > 0
                  ? "In progress now"
                  : "None in progress",
            icon: Plus,
            color: "text-fuchsia-600",
            bg: "bg-fuchsia-50",
        },
        {
            title: "Total Views",
            value: "0",
            change: "+0% growth",
            icon: Eye,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "Engagement",
            value: "0%",
            change: "No data yet",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
    ];

    return (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">
                            {stat.title}
                        </p>
                        <div className={`rounded-xl ${stat.bg} p-2.5`}>
                            {isLoading && i < 2 ? (
                                <Loader2
                                    className={`h-5 w-5 animate-spin ${stat.color}`}
                                />
                            ) : (
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            )}
                        </div>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-gray-900">
                        {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
                </div>
            ))}
        </div>
    );
}
