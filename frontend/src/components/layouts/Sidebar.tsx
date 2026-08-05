"use client";

import {
  ArrowRightLeft,
  FileText,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  Menu,
  PiggyBank,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { authApi } from "@/lib/api/auth";
import { clearAccessToken } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Grid3X3,
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: ArrowRightLeft,
  },
  {
    href: "/budgets",
    label: "Budgets",
    icon: PiggyBank,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileText,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } finally {
      clearAccessToken();
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#cfd4ca] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="font-black text-[#0e0f0c]">
            Personal Finance
          </Link>
          <button
            type="button"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#0e0f0c] bg-white text-[#0e0f0c] transition hover:bg-[#e8ebe6]"
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#0e0f0c]/30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r border-[#cfd4ca] bg-white transition-transform md:translate-x-0",
          isOpen && "translate-x-0",
        )}
      >
        <div className="flex h-full flex-col px-4 py-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-black text-[#0e0f0c]"
            onClick={() => setIsOpen(false)}
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#9fe870] text-[#0e0f0c]">
              <LayoutDashboard aria-hidden="true" className="h-5 w-5" />
            </span>
            Personal Finance
          </Link>

          <nav className="mt-6 flex flex-col gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[#454745] transition hover:bg-[#e8ebe6] hover:text-[#0e0f0c]",
                    active &&
                      "bg-[#e2f6d5] text-[#0e0f0c] ring-1 ring-inset ring-[#9fe870] hover:bg-[#e2f6d5] hover:text-[#0e0f0c]",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            disabled={isLoggingOut}
            className="mt-auto inline-flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[#454745] transition hover:bg-[#e8ebe6] hover:text-[#0e0f0c] disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
