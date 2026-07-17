import type { Metadata } from "next";
import { ErrorHero } from "@/components/ui/error-hero";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page Not Found" };

/** notFound() boundary for store routes — renders inside the (store) chrome. */
export default function NotFound() {
  return (
    <ErrorHero
      headline="Nothing to see here"
      copy="The page you're looking for doesn't exist or has been moved. Let's get you back to the good stuff."
    >
      <ButtonLink href="/" variant="secondary" size="lg">
        Back to Home
      </ButtonLink>
      <ButtonLink href="/products" size="lg">
        Shop Now
      </ButtonLink>
    </ErrorHero>
  );
}
