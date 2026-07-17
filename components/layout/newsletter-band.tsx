"use client";

import { useState } from "react";
import { IconMail } from "@/components/icons";

/**
 * Figma newsletter CTA band. Visual-only capture (spec §4 allows it) —
 * confirms locally without posting anywhere.
 */
export function NewsletterBand() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <section aria-label="Newsletter" className="mx-auto w-full max-w-310 px-4">
      <div className="flex flex-col gap-8 rounded-card bg-primary px-6 py-8 text-background lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-9">
        <h2 className="max-w-xl font-heading text-[2rem] uppercase leading-tight lg:text-[2.5rem] lg:leading-[45px]">
          Stay upto date about our latest offers
        </h2>
        {subscribed ? (
          <p className="text-base font-medium lg:w-87">Thanks — you&rsquo;re on the list.</p>
        ) : (
          <form
            className="flex w-full flex-col gap-3.5 lg:w-87"
            onSubmit={(event) => {
              event.preventDefault();
              setSubscribed(true);
            }}
          >
            <label className="flex items-center gap-3 rounded-full bg-background px-4 py-3">
              <IconMail width={24} height={24} className="shrink-0 text-foreground/40" />
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-foreground/40"
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-background px-4 py-3 text-base font-medium text-foreground transition-opacity hover:opacity-85"
            >
              Subscribe to Newsletter
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
