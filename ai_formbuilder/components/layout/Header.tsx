"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Upload" },
    { href: "/report", label: "Report" },
    { href: "/history", label: "History" },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 border-b bg-white">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-base font-bold text-gray-900">
                        AI Report Builder
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}