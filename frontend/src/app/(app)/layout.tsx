import type { ReactNode } from "react";

import { Sidebar } from "@/components/layouts/Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="border-b border-line px-4 py-4 text-xs text-muted md:px-8">
          <div className="mx-auto flex max-w-[1580px] items-center justify-between">
            <span className="font-medium text-foreground">
              Personal Finance
            </span>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] px-4 py-8 text-foreground md:px-8 md:py-10">
          <div className="mx-auto w-full max-w-[1580px]">{children}</div>
        </main>
        <footer className="border-t border-line px-4 py-4 text-xs text-muted md:px-8">
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
