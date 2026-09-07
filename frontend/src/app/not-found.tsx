import Link from "next/link";
import { acebuilderButtonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="rounded-card bg-surface p-8 text-center">
        <p className="text-sm font-semibold text-muted">404</p>
        <h1 className="mt-2 text-3xl font-black text-ink">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          The page you requested does not exist.
        </p>
        <Link
          href="/dashboard"
          data-slot="button"
          className={cn(acebuilderButtonClass, "mt-6")}
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
