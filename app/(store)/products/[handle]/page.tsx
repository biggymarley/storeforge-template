import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandStrip } from "@/components/layout/brand-strip";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FeatureCards } from "@/components/home/feature-cards";
import { ProductSection } from "@/components/home/product-section";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductView } from "@/components/product/product-view";
import { ErrorState } from "@/components/ui/error-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { TrustBadgesBanner } from "@/components/ui/trust-badges-banner";
import { resolveContentConfig, resolveLegalConfig } from "@/lib/config";
import { getProductFaqs } from "@/lib/faqs";
import { getProduct, getProductInventory, getProductRecommendations, getProducts } from "@/lib/shopify/api";
import { ShopifyError } from "@/lib/shopify/client";
import { getProductRating, getProductReviews } from "@/lib/reviews";
import { productJsonLd } from "@/lib/json-ld";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  try {
    const product = await getProduct(handle);
    if (!product) return {};
    return {
      title: product.seo.title ?? product.title,
      description: product.seo.description ?? (product.description.slice(0, 160) || undefined),
      openGraph: product.featuredImage ? { images: [{ url: product.featuredImage.url }] } : undefined
    };
  } catch {
    return {};
  }
}

/**
 * Streams below the fold — Shopify's product recommendations, in place of a
 * testimonials section. Falls back to a general product listing (excluding
 * the current product) when Shopify has no recommendations for it, so the
 * section never disappears — it's still labeled "Related Products" either way.
 */
async function Recommendations({ productId }: { productId: string }) {
  let products = await getProductRecommendations(productId).catch(() => []);
  if (products.length === 0) {
    try {
      const { products: fallbackProducts } = await getProducts({ first: 8, sortKey: "BEST_SELLING" });
      products = fallbackProducts.filter((product) => product.id !== productId);
    } catch {
      products = [];
    }
  }
  if (products.length === 0) return null;
  return (
    <div className="mt-14 lg:mt-20">
      <ProductSection title="Related Products" products={products} />
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  try {
    const product = await getProduct(handle);
    if (!product) notFound();

    const reviews = getProductReviews(handle);
    const faqs = getProductFaqs(handle);
    const legal = resolveLegalConfig();
    const content = resolveContentConfig();
    // Isolated from getProduct above: a missing Storefront inventory scope only
    // drops the stock badge, never the page (see PRODUCT_INVENTORY_QUERY comment).
    const inventory = await getProductInventory(handle).catch(() => ({}));

    return (
      <>
        <div className="mx-auto max-w-page px-4 pb-2 pt-5 lg:pt-6">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
          />
          <Breadcrumbs
            items={[{ label: "All Products", href: "/products" }, { label: product.title }]}
            className="text-sm lg:text-base"
          />
          <ProductView
            product={product}
            rating={getProductRating(handle)}
            policies={legal.policies}
            inventory={inventory}
          />
          <ProductTabs descriptionHtml={product.descriptionHtml} reviews={reviews} faqs={faqs} />
          <TrustBadgesBanner className="mt-14 lg:mt-20" />
          <Suspense
            fallback={
              <div className="mt-14 grid grid-cols-2 gap-x-3.5 gap-y-6 lg:mt-20 lg:grid-cols-4 lg:gap-5">
                {Array.from({ length: 4 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <Recommendations productId={product.id} />
          </Suspense>
        </div>
        <FeatureCards legal={legal} cards={content.featureCards} className="mt-14 lg:mt-20" />
        <BrandStrip />
      </>
    );
  } catch (error) {
    if (!(error instanceof ShopifyError)) throw error;
    return <ErrorState title="This product is unavailable" message={error.message} />;
  }
}
