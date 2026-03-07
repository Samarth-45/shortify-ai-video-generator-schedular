import { DashboardSidebar } from "./_components/sidebar";
import { DashboardHeader } from "./_components/header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Header */}
            <DashboardHeader />

            {/* Main Content — pushed right of sidebar and below header */}
            <main className="ml-[260px] pt-16 min-h-screen">
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
