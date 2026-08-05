import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8ebe6] px-6">
      <div className="rounded-3xl bg-white p-8 text-center">
        <p className="text-sm font-semibold text-[#454745]">404</p>
        <h1 className="mt-2 text-3xl font-black text-[#0e0f0c]">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-[#454745]">
          The page you requested does not exist.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-3xl bg-[#9fe870] px-5 py-3 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#cdffad]"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
