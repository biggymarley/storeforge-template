import type { ReactNode } from "react";

interface ErrorHeroProps {
  /** Big Integral-style uppercase headline, e.g. "Nothing to see here". */
  headline: string;
  copy: string;
  /** CTA button(s) — pill ButtonLink/Button from the callers. */
  children: ReactNode;
}

/** 404/error hero (blueprint §errors): centered Integral CF headline, muted copy, pill CTA. */
export function ErrorHero({ headline, copy, children }: ErrorHeroProps) {
  return (
    <div className="mx-auto flex max-w-310 flex-col items-center gap-6 px-4 py-24 text-center lg:py-36">
      <h1 className="max-w-3xl font-heading text-4xl uppercase leading-tight lg:text-6xl">{headline}</h1>
      <p className="max-w-xl text-sm text-muted lg:text-base">{copy}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">{children}</div>
    </div>
  );
}
