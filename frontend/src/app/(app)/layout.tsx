import type { ReactNode } from "react";

import { Sidebar } from "@/components/layouts/Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-72">
        <header className="border-b border-line bg-surface/80 px-5 py-4 text-xs text-muted backdrop-blur-xl md:px-10">
          <div className="mx-auto flex max-w-[1580px] items-center justify-between">
            <span>Plan with clarity. Spend with intent.</span>
            <span className="hidden font-medium text-foreground sm:inline">Personal Finance</span>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] px-5 py-8 text-foreground md:px-10 md:py-12">
          <div className="mx-auto w-full max-w-[1580px]">{children}</div>
        </main>
        <footer className="border-t border-line px-5 py-5 text-xs text-muted md:px-10">
          <div className="mx-auto flex max-w-[1580px] justify-center items-center text-center">
            <span className="text-muted">
              Personal Finance
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
