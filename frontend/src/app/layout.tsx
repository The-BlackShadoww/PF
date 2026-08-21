import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Finance",
  description:
    "A personal finance dashboard for budgets, transactions, and reports.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <script
        dangerouslySetInnerHTML={{
          __html: `(() => { try { const saved = localStorage.getItem("theme"); const theme = saved === "dark" || saved === "light" ? saved : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); document.documentElement.classList.toggle("dark", theme === "dark"); } catch {} })();`,
        }}
      />
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
