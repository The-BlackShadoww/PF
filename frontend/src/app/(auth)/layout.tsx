import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f4] px-4 py-10">
      <section className="w-full max-w-md border border-[#e0e0e0] bg-white p-8 md:p-12">
        {children}
      </section>
    </main>
  );
}
