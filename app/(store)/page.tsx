import { CollectionTiles } from "@/components/home/collection-tiles";
import { FaqSection } from "@/components/home/faq-section";
import { FeatureCards } from "@/components/home/feature-cards";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";
import { StickyShopCta } from "@/components/home/sticky-shop-cta";
import { TestimonialCarousel } from "@/components/home/testimonial-carousel";
import { TrustBar } from "@/components/home/trust-bar";
import { UgcGallery } from "@/components/home/ugc-gallery";
import { BrandStrip } from "@/components/layout/brand-strip";
import { TrustBadgesBanner } from "@/components/ui/trust-badges-banner";
import { resolveContentConfig, resolveLegalConfig, resolveStoreConfig } from "@/lib/config";
import { getAggregateRating } from "@/lib/reviews";
import { getCollections, getHomeSectionProducts, getProduct } from "@/lib/shopify/api";
import { ShopifyError } from "@/lib/shopify/client";
import type { Collection, Product, ProductCard } from "@/lib/shopify/types";

const HOME_SECTION_HANDLES = ["new-arrivals", "top-selling"];

export default async function HomePage() {
  const store = resolveStoreConfig();
  const content = resolveContentConfig();
  const legal = resolveLegalConfig();

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

  // Full-bleed carousel ("products" mode): resolve each configured handle,
  // skipping any that fails (deleted/unpublished) or lacks a photo — one bad
  // handle never breaks the carousel. If nothing resolves, the standard hero
  // below takes over.
  let carouselProducts: ProductCard[] = [];
  if (store.hero.carousel?.type === "products") {
    const resolved = await Promise.all(
      store.hero.carousel.productHandles.map((handle) => getProduct(handle).catch(() => null))
    );
    carouselProducts = resolved.filter((product): product is Product => Boolean(product?.featuredImage));
  }
  const heroCarouselActive = store.hero.carousel?.type === "images" || carouselProducts.length > 0;

  // Hero visual: a store-owned image always wins. Otherwise feature a live
  // product — the pinned config.hero.productHandle if set, else the best
  // seller/newest arrival already fetched above. A bad/missing handle never
  // breaks the page — it just falls through to the automatic pick.
  let heroProduct: ProductCard | null = null;
  if (!heroCarouselActive && !store.hero.image) {
    if (store.hero.productHandle) {
      try {
        heroProduct = await getProduct(store.hero.productHandle);
      } catch {
        heroProduct = null;
      }
    }
    heroProduct ??= topSelling[0] ?? newArrivals[0] ?? null;
  }

  // Weighted rating across everything shown on the homepage today — no new
  // config, just the existing per-product review data (lib/reviews.ts).
  const homepageHandles = [
    ...(heroProduct ? [heroProduct.handle] : []),
    ...carouselProducts.map((p) => p.handle),
    ...newArrivals.map((p) => p.handle),
    ...topSelling.map((p) => p.handle)
  ];
  const aggregateRating = getAggregateRating(homepageHandles);

  return (
    <div className="flex flex-col gap-10 pb-2 lg:gap-16">
      <div>
        <Hero heroProduct={heroProduct} aggregateRating={aggregateRating} carouselProducts={carouselProducts} />
        <TrustBar policies={legal.policies} trustBar={content.trustBar} />
      </div>
      {dataError ? (
        <section className="mx-auto w-full max-w-page px-4">
          <div className="rounded-card border border-border p-8 text-center">
            <h2 className="font-heading text-2xl uppercase">Products are unavailable right now</h2>
            <p className="mt-2 text-sm text-muted">{dataError}</p>
          </div>
        </section>
      ) : (
        <>
          <ProductSection title="New Arrivals" products={newArrivals} viewAllHref="/products?sort=newest" priority />
          <div className="mx-auto w-full max-w-page px-4">
            <TrustBadgesBanner image={store.trustBadges.image} alt={store.trustBadges.alt} />
          </div>
          <UgcGallery images={content.gallery} />
          <ProductSection title="Top Selling" products={topSelling} viewAllHref="/products?sort=best-selling" />
          <CollectionTiles
            collections={tileCollections.filter((collection) => !HOME_SECTION_HANDLES.includes(collection.handle))}
          />
        </>
      )}
      <FeatureCards legal={legal} cards={content.featureCards} />
      <TestimonialCarousel testimonials={content.testimonials} />
      <FaqSection faqs={content.faqs} />
      <BrandStrip />
      <StickyShopCta />
    </div>
  );
}
