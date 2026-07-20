import Image from "next/image";
import { resolveContentConfig } from "@/lib/config";

// Minimum logos per half so the track is wider than any realistic viewport —
// otherwise the loop runs out of duplicated content before it resets and a
// gap of empty space scrolls through mid-screen (same rule as the
// testimonial carousel, tuned for ~60px-wide logos instead of cards).
const MIN_LOGOS_PER_HALF = 16;

/**
 * Brand-logo band under the hero: logos in their original colors on the page
 * background, scrolling continuously. Same seamless-loop mechanism as
 * TestimonialCarousel — content duplicated into two identical halves and a
 * `translateX(-50%)` loop (globals.css .marquee); pauses on hover/focus and
 * honors prefers-reduced-motion. Hidden when config has no brands.
 */
export function BrandStrip() {
  const { brands } = resolveContentConfig();
  if (brands.length === 0) return null;

  const repeatsPerHalf = Math.max(1, Math.ceil(MIN_LOGOS_PER_HALF / brands.length));
  const half = Array.from({ length: repeatsPerHalf }, () => brands).flat();
  const loop = [...half, ...half];
  // Roughly constant per-logo speed regardless of how many brands a store has.
  const durationSeconds = Math.max(half.length * 3, 12);

  return (
    <section aria-label="Featured brands" className="bg-background">
      <div className="group relative overflow-hidden py-10 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] lg:py-11">
        <div className="marquee flex w-max items-center gap-x-12 lg:gap-x-16" style={{ animationDuration: `${durationSeconds}s` }}>
          {loop.map((brand, index) => (
            <Image
              key={`${brand.name}-${index}`}
              src={brand.logoSrc}
              alt={brand.name}
              width={60}
              height={60}
              className="size-15 shrink-0 object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
