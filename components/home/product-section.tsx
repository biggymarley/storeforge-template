import { ProductCard } from "@/components/product/product-card";
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

/** Figma "NEW ARRIVALS"/"TOP SELLING" section: centered heading, 4-up grid, View All. */
export function ProductSection({ title, products, viewAllHref, priority = false }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-310 px-4">
      <h2 className="text-center font-heading text-[2rem] uppercase leading-9 lg:text-5xl lg:leading-none">
        {title}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-x-3.5 gap-y-6 lg:mt-14 lg:grid-cols-4 lg:gap-5">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} priority={priority} />
        ))}
      </div>
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
