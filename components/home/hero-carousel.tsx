"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrow } from "@/components/icons";
import { QuickAddButton } from "@/components/product/quick-add-button";
import { ButtonLink } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { StarRating } from "@/components/ui/star-rating";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

export type HeroCarouselItem =
  | {
      kind: "image";
      src: string;
      alt: string;
      /** Empty → slide is not clickable. */
      href: string;
    }
  | {
      kind: "product";
      product: ProductCardType;
      rating: { rating: number; count: number } | null;
      /** Single sellable variant id (product-card.tsx quick-add rule) — null routes the CTA to the PDP instead. */
      quickAddVariantId: string | null;
    };

interface HeroCarouselProps {
  items: HeroCarouselItem[];
}

/** How long each slide stays still before auto-advancing. */
const HOLD_MS = 4500;
/** Duration of the slide transition itself — fast, then still. */
const SLIDE_MS = 550;
const SLIDE_EASING = "cubic-bezier(0.33, 1, 0.68, 1)";
/** Minimum horizontal drag to count as a swipe instead of a tap/click. */
const SWIPE_THRESHOLD_PX = 60;
/** Drag past this becomes a real drag: pointer capture starts and the release click is suppressed. */
const DRAG_START_PX = 10;

const ARROW_BUTTON =
  "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background lg:size-12";

/**
 * Full-bleed hero slider. Stepped autoplay (hold, fast slide, hold), seamless
 * infinite loop via clones of the first/last slide at either end of the track,
 * prev/next arrows, dots, and pointer swipe. Autoplay pauses on
 * hover/focus/drag and is disabled entirely under prefers-reduced-motion
 * (arrows/dots/swipe still work).
 *
 * Two slide kinds: "image" renders the store's banner at its natural aspect
 * ratio (never cropped); "product" is a designed slide — title, rating, price,
 * add-to-cart/buy CTA — at the standard hero heights.
 */
export function HeroCarousel({ items }: HeroCarouselProps) {
  const count = items.length;
  // Track = [last clone, ...items, first clone]; `position` indexes into it,
  // so the real slide i lives at position i + 1.
  const [position, setPosition] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const dragRef = useRef<{ startX: number; pointerId: number; moved: boolean } | null>(null);
  const dragPxRef = useRef(0);
  // pointerup (and endDrag) fires before the browser's click — this carries
  // "that was a swipe, not a tap" across to onClickCapture.
  const suppressClickRef = useRef(false);

  const realIndex = (position - 1 + count) % count;

  const step = useCallback(
    (delta: number) => {
      setAnimate(true);
      // Clamp to the clones — while a clone is settling, extra clicks are ignored.
      setPosition((current) => Math.min(Math.max(current + delta, 0), count + 1));
    },
    [count]
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Autoplay: every position change restarts the hold timer.
  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    const id = setTimeout(() => step(1), HOLD_MS);
    return () => clearTimeout(id);
  }, [position, paused, reducedMotion, count, step]);

  // Landed on a clone → once the transition finishes, snap (no animation) to
  // the identical real slide so the loop can continue seamlessly.
  useEffect(() => {
    if (position !== 0 && position !== count + 1) return;
    const id = setTimeout(
      () => {
        setAnimate(false);
        setPosition(position === 0 ? count : 1);
      },
      reducedMotion ? 0 : SLIDE_MS
    );
    return () => clearTimeout(id);
  }, [position, count, reducedMotion]);

  // Re-enable transitions only after the snap frame has painted.
  useEffect(() => {
    if (animate) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [animate]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = { startX: event.clientX, pointerId: event.pointerId, moved: false };
    dragPxRef.current = 0;
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) <= DRAG_START_PX) return;
      drag.moved = true;
      // Capture only once it's a real drag — capturing on pointerdown would
      // retarget the release click away from slide links and buy buttons.
      event.currentTarget.setPointerCapture(drag.pointerId);
    }
    dragPxRef.current = dx;
    setAnimate(false);
    setDragPx(dx);
  };

  const endDrag = () => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    suppressClickRef.current = drag.moved;
    const dx = dragPxRef.current;
    dragPxRef.current = 0;
    setDragPx(0);
    if (dx <= -SWIPE_THRESHOLD_PX) step(1);
    else if (dx >= SWIPE_THRESHOLD_PX) step(-1);
    else setAnimate(true);
  };

  // A real drag must not fire the slide link's click on release.
  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  if (count === 0) return null;

  if (count === 1) {
    return (
      <section className="overflow-hidden bg-hero-background">
        <Slide item={items[0]} priority />
      </section>
    );
  }

  const loop = [items[count - 1], ...items, items[0]];

  return (
    <section
      className="overflow-hidden bg-hero-background"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden">
        <div
          className="flex touch-pan-y select-none"
          style={{
            transform: `translateX(calc(${-100 * position}% + ${dragPx}px))`,
            transition: animate && !reducedMotion ? `transform ${SLIDE_MS}ms ${SLIDE_EASING}` : "none"
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          {loop.map((item, index) => (
            <div
              key={`${item.kind}-${index}`}
              className="w-full shrink-0"
              // React 19 boolean inert: inactive slides (and the clones) are
              // unfocusable and hidden from assistive tech.
              inert={index !== position}
            >
              <Slide item={item} priority={index === 1} />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => step(-1)}
          className={`${ARROW_BUTTON} left-3 lg:left-5`}
        >
          <IconArrow width={20} height={20} className="rotate-180" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => step(1)}
          className={`${ARROW_BUTTON} right-3 lg:right-5`}
        >
          <IconArrow width={20} height={20} />
        </button>

        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 lg:bottom-6">
          {items.map((item, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === realIndex}
              onClick={() => {
                setAnimate(true);
                setPosition(index + 1);
              }}
              className={`h-2.5 rounded-full border border-border/50 shadow-sm transition-all duration-300 ${
                index === realIndex ? "w-7 bg-background" : "w-2.5 bg-background/50 hover:bg-background/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Slide({ item, priority = false }: { item: HeroCarouselItem; priority?: boolean }) {
  if (item.kind === "image") return <ImageSlide item={item} priority={priority} />;
  return <ProductSlide item={item} priority={priority} />;
}

/**
 * Banner slide at the image's natural aspect ratio — never cropped. The
 * width/height props are only a pre-load aspect hint (typical wide banner);
 * `h-auto w-full` hands sizing to the image's real intrinsic ratio once loaded.
 */
function ImageSlide({
  item,
  priority
}: {
  item: Extract<HeroCarouselItem, { kind: "image" }>;
  priority: boolean;
}) {
  const image = (
    <Image
      src={item.src}
      alt={item.alt}
      width={2000}
      height={650}
      priority={priority}
      sizes="100vw"
      className="h-auto w-full"
      draggable={false}
    />
  );
  if (!item.href) return image;
  return (
    <Link href={item.href} aria-label={item.alt || "View slide"} className="block" draggable={false}>
      {image}
    </Link>
  );
}

/**
 * Designed product slide — same visual language as the standard hero (heading
 * left, floating product photo right, stacked on mobile) plus a buy CTA:
 * one-click add-to-cart for single-variant products, otherwise a Buy Now link
 * to the PDP. Extra horizontal/bottom padding keeps content clear of the
 * arrows and dots.
 */
function ProductSlide({
  item,
  priority
}: {
  item: Extract<HeroCarouselItem, { kind: "product" }>;
  priority: boolean;
}) {
  const { product, rating, quickAddVariantId } = item;
  const pdpHref = `/products/${product.handle}`;

  return (
    <div className="flex min-h-[440px] w-full items-center sm:min-h-[500px] lg:min-h-[663px]">
      <div className="mx-auto grid w-full max-w-page items-center gap-6 px-12 pb-16 pt-8 lg:grid-cols-[minmax(0,577px)_minmax(0,1fr)] lg:gap-4 lg:px-4 lg:py-16">
        <div className="order-2 flex flex-col items-center gap-4 text-center lg:order-1 lg:items-start lg:gap-6 lg:text-left">
          <h2 className="font-heading text-3xl uppercase leading-[0.95] lg:text-5xl">{product.title}</h2>
          {rating ? (
            <div className="flex items-center gap-2">
              <StarRating rating={rating.rating} showLabel={false} size={18} />
              <span className="text-sm text-muted">
                {rating.rating}/5 · {rating.count} reviews
              </span>
            </div>
          ) : null}
          <Price
            price={product.priceRange.minVariantPrice}
            compareAt={product.compareAtPriceRange?.maxVariantPrice}
            size="lg"
          />
          <div className="flex w-full items-center justify-center gap-3 sm:w-auto lg:justify-start">
            {quickAddVariantId ? (
              <QuickAddButton
                variantId={quickAddVariantId}
                productTitle={product.title}
                price={product.priceRange.minVariantPrice}
                label="Add to Cart"
                size="lg"
                className="flex-1 sm:flex-initial lg:min-w-52"
              />
            ) : (
              <ButtonLink href={pdpHref} className="flex-1 sm:flex-initial lg:min-w-52">
                {product.availableForSale ? "Buy Now" : "View Product"}
              </ButtonLink>
            )}
            <Link
              href={pdpHref}
              aria-label={`View ${product.title}`}
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary lg:size-15"
            >
              <IconArrow width={20} height={20} />
            </Link>
          </div>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:self-stretch lg:items-center">
          {product.featuredImage ? (
            <div className="hero-float relative aspect-square w-[65%] max-w-[280px] sm:max-w-[340px] lg:w-full lg:max-w-[520px]">
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
                fill
                priority={priority}
                sizes="(max-width: 1024px) 65vw, 45vw"
                className="object-contain drop-shadow-2xl"
                draggable={false}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
