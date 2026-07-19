import Image from "next/image";
import Link from "next/link";
import { IconArrow } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { StarRating } from "@/components/ui/star-rating";
import { resolveStoreConfig } from "@/lib/config";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

interface HeroProps {
  /** Live Shopify product to feature — page.tsx resolves config.hero.productHandle or falls back to a best seller. */
  heroProduct?: ProductCardType | null;
  /** Weighted rating across the products shown on the homepage (lib/reviews.ts). Null hides the line. */
  aggregateRating?: { rating: number; count: number } | null;
}

type HeroVisual = { kind: "image"; src: string } | { kind: "product"; product: ProductCardType };

/**
 * Figma home hero (rect 22:352): heading + copy + price + CTA + stats left,
 * visual right. The visual is either a store-owned `hero.image` asset, or —
 * the default for stores that haven't uploaded one — a live Shopify product
 * photo, so the homepage never ships an empty/placeholder hero.
 */
export function Hero({ heroProduct = null, aggregateRating = null }: HeroProps) {
  const { hero } = resolveStoreConfig();

  const visual: HeroVisual | null = hero.image
    ? { kind: "image", src: hero.image }
    : heroProduct
      ? { kind: "product", product: heroProduct }
      : null;

  return (
    <section className="overflow-hidden bg-secondary">
      <div
        className={`mx-auto grid max-w-310 gap-8 px-4 pt-10 lg:items-center lg:gap-4 lg:pt-0 ${
          visual ? "lg:grid-cols-[minmax(0,577px)_minmax(0,1fr)]" : ""
        }`}
      >
        <div className="flex flex-col items-start gap-5 lg:gap-8 lg:py-26">
          <h1 className="font-heading text-4xl uppercase leading-[0.95] lg:text-6xl lg:leading-16">
            {hero.headline}
          </h1>
          {hero.subtext ? (
            <p className="text-sm leading-5 text-muted lg:text-base lg:leading-[22px]">{hero.subtext}</p>
          ) : null}
          {aggregateRating ? (
            <div className="flex items-center gap-2">
              <StarRating rating={aggregateRating.rating} showLabel={false} size={18} />
              <span className="text-sm text-muted">
                {aggregateRating.rating} from {aggregateRating.count}+ happy customers
              </span>
            </div>
          ) : null}
          {visual?.kind === "product" ? (
            <Price
              price={visual.product.priceRange.minVariantPrice}
              compareAt={visual.product.compareAtPriceRange?.maxVariantPrice}
            />
          ) : null}
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <ButtonLink href="/products" className="flex-1 sm:flex-initial lg:min-w-52">
              Shop Now
            </ButtonLink>
            {visual?.kind === "product" ? (
              <Link
                href={`/products/${visual.product.handle}`}
                aria-label={`View ${visual.product.title}`}
                className="flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary lg:size-15"
              >
                <IconArrow width={20} height={20} />
              </Link>
            ) : null}
          </div>
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

        {visual ? (
          <div className="relative -mx-4 flex min-h-[320px] items-center justify-center sm:min-h-[400px] lg:mx-0 lg:min-h-[663px] lg:self-stretch">
            {visual.kind === "image" ? (
              <Image
                src={visual.src}
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            ) : (
              <div className="hero-float relative aspect-square w-[80%] max-w-[440px] sm:w-[70%] lg:w-full lg:max-w-[560px]">
                {visual.product.featuredImage ? (
                  <Image
                    src={visual.product.featuredImage.url}
                    alt={visual.product.featuredImage.altText ?? visual.product.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 80vw, 45vw"
                    className="object-contain drop-shadow-2xl"
                  />
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
