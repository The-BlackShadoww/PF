import type { ReactNode } from "react";

import { Sidebar } from "@/components/layouts/Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-h-screen px-6 py-8 md:pl-72">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
