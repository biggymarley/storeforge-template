"use client";

import { useRef } from "react";
import { IconArrow } from "@/components/icons";
import { ReviewCard } from "@/components/product/review-card";
import type { Testimonial } from "@/lib/types/config";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

/**
 * Figma "OUR HAPPY CUSTOMERS" (node 24:713): heading + arrow controls, then a
 * scroll-snap card rail with faded edges. Config-driven; hidden when empty.
 */
export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  if (testimonials.length === 0) return null;

  const scrollByCard = (direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * 420, behavior: "smooth" });
  };

  return (
    <section>
      <div className="mx-auto flex max-w-310 items-end justify-between gap-4 px-4">
        <h2 className="font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
          Our Happy Customers
        </h2>
        <div className="mb-1 flex shrink-0 gap-4">
          <button
            type="button"
            aria-label="Previous testimonials"
            onClick={() => scrollByCard(-1)}
            className="transition-opacity hover:opacity-60"
          >
            <IconArrow width={24} height={24} className="rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next testimonials"
            onClick={() => scrollByCard(1)}
            className="transition-opacity hover:opacity-60"
          >
            <IconArrow width={24} height={24} />
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:mt-10 lg:gap-5 lg:px-[max(1rem,calc((100vw-1240px)/2))] lg:[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((testimonial) => (
          <ReviewCard
            key={testimonial.name}
            name={testimonial.name}
            quote={testimonial.quote}
            rating={testimonial.rating}
            date={testimonial.date}
            verified={testimonial.verified}
            className="w-[315px] shrink-0 snap-center bg-background lg:w-100 lg:snap-start"
          />
        ))}
      </div>
    </section>
  );
}
