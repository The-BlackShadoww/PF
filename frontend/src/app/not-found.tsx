import Link from "next/link";

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
          className="mt-6 inline-flex rounded-card bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
