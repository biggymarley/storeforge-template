import { CollectionTiles } from "@/components/home/collection-tiles";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";
import { TestimonialCarousel } from "@/components/home/testimonial-carousel";
import { BrandStrip } from "@/components/layout/brand-strip";
import { resolveContentConfig } from "@/lib/config";
import { getCollections, getHomeSectionProducts } from "@/lib/shopify/api";
import { ShopifyError } from "@/lib/shopify/client";
import type { Collection, ProductCard } from "@/lib/shopify/types";

const HOME_SECTION_HANDLES = ["new-arrivals", "top-selling"];

export default async function HomePage() {
  const content = resolveContentConfig();

  let newArrivals: ProductCard[] = [];
  let topSelling: ProductCard[] = [];
  let tileCollections: Collection[] = [];
  let dataError: string | null = null;

  try {
    // Section convention (README): a `new-arrivals`/`top-selling` collection
    // overrides the default sort-based sourcing.
    [newArrivals, topSelling, tileCollections] = await Promise.all([
      getHomeSectionProducts("new-arrivals", { sortKey: "CREATED_AT", reverse: true }),
      getHomeSectionProducts("top-selling", { sortKey: "BEST_SELLING" }),
      getCollections()
    ]);
  } catch (error) {
    if (!(error instanceof ShopifyError)) throw error;
    dataError = error.message;
  }

  return (
    <div className="flex flex-col gap-10 pb-2 lg:gap-16">
      <div>
        <Hero />
        <BrandStrip />
      </div>
      {dataError ? (
        <section className="mx-auto w-full max-w-310 px-4">
          <div className="rounded-card border border-border p-8 text-center">
            <h2 className="font-heading text-2xl uppercase">Products are unavailable right now</h2>
            <p className="mt-2 text-sm text-muted">{dataError}</p>
          </div>
        </section>
      ) : (
        <>
          <ProductSection title="New Arrivals" products={newArrivals} viewAllHref="/products?sort=newest" priority />
          {topSelling.length > 0 ? (
            <div className="mx-auto w-full max-w-310 px-4">
              <hr className="border-border" />
            </div>
          ) : null}
          <ProductSection title="Top Selling" products={topSelling} viewAllHref="/products?sort=best-selling" />
          <CollectionTiles
            collections={tileCollections.filter((collection) => !HOME_SECTION_HANDLES.includes(collection.handle))}
          />
        </>
      )}
      <TestimonialCarousel testimonials={content.testimonials} />
    </div>
  );
}
