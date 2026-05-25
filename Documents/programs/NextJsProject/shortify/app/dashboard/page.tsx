import { syncUserToSupabase } from "@/app/actions/sync-user";
import { requireUserId, safeCurrentUser } from "@/lib/clerk-session";
import { DashboardSeriesSection } from "./_components/dashboard-series-section";
import Link from "next/link";

export default async function DashboardPage() {
    await requireUserId();
    const user = await safeCurrentUser();

    await syncUserToSupabase();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                        {user?.firstName || "Creator"}
                    </span>
                    ! 👋
                </h1>
                <p className="mt-1 text-gray-500">
                    Here&apos;s an overview of your content performance.
                </p>
            </div>

            <DashboardSeriesSection />

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
                </div>
            </div>
        </div>
    );
}
