import type { ReactNode } from "react";

import { Sidebar } from "@/components/layouts/Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="min-h-[calc(100vh-4rem)] px-4 py-8 text-[#fafafa] md:px-8 md:py-10">
          <div className="mx-auto max-w-[1440px]">{children}</div>
        </main>
        <footer className="border-t border-[#383838] px-4 py-5 text-xs text-[#a3a3a3] md:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1 sm:flex-row sm:justify-between"><span className="font-medium text-white">Personal Finance</span><span>Clear financial decisions, in one place.</span></div>
        </footer>
      </div>
    </div>
  );
}
