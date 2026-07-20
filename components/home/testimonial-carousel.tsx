import { ReviewCard } from "@/components/product/review-card";
import type { Testimonial } from "@/lib/types/config";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

// Minimum cards per half so the track is wider than any realistic viewport —
// otherwise the loop runs out of duplicated content before it resets and a
// gap of empty space scrolls through mid-screen.
const MIN_CARDS_PER_HALF = 8;

/**
 * Figma "OUR HAPPY CUSTOMERS": centered heading, then a continuously
 * scrolling card rail. Content is duplicated into two identical halves (each
 * padded out to MIN_CARDS_PER_HALF so the track always outruns the
 * viewport); a `translateX(-50%)` loop is then seamless. Pauses on
 * hover/focus and honors prefers-reduced-motion (globals.css .marquee). No
 * client JS needed — pure CSS animation. Config-driven; hidden when empty.
 */
export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  if (testimonials.length === 0) return null;

  const repeatsPerHalf = Math.max(1, Math.ceil(MIN_CARDS_PER_HALF / testimonials.length));
  const half = Array.from({ length: repeatsPerHalf }, () => testimonials).flat();
  const loop = [...half, ...half];
  // Roughly constant per-card speed regardless of how many testimonials a store has.
  const durationSeconds = Math.max(half.length * 6, 18);

  return (
    <section>
      <h2 className="mx-auto max-w-page px-4 text-center font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
        Our Happy Customers
      </h2>
      <div className="group relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] lg:mt-10">
        <div className="marquee flex w-max gap-4 lg:gap-5" style={{ animationDuration: `${durationSeconds}s` }}>
          {loop.map((testimonial, index) => (
            <ReviewCard
              key={`${testimonial.name}-${index}`}
              name={testimonial.name}
              quote={testimonial.quote}
              rating={testimonial.rating}
              date={testimonial.date}
              verified={testimonial.verified}
              className="w-[315px] shrink-0 bg-background lg:w-100"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
