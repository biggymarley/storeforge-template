import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductSection } from "@/components/home/product-section";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductView } from "@/components/product/product-view";
import { ErrorState } from "@/components/ui/error-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { getProduct, getProductRecommendations } from "@/lib/shopify/api";
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

/** Streams below the fold (Figma "You might also like"). */
async function Recommendations({ productId }: { productId: string }) {
  const products = await getProductRecommendations(productId).catch(() => []);
  if (products.length === 0) return null;
  return (
    <div className="mt-14 lg:mt-20">
      <ProductSection title="You might also like" products={products} />
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  try {
    const product = await getProduct(handle);
    if (!product) notFound();

    const reviews = getProductReviews(handle);

    return (
      <div className="mx-auto max-w-310 px-4 pb-2 pt-5 lg:pt-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)) }}
        />
        <Breadcrumbs
          items={[{ label: "All Products", href: "/products" }, { label: product.title }]}
          className="text-sm lg:text-base"
        />
        <ProductView product={product} rating={getProductRating(handle)} />
        <ProductTabs descriptionHtml={product.descriptionHtml} reviews={reviews} />
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
    );
  } catch (error) {
    if (!(error instanceof ShopifyError)) throw error;
    return <ErrorState title="This product is unavailable" message={error.message} />;
  }
}
