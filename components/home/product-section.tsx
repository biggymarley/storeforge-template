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
}

// Only the cards visible without scrolling are worth prioritizing — beyond
// that, eager-loading every card in the row defeats the point of priority.
const PRIORITY_CARD_COUNT = 4;

/** Figma "NEW ARRIVALS"/"TOP SELLING" section: centered heading, horizontal card carousel, View All. */
export function ProductSection({ title, products, viewAllHref, priority = false }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="min-w-0 max-w-page px-4">
      <h2 className="text-center font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
        {title}
      </h2>
      <Carousel ariaLabel={title} className="mt-8 lg:mt-14">
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem key={product.id} className="basis-[44%] lg:basis-[22%]">
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
