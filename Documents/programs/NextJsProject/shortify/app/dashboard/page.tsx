import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUserToSupabase } from "@/app/actions/sync-user";

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Sync user to Supabase on every dashboard visit (idempotent — skips if exists)
    await syncUserToSupabase();

    return (
        <div className="min-h-screen bg-black pt-20">
            <div className="mx-auto max-w-7xl px-6 py-12">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">
                        Welcome back,{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                            {user.firstName || "Creator"}
                        </span>
                        ! 👋
                    </h1>
                    <p className="mt-2 text-zinc-400">
                        Here&apos;s your Shortify dashboard. Start creating amazing content.
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Quick Stats */}
                    {[
                        {
                            title: "Videos Created",
                            value: "0",
                            subtitle: "This month",
                            gradient: "from-violet-500 to-purple-500",
                        },
                        {
                            title: "Scheduled Posts",
                            value: "0",
                            subtitle: "Upcoming",
                            gradient: "from-fuchsia-500 to-pink-500",
                        },
                        {
                            title: "Total Views",
                            value: "0",
                            subtitle: "All platforms",
                            gradient: "from-blue-500 to-cyan-500",
                        },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm"
                        >
                            <div
                                className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${stat.gradient} p-2`}
                            >
                                <span className="text-white text-sm font-bold">
                                    {stat.title.charAt(0)}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400">{stat.title}</p>
                            <p className="mt-1 text-3xl font-bold text-white">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">{stat.subtitle}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-sm">
                    <h2 className="mb-4 text-lg font-semibold text-white">
                        Quick Actions
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <button className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25">
                            + Create New Video
                        </button>
                        <button className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-700">
                            Schedule Content
                        </button>
                        <button className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-zinc-700">
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
