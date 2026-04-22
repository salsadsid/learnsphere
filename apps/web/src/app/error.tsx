"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-destructive">
        Something went wrong
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight font-[var(--font-display)]">
        An unexpected error occurred
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || "Please try again or contact support if the problem persists."}
      </p>
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </div>
  );
}
