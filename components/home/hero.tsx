import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { resolveStoreConfig } from "@/lib/config";

/** Figma's decorative 4-point star (nodes 22:358/22:359), template-owned. */
function DecorStar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 104 104" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M52 0c2.7 27.6 24.4 49.3 52 52-27.6 2.7-49.3 24.4-52 52-2.7-27.6-24.4-49.3-52-52C27.6 49.3 49.3 27.6 52 0Z" />
    </svg>
  );
}

/**
 * Figma home hero (rect 22:352): secondary surface, heading + copy + CTA +
 * stats left, store-owned photo right. Without a configured image the hero
 * renders as a full-width text block on the same surface.
 */
export function Hero() {
  const { hero } = resolveStoreConfig();

  return (
    <section className="overflow-hidden bg-secondary">
      <div
        className={`mx-auto grid max-w-310 gap-8 px-4 pt-10 lg:items-center lg:gap-4 lg:pt-0 ${
          hero.image ? "lg:grid-cols-[minmax(0,577px)_minmax(0,1fr)]" : ""
        }`}
      >
        <div className="flex flex-col items-start gap-5 lg:gap-8 lg:py-26">
          <h1 className="font-heading text-4xl uppercase leading-[0.95] lg:text-6xl lg:leading-16">
            {hero.headline}
          </h1>
          {hero.subtext ? (
            <p className="text-sm leading-5 text-muted lg:text-base lg:leading-[22px]">{hero.subtext}</p>
          ) : null}
          <ButtonLink href="/products" className="w-full sm:w-auto lg:min-w-52">
            Shop Now
          </ButtonLink>
          {hero.stats.length > 0 ? (
            <dl className="flex flex-wrap items-center justify-center gap-y-3 sm:justify-start">
              {hero.stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`flex flex-col pr-4 sm:pr-8 lg:pr-12 ${
                    index > 0 ? "pl-4 sm:border-l sm:border-border sm:pl-8" : ""
                  }`}
                >
                  <dd className="order-1 text-2xl font-bold lg:text-[2.5rem] lg:leading-[54px]">{stat.value}</dd>
                  <dt className="order-2 text-xs text-muted lg:text-base">{stat.label}</dt>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        {hero.image ? (
          <div className="relative -mx-4 min-h-[290px] sm:min-h-[360px] lg:mx-0 lg:min-h-[663px] lg:self-stretch">
            <Image
              src={hero.image}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top"
            />
            <DecorStar className="absolute right-6 top-8 w-14 lg:right-9 lg:top-16 lg:w-26" />
            <DecorStar className="absolute left-4 top-1/2 w-10 -translate-y-1/2 lg:left-2 lg:w-14" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
