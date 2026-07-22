"use client";

import useEmblaCarousel from "embla-carousel-react";
import {
  Children,
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode
} from "react";
import { IconArrow } from "@/components/icons";

interface CarouselProps {
  children: ReactNode;
  /** Announced on the scrollable region for screen readers, e.g. "Related Products". */
  ariaLabel: string;
  className?: string;
  /** Each slide's width below the lg breakpoint — controls how many show and the edge peek, e.g. "44%". */
  itemWidth: string;
  /** Each slide's width at lg and up. Omit to keep `itemWidth` at every size. */
  itemWidthLg?: string;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Shared horizontal carousel behind every card row on the site (product
 * sections, PDP recommendations) — built on Embla Carousel, the same
 * transform + overflow-hidden mechanism the hero slider already uses. Unlike
 * a hand-rolled flex/grid + overflow-x-auto track, a slide's own content
 * (long title, quick-add button) can never force the viewport wider than the
 * page — overflow-hidden on Embla's viewport clips it unconditionally.
 * Native drag/swipe/momentum comes from Embla; the chevrons are a desktop
 * convenience layered on top, disabled (not unmounted) at each end so
 * focus/layout stay put.
 */
export function Carousel({ children, ariaLabel, className = "", itemWidth, itemWidthLg }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps"
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((api: NonNullable<typeof emblaApi>) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      emblaApi?.scrollNext(prefersReducedMotion());
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      emblaApi?.scrollPrev(prefersReducedMotion());
    }
  };

  return (
    <div className={`group/carousel relative ${className}`}>
      <div
        ref={emblaRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="flex touch-pan-y gap-3.5 lg:gap-5">
          {Children.map(children, (child) => (
            <div
              className="carousel-slide min-w-0 shrink-0 grow-0"
              style={
                {
                  "--carousel-slide-basis": itemWidth,
                  "--carousel-slide-basis-lg": itemWidthLg
                } as CSSProperties
              }
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => emblaApi?.scrollPrev(prefersReducedMotion())}
        disabled={!canScrollPrev}
        className="absolute left-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-md transition-opacity disabled:invisible group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 lg:flex"
      >
        <IconArrow width={20} height={20} className="rotate-180" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => emblaApi?.scrollNext(prefersReducedMotion())}
        disabled={!canScrollNext}
        className="absolute right-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-md transition-opacity disabled:invisible group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 lg:flex"
      >
        <IconArrow width={20} height={20} />
      </button>
    </div>
  );
}
