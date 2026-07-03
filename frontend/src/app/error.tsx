"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-sm font-medium text-red-600">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Unable to load this page
        </h1>
        <p className="mt-2 text-sm text-slate-600">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
