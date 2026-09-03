"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="rounded-card bg-surface p-8 text-center">
        <p className="text-sm font-semibold text-danger">Something went wrong</p>
        <h1 className="mt-2 text-3xl font-black text-ink">
          Unable to load this page
        </h1>
        <p className="mt-2 text-sm text-muted">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-card bg-primary px-5 py-3 text-sm font-semibold text-ink transition hover:bg-primary-hover"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
