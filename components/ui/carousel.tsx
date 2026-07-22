"use client";

import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ComponentProps,
  type KeyboardEvent
} from "react";
import { IconArrow } from "@/components/icons";

type CarouselApi = UseEmblaCarouselType[1];

interface CarouselContextValue {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel(): CarouselContextValue {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("Carousel.Content/Previous/Next must be used inside <Carousel>");
  return context;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface CarouselRootProps extends ComponentProps<"div"> {
  ariaLabel: string;
}

/**
 * Shared horizontal carousel behind every card row on the site (product
 * sections, PDP recommendations) — the same Embla Carousel structure
 * (context + explicit Content/Item/Previous/Next) shadcn/ui's own Carousel
 * ships, adapted to this template's own button/icon styling instead of
 * pulling in shadcn's Button/lucide-react. Embla's viewport clips via
 * overflow-hidden unconditionally, so a card's own content can never force
 * it wider than the page — the same mechanism the hero slider already uses.
 */
export function Carousel({ ariaLabel, className = "", children, ...props }: CarouselRootProps) {
  const [carouselRef, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  const scrollPrev = useCallback(() => api?.scrollPrev(prefersReducedMotion()), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(prefersReducedMotion()), [api]);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", onSelect).on("reInit", onSelect);
    return () => {
      api.off("select", onSelect).off("reInit", onSelect);
    };
  }, [api, onSelect]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    }
  };

  return (
    <CarouselContext.Provider value={{ scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={`group/carousel relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
        {...props}
      >
        <CarouselViewportContext.Provider value={carouselRef}>{children}</CarouselViewportContext.Provider>
      </div>
    </CarouselContext.Provider>
  );
}

const CarouselViewportContext = createContext<ReturnType<typeof useEmblaCarousel>[0] | null>(null);

export function CarouselContent({ className = "", ...props }: ComponentProps<"div">) {
  const carouselRef = useContext(CarouselViewportContext);
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={`flex touch-pan-y gap-3.5 lg:gap-5 ${className}`} {...props} />
    </div>
  );
}

/** Each slide's own width, e.g. `className="basis-[44%] lg:basis-[22%]"` — written directly at the call site. */
export function CarouselItem({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={`min-w-0 shrink-0 grow-0 ${className}`}
      {...props}
    />
  );
}

const ARROW_BUTTON =
  "absolute top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 text-foreground opacity-0 shadow-sm backdrop-blur transition-colors transition-opacity disabled:invisible group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 hover:bg-background lg:flex";

export function CarouselPrevious() {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Previous"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={`${ARROW_BUTTON} left-2`}
    >
      <IconArrow width={20} height={20} className="rotate-180" />
    </button>
  );
}

export function CarouselNext() {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Next"
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={`${ARROW_BUTTON} right-2`}
    >
      <IconArrow width={20} height={20} />
    </button>
  );
}
