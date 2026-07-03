import {
  BarChart3,
  LayoutDashboard,
  ReceiptText,
  Settings,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

const navigationItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: ReceiptText,
  },
  {
    href: "/budgets",
    label: "Budgets",
    icon: WalletCards,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col px-4 py-5">
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-slate-950"
        >
          Personal Finance
        </Link>

        <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
