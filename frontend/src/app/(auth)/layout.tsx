import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8ebe6] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl bg-white p-8">
        {children}
      </section>
    </main>
  );
}
