"use client";

import {
  ArrowRightLeft,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PiggyBank,
  Settings,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const nextTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : preferredTheme;
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
  }

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

  const navigation = (mobile = false) => (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1">
      {navigationItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => mobile && setIsOpen(false)}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium",
              active
                ? "bg-[var(--sidebar-accent)] text-[var(--accent-foreground)]"
                : "text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const logout = (
    <button
      type="button"
      disabled={isLoggingOut}
      onClick={handleLogout}
      className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-[#717171] hover:bg-[#fef2f2] hover:text-[#d70015] disabled:opacity-60"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      {isLoggingOut ? "Logging out…" : "Log out"}
    </button>
  );
  const themeSwitcher = (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
      onClick={toggleTheme}
      className="flex min-h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
    >
      <span className="grid h-5 w-5 place-items-center">
        {theme === "light" ? (
          <Moon aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Sun aria-hidden="true" className="h-4 w-4" />
        )}
      </span>
      <span>{theme === "light" ? "Dark theme" : "Light theme"}</span>
      <span
        aria-hidden="true"
        className="ml-auto h-5 w-9 rounded-full bg-[var(--muted)] p-0.5"
      >
        <span
          className={cn(
            "block h-4 w-4 rounded-full bg-[var(--foreground)] transition-transform",
            theme === "dark" && "translate-x-4",
          )}
        />
      </span>
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 items-center border-b border-(--sidebar-border) bg-[color-mix(in_srgb,var(--sidebar)_90%,transparent)] px-4 text-[var(--sidebar-foreground)] backdrop-blur-lg lg:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[var(--primary-color)] text-white">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          Personal Finance
        </Link>
        <button
          type="button"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          className="ml-auto grid h-10 w-10 place-items-center rounded-[10px] hover:bg-[var(--sidebar-accent)]"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] p-4 text-[var(--sidebar-foreground)] lg:hidden">
          {navigation(true)}
          <div className="mt-4 border-t border-[var(--sidebar-border)] pt-4">
            {themeSwitcher}
            {logout}
          </div>
        </div>
      )}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] p-4 text-[var(--sidebar-foreground)] lg:flex">
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-3 px-2 text-sm font-semibold"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--primary-color)] text-white">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          <span>Personal Finance</span>
        </Link>
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--muted-foreground)]">
          Workspace
        </p>
        {navigation()}
        <div className="mt-4 border-t border-[var(--sidebar-border)] pt-4">
          {themeSwitcher}
          {logout}
        </div>
      </aside>
    </>
  );
}
