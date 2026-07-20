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
  /** Resolved products for hero.carousel type "products" — page.tsx fetches each configured handle, skipping failures. */
  carouselProducts?: ProductCardType[];
}

type HeroVisual = { kind: "image"; src: string } | { kind: "product"; product: ProductCardType };

type HeroSlide = { src: string; alt: string; href: string };

/**
 * Figma home hero (rect 22:352): heading + copy + price + CTA + stats left,
 * visual right. The visual is either a store-owned `hero.image` asset, or —
 * the default for stores that haven't uploaded one — a live Shopify product
 * photo, so the homepage never ships an empty/placeholder hero.
 */
export function Hero({ heroProduct = null, aggregateRating = null, carouselProducts = [] }: HeroProps) {
  const { hero } = resolveStoreConfig();

  // Full-bleed carousel mode: no text overlay at all. Empty slides (e.g. every
  // configured product handle failed to resolve) falls through to the standard hero.
  const slides: HeroSlide[] =
    hero.carousel?.type === "products"
      ? carouselProducts.flatMap((product) =>
          product.featuredImage
            ? [
                {
                  src: product.featuredImage.url,
                  alt: product.featuredImage.altText ?? product.title,
                  href: `/products/${product.handle}`
                }
              ]
            : []
        )
      : hero.carousel?.type === "images"
        ? hero.carousel.images.map((item) => ({ src: item.image, alt: item.alt, href: item.href }))
        : [];
  if (slides.length > 0) return <HeroCarousel slides={slides} />;

  const visual: HeroVisual | null = hero.image
    ? { kind: "image", src: hero.image }
    : heroProduct
      ? { kind: "product", product: heroProduct }
      : null;

  return (
    <section className="overflow-hidden bg-hero-background">
      <div
        className={`mx-auto grid max-w-page gap-8 px-4 pt-10 lg:items-center lg:gap-4 lg:pt-0 ${
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

/**
 * Full-bleed hero carousel — same pure-CSS `.marquee` mechanism as
 * testimonial-carousel.tsx (content duplicated into two halves, seamless
 * `translateX(-50%)` loop, pauses on hover/focus, honors
 * prefers-reduced-motion; no client JS, no arrows). Each slide spans the full
 * viewport width at the standard hero heights. A single slide renders static —
 * one image looping past itself just looks broken.
 */
function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const animate = slides.length > 1;
  const loop = animate ? [...slides, ...slides] : slides;
  // Full-viewport slides move a lot more pixels than testimonial cards, so a
  // longer per-slide duration keeps the crawl similarly calm.
  const durationSeconds = Math.max(slides.length * 10, 20);

  return (
    <section className="overflow-hidden bg-hero-background">
      <div className="group relative">
        <div
          className={`flex w-max ${animate ? "marquee" : ""}`}
          style={animate ? { animationDuration: `${durationSeconds}s` } : undefined}
        >
          {loop.map((slide, index) => {
            const sizing = "relative h-[320px] w-screen shrink-0 sm:h-[400px] lg:h-[663px]";
            const image = (
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
              />
            );
            return slide.href ? (
              <Link
                key={`${slide.src}-${index}`}
                href={slide.href}
                aria-label={slide.alt || "View slide"}
                className={`block ${sizing}`}
              >
                {image}
              </Link>
            ) : (
              <div key={`${slide.src}-${index}`} className={sizing}>
                {image}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
