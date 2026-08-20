"use client";

import { ArrowRightLeft, FileText, Landmark, LayoutDashboard, LogOut, Menu, PiggyBank, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/api/auth";
import { clearAccessToken } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account", label: "Account", icon: Landmark },
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
    try { await authApi.logout(); } finally { clearAccessToken(); router.push("/login"); router.refresh(); }
  }

  const navigation = (mobile = false) => <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1">
    {navigationItems.map(({ href, label, icon: Icon }) => {
      const active = pathname === href;
      return <Link key={href} href={href} onClick={() => mobile && setIsOpen(false)} className={cn("flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors", active ? "bg-white text-black" : "text-[#a3a3a3] hover:bg-[#272727] hover:text-white")}><Icon aria-hidden="true" className="h-4 w-4" />{label}</Link>;
    })}
  </nav>;

  const logout = <button type="button" disabled={isLoggingOut} onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-[#a3a3a3] transition hover:bg-[#272727] hover:text-white disabled:opacity-60"><LogOut aria-hidden="true" className="h-4 w-4" />{isLoggingOut ? "Logging out…" : "Log out"}</button>;

  return <>
    <header className="sticky top-0 z-50 flex h-16 items-center border-b border-[#383838] bg-black px-4 lg:hidden">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-white text-black"><LayoutDashboard className="h-4 w-4" /></span>Personal Finance</Link>
      <button type="button" aria-label={isOpen ? "Close navigation" : "Open navigation"} aria-expanded={isOpen} className="ml-auto grid h-10 w-10 place-items-center rounded-[10px] text-white hover:bg-[#272727]" onClick={() => setIsOpen((value) => !value)}>{isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
    </header>
    {isOpen && <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col border-r border-[#383838] bg-black p-4 lg:hidden">{navigation(true)}<div className="mt-4 border-t border-[#383838] pt-4">{logout}</div></div>}
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#383838] bg-black p-4 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 text-sm font-semibold text-white"><span className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-black"><LayoutDashboard className="h-4 w-4" /></span><span>Personal Finance</span></Link>
      <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#a3a3a3]">Workspace</p>
      {navigation()}<div className="mt-4 border-t border-[#383838] pt-4">{logout}</div>
    </aside>
  </>;
}
