"use client";

import { useState, useTransition } from "react";
import { IconMail } from "@/components/icons";
import { subscribeToNewsletter } from "@/lib/shopify/customer-actions";

/**
 * Figma newsletter CTA band. Submits to Shopify via customerCreate
 * (lib/shopify/customer-actions.ts) — no new secret, no ESP.
 */
export function NewsletterBand() {
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (typeof email !== "string") return;
    setError(null);
    startTransition(async () => {
      const result = await subscribeToNewsletter(email);
      if (result.ok) setSubscribed(true);
      else setError(result.error ?? "Something went wrong. Please try again.");
    });
  };

  return (
    <section aria-label="Newsletter" className="mx-auto w-full max-w-310 px-4">
      <div className="flex flex-col gap-8 rounded-card bg-primary px-6 py-8 text-background lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-9">
        <h2 className="max-w-xl font-heading text-[2rem] uppercase leading-tight lg:text-[2.5rem] lg:leading-[45px]">
          Stay upto date about our latest offers
        </h2>
        {subscribed ? (
          <p className="text-base font-medium lg:w-87">Thanks — you&rsquo;re on the list.</p>
        ) : (
          <form className="flex w-full flex-col gap-3.5 lg:w-87" onSubmit={handleSubmit}>
            <label className="flex items-center gap-3 rounded-full bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-background/60">
              <IconMail width={24} height={24} className="shrink-0 text-foreground/40" />
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email address"
                className="w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-foreground/40"
              />
            </label>
            {error ? <p className="text-sm text-accent">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-background px-4 py-3 text-base font-medium text-foreground transition-opacity hover:opacity-85 disabled:opacity-60"
            >
              {pending ? "Subscribing…" : "Subscribe to Newsletter"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
