import type { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <section className="w-full max-w-md rounded-panel border border-line bg-surface p-8 shadow-[0_4px_24px_rgba(17,24,39,0.08)] md:p-12">
        <div className="mb-8 flex justify-center">
          <Link
            href="/login"
            aria-label="Personal Finance home"
            className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-foreground"
          >
            <span className="grid h-9 w-9 place-items-center rounded-control bg-primary text-white shadow-[0_4px_14px_rgb(33_66_231_/_28%)]">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            Personal Finance
          </Link>
        </div>
        {children}
      </section>
    </main>
  );
}
