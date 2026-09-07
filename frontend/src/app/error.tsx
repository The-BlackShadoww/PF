"use client";

import { Button } from "@/components/ui/Button";

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
        <Button
          type="button"
          onClick={reset}
          className="mt-6"
        >
          Try again
        </Button>
      </div>
    </main>
  );
}
