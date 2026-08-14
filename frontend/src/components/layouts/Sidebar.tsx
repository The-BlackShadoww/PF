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
  { href: "/dashboard", label: "Dashboard", icon: Grid3X3 },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
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
    <header className="sticky top-0 z-50 border-b border-[#e0e0e0] bg-white">
      <div className="hidden h-8 items-center justify-end bg-[#f4f4f4] px-4 text-xs text-[#525252] md:flex md:px-8">
        Personal Finance workspace
      </div>
      <div className="mx-auto flex h-12 max-w-[1584px] items-center px-4 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-3 font-medium text-[#161616]" onClick={() => setIsOpen(false)}>
          <span className="grid h-8 w-8 place-items-center bg-[#0f62fe] text-white"><LayoutDashboard aria-hidden="true" className="h-4 w-4" /></span>
          <span>Personal Finance</span>
        </Link>
        <nav className="ml-10 hidden h-full items-stretch md:flex">
          {navigationItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return <Link key={href} href={href} className={cn("flex items-center gap-2 border-b-2 px-4 text-sm transition-colors", active ? "border-[#0f62fe] font-medium text-[#161616]" : "border-transparent text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616]") }>
              <Icon aria-hidden="true" className="h-4 w-4" />{label}
            </Link>;
          })}
        </nav>
        <button type="button" disabled={isLoggingOut} className="ml-auto hidden h-12 items-center gap-2 px-4 text-sm text-[#525252] hover:bg-[#f4f4f4] hover:text-[#161616] md:flex disabled:opacity-60" onClick={handleLogout}>
          <LogOut aria-hidden="true" className="h-4 w-4" />{isLoggingOut ? "Logging out..." : "Logout"}
        </button>
        <button type="button" aria-label={isOpen ? "Close navigation" : "Open navigation"} className="ml-auto grid h-12 w-12 place-items-center text-[#161616] md:hidden" onClick={() => setIsOpen((current) => !current)}>
          {isOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>
      {isOpen ? <nav className="border-t border-[#e0e0e0] bg-white p-2 md:hidden">
        {navigationItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setIsOpen(false)} className={cn("flex min-h-12 items-center gap-3 border-l-2 px-4 text-sm", pathname === href ? "border-[#0f62fe] bg-[#edf5ff] font-medium text-[#161616]" : "border-transparent text-[#525252]")}><Icon aria-hidden="true" className="h-4 w-4" />{label}</Link>)}
        <button type="button" disabled={isLoggingOut} className="flex min-h-12 w-full items-center gap-3 border-l-2 border-transparent px-4 text-sm text-[#525252]" onClick={handleLogout}><LogOut aria-hidden="true" className="h-4 w-4" />{isLoggingOut ? "Logging out..." : "Logout"}</button>
      </nav> : null}
    </header>
  );
}
