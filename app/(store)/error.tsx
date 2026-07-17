"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorHero } from "@/components/ui/error-hero";

/** Error boundary for store pages — renders inside the (store) chrome. */
export default function StoreError({
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
    <ErrorHero
      headline="Something went wrong"
      copy="An unexpected error stopped this page from loading. It's not you, it's us — try again in a moment."
    >
      <Button size="lg" onClick={reset}>
        Try again
      </Button>
      <ButtonLink href="/" variant="secondary" size="lg">
        Back to Home
      </ButtonLink>
    </ErrorHero>
  );
}
