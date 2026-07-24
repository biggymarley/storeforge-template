import { ProductCard } from "@/components/product/product-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ButtonLink } from "@/components/ui/button";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

interface ProductSectionProps {
  title: string;
  products: ProductCardType[];
  /** Omit to hide the View All button (e.g. PDP recommendations). */
  viewAllHref?: string;
  /** First section on the page should prioritize its images. */
  priority?: boolean;
  /**
   * Secondary-context heading: smaller, left-aligned, aligned to the card rail.
   * Used on the PDP ("Related Products") so it doesn't compete with the H1 the
   * way the homepage's loud centered section heads do.
   */
  compact?: boolean;
}

// Only the cards visible without scrolling are worth prioritizing — beyond
// that, eager-loading every card in the row defeats the point of priority.
const PRIORITY_CARD_COUNT = 4;

/** Figma "NEW ARRIVALS"/"TOP SELLING" section: centered heading, horizontal card carousel, View All. */
export function ProductSection({ title, products, viewAllHref, priority = false, compact = false }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="min-w-0 max-w-full">
      {compact ? (
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-heading text-2xl uppercase leading-tight lg:text-[2rem]">{title}</h2>
        </div>
      ) : (
        <h2 className="text-center font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
          {title}
        </h2>
      )}
      <Carousel ariaLabel={title} className={`${compact ? "mt-6 lg:mt-8" : "mt-8 lg:mt-12"} mx-auto max-w-page px-4`}>
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem key={product.id} className="basis-[70%] lg:basis-[22%]">
              <ProductCard product={product} priority={priority && index < PRIORITY_CARD_COUNT} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {viewAllHref ? (
        <div className="mt-6 flex justify-center lg:mt-9">
          <ButtonLink variant="secondary" href={viewAllHref} className="w-full sm:w-auto sm:min-w-54">
            View All
          </ButtonLink>
        </div>
      ) : null}
    </section>
  );
}
