"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorHero } from "@/components/ui/error-hero";

/**
 * Root error boundary — catches failures in the (store) layout itself (the
 * per-page boundary can't). No store chrome here: the layout that would
 * render it is the thing that failed.
 */
export default function RootError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center">
      <ErrorHero
        headline="Something went wrong"
        copy="An unexpected error stopped the store from loading. It's not you, it's us — try again in a moment."
      >
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary" size="lg">
          Back to Home
        </ButtonLink>
      </ErrorHero>
    </main>
  );
}
