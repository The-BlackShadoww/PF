import type { ReactNode } from "react";

import { Sidebar } from "@/components/layouts/Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="min-h-[calc(100vh-80px)] px-4 py-8 text-[#0e0f0c] md:px-8 md:py-12">
        <div className="mx-auto max-w-[1584px]">{children}</div>
      </main>
      <footer className="border-t border-[#393939] bg-[#161616] px-4 py-8 text-sm text-[#c6c6c6] md:px-8">
        <div className="mx-auto flex max-w-[1584px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-white">Personal Finance</span>
          <span>Clear financial decisions, built on a precise system.</span>
        </div>
      </footer>
    </div>
  );
}
