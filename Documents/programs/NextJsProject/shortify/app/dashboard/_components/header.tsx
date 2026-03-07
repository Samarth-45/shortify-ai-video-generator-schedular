import { UserButton } from "@clerk/nextjs";

export function DashboardHeader() {
    return (
        <header className="fixed top-0 left-[260px] right-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-8">
            {/* Left — Page Context (breadcrumb or title can go here) */}
            <div className="flex items-center gap-2">
                <h2 className="text-[0.95rem] font-medium text-gray-500">Dashboard</h2>
            </div>

            {/* Right — User Profile */}
            <div className="flex items-center gap-4">
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "h-9 w-9 ring-2 ring-violet-100",
                        },
                    }}
                />
            </div>
        </header>
    );
}
