import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you requested does not exist.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
