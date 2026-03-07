"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    Film,
    Video,
    BookOpen,
    CreditCard,
    Settings,
    Plus,
    Sparkles,
    User,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    { label: "Series", href: "/dashboard", icon: Film },
    { label: "Videos", href: "/dashboard/videos", icon: Video },
    { label: "Guides", href: "/dashboard/guides", icon: BookOpen },
    { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-gray-200 bg-white">
            {/* ── Logo Header ── */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
                <Image
                    src="/logo.png"
                    alt="Shortify Logo"
                    width={36}
                    height={36}
                    className="rounded-lg"
                />
                <span className="text-[1.15rem] font-bold tracking-tight text-gray-900">
                    Shortify
                </span>
            </div>

            {/* ── Create Button ── */}
            <div className="px-4 pt-5 pb-2">
                <Button className="w-full justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 border-0 shadow-md shadow-violet-500/20 h-11 text-[0.9rem] font-semibold rounded-xl">
                    <Plus className="h-[18px] w-[18px]" />
                    Create New Series
                </Button>
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-3 pt-4 space-y-1">
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[0.925rem] font-medium transition-all duration-150
                ${isActive
                                    ? "bg-violet-50 text-violet-700 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon
                                className={`h-[20px] w-[20px] ${isActive ? "text-violet-600" : "text-gray-400"
                                    }`}
                            />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* ── Sidebar Footer ── */}
            <div className="border-t border-gray-100 px-3 py-3 space-y-1">
                {/* Upgrade */}
                <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[0.925rem] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all duration-150">
                    <Sparkles className="h-[20px] w-[20px] text-amber-500" />
                    Upgrade Plan
                </button>

                {/* Profile Settings */}
                <Link
                    href="/dashboard/settings"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[0.925rem] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150"
                >
                    <User className="h-[20px] w-[20px] text-gray-400" />
                    Profile Settings
                    <ChevronUp className="ml-auto h-4 w-4 text-gray-400 rotate-180" />
                </Link>
            </div>
        </aside>
    );
}
