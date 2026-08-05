"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8ebe6] px-6">
      <div className="rounded-3xl bg-white p-8 text-center">
        <p className="text-sm font-semibold text-[#a7000d]">Something went wrong</p>
        <h1 className="mt-2 text-3xl font-black text-[#0e0f0c]">
          Unable to load this page
        </h1>
        <p className="mt-2 text-sm text-[#454745]">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-3xl bg-[#9fe870] px-5 py-3 text-sm font-semibold text-[#0e0f0c] transition hover:bg-[#cdffad]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
