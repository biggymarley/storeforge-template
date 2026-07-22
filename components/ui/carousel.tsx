"use client";

import { Children, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { IconArrow } from "@/components/icons";

interface CarouselProps {
  children: ReactNode;
  /** Announced on the scrollable region for screen readers, e.g. "Related Products". */
  ariaLabel: string;
  className?: string;
  /**
   * `grid-auto-columns` classes for the track, e.g.
   * `"auto-cols-[minmax(0,44%)] lg:auto-cols-[minmax(0,22%)]"`. Always wrap
   * the size in `minmax(0, …)` — a bare percentage (or a flex `width`) lets
   * a card's own content (long title, quick-add button) force that column
   * wider than intended, which blows out the track's contained scroll area
   * into full-page horizontal overflow. `minmax(0, …)` is the same guard
   * Tailwind's own `grid-cols-*`/`auto-cols-fr` utilities rely on.
   */
  itemClassName?: string;
}

const EDGE_THRESHOLD_PX = 4;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Shared horizontal scroll-snap carousel behind every card row on the site
 * (product sections, PDP recommendations). Native scroll/touch/drag does the
 * work; the chevrons are a desktop-only convenience layered on top and are
 * disabled (not unmounted, so focus/layout stay put) at each end of the track.
 * Card sizing — width, and therefore how much of the next card peeks in — is
 * entirely up to `itemClassName`; this component only owns scroll mechanics.
 *
 * The track is `grid` + `grid-auto-flow: column` rather than `flex` — grid
 * track sizing lets `minmax(0, …)` cap a column's minimum at 0 regardless of
 * what's inside it, so oversized card content can never force the track (and
 * therefore the page) wider than the viewport. A flex item's `width` doesn't
 * have that guarantee: its default `min-width: auto` still respects content,
 * which is exactly what caused this to blow out full-page horizontal scroll
 * on mobile before.
 */
export function Carousel({ children, ariaLabel, className = "", itemClassName = "" }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= EDGE_THRESHOLD_PX);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - EDGE_THRESHOLD_PX);
  }, []);

  // No dependency array: re-checks on every commit (including when the item
  // count/content changes) since scrollWidth can change without a resize.
  useLayoutEffect(() => {
    updateEdges();
  });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [updateEdges]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-item]");
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    const amount = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCard(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCard(-1);
    }
  };

  return (
    <div className={`group/carousel relative min-w-0 ${className}`}>
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={`grid grid-flow-col min-w-0 snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [&::-webkit-scrollbar]:hidden lg:gap-5 ${itemClassName}`}
      >
        {Children.map(children, (child) => (
          <div data-carousel-item className="min-w-0 snap-start">
            {child}
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollByCard(-1)}
        disabled={atStart}
        className="absolute left-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-md transition-opacity disabled:invisible group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 lg:flex"
      >
        <IconArrow width={20} height={20} className="rotate-180" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByCard(1)}
        disabled={atEnd}
        className="absolute right-2 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background text-foreground opacity-0 shadow-md transition-opacity disabled:invisible group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 lg:flex"
      >
        <IconArrow width={20} height={20} />
      </button>
    </div>
  );
}
