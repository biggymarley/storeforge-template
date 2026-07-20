"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrow } from "@/components/icons";

export interface HeroSlide {
  src: string;
  alt: string;
  /** Empty → slide is not clickable. */
  href: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

/** How long each slide stays still before auto-advancing. */
const HOLD_MS = 4500;
/** Duration of the slide transition itself — fast, then still. */
const SLIDE_MS = 550;
const SLIDE_EASING = "cubic-bezier(0.33, 1, 0.68, 1)";
/** Minimum horizontal drag to count as a swipe instead of a tap/click. */
const SWIPE_THRESHOLD_PX = 60;
/** Any drag past this suppresses the slide's link click on release. */
const DRAG_CLICK_SUPPRESS_PX = 10;

const SLIDE_SIZING = "relative h-[320px] w-full shrink-0 sm:h-[400px] lg:h-[663px]";
const ARROW_BUTTON =
  "absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background lg:size-12";

/**
 * Full-bleed hero slider — no text overlay, only navigation chrome. Stepped
 * autoplay (hold, fast slide, hold), seamless infinite loop via clones of the
 * first/last slide at either end of the track, prev/next arrows, dots, and
 * pointer swipe. Autoplay pauses on hover/focus/drag and is disabled entirely
 * under prefers-reduced-motion (arrows/dots/swipe still work).
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const count = slides.length;
  // Track = [last clone, ...slides, first clone]; `position` indexes into it,
  // so the real slide i lives at position i + 1.
  const [position, setPosition] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dragPx, setDragPx] = useState(0);
  const dragRef = useRef<{ startX: number; moved: boolean } | null>(null);
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
    dragRef.current = { startX: event.clientX, moved: false };
    dragPxRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > DRAG_CLICK_SUPPRESS_PX) drag.moved = true;
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
    const slide = slides[0];
    return (
      <section className="overflow-hidden bg-hero-background">
        <div className={SLIDE_SIZING}>
          <SlideImage slide={slide} priority />
        </div>
      </section>
    );
  }

  const loop = [slides[count - 1], ...slides, slides[0]];

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
          {loop.map((slide, index) => (
            <div
              key={`${slide.src}-${index}`}
              className={SLIDE_SIZING}
              aria-hidden={index !== position}
            >
              <SlideImage slide={slide} priority={index === 1} inert={index !== position} />
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
          {slides.map((slide, index) => (
            <button
              key={`${slide.src}-dot-${index}`}
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

function SlideImage({ slide, priority = false, inert = false }: { slide: HeroSlide; priority?: boolean; inert?: boolean }) {
  const image = (
    <Image
      src={slide.src}
      alt={slide.alt}
      fill
      priority={priority}
      sizes="100vw"
      className="object-cover"
      draggable={false}
    />
  );
  if (!slide.href) return image;
  return (
    <Link
      href={slide.href}
      aria-label={slide.alt || "View slide"}
      tabIndex={inert ? -1 : undefined}
      className="absolute inset-0"
      draggable={false}
    >
      {image}
    </Link>
  );
}
