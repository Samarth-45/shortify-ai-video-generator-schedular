import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserToSupabase } from "@/app/actions/sync-user";
import { Film, Plus, TrendingUp, Eye } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Sync user to Supabase on every dashboard visit (idempotent; non-blocking)
    await syncUserToSupabase();

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {user.firstName || "Creator"}
                    </span>
                    ! 👋
                </h1>
                <p className="mt-1 text-gray-500">
                    Here&apos;s an overview of your content performance.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        title: "Total Series",
                        value: "0",
                        change: "+0 this month",
                        icon: Film,
                        color: "text-violet-600",
                        bg: "bg-violet-50",
                    },
                    {
                        title: "Videos Created",
                        value: "0",
                        change: "+0 this week",
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
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <div className={`rounded-xl ${stat.bg} p-2.5`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="mt-3 text-3xl font-bold text-gray-900">
                            {stat.value}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Quick Actions
                </h2>
                <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard/create">
                        <button className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-violet-500 hover:to-fuchsia-500 shadow-md shadow-violet-500/20">
                            + Create New Series
                        </button>
                    </Link>
                    <button className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 shadow-sm">
                        Upload Video
                    </button>
                    <button className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 shadow-sm">
                        View Analytics
                    </button>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Recent Activity
                </h2>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-2xl bg-gray-50 p-4 mb-4">
                        <Film className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No activity yet</p>
                    <p className="mt-1 text-xs text-gray-400">
                        Create your first series to get started!
                    </p>
                </div>
            </div>
        </div>
    );
}
