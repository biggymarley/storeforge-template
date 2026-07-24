import Image from "next/image";
import Link from "next/link";
import { QuickAddButton } from "@/components/product/quick-add-button";
import { Price } from "@/components/ui/price";
import { StarRating } from "@/components/ui/star-rating";
import { getProductRating } from "@/lib/reviews";
import { flattenConnection, type ProductCard as ProductCardType } from "@/lib/shopify/types";

interface ProductCardProps {
  product: ProductCardType;
  /** Above-the-fold grids should prioritize their first images. */
  priority?: boolean;
}

/** Figma product card: 20px-radius secondary tile, 20px bold title, rating, price row. */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const rating = getProductRating(product.handle);
  const compareAt = product.compareAtPriceRange?.maxVariantPrice;

  // Quick-add only for simple products (exactly one variant) — anything with
  // real option choices (size/color) still routes to the PDP to pick one.
  const variants = flattenConnection(product.quickAddVariants);
  const quickAddVariant = variants.length === 1 && variants[0].availableForSale ? variants[0] : null;

  return (
    <div className="group flex h-full flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-card bg-secondary">
        <Link href={`/products/${product.handle}`} className="absolute inset-0 z-0" tabIndex={-1} aria-hidden="true">
          {product.featuredImage ? (
            <Image
              src={product.featuredImage.url}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted">No image</div>
          )}
        </Link>
        {!product.availableForSale ? (
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-background">
            Sold out
          </span>
        ) : null}
        {quickAddVariant ? (
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
            <QuickAddButton
              variantId={quickAddVariant.id}
              productTitle={product.title}
              price={product.priceRange.minVariantPrice}
              className="w-full"
            />
          </div>
        ) : null}
      </div>
      {/* Fixed-height title (always reserves 2 lines) + mt-auto price keeps ratings and
          prices on a shared baseline across every card in a row, regardless of title length. */}
      <Link href={`/products/${product.handle}`} className="flex flex-1 flex-col gap-2">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug transition-colors group-hover:text-muted">
          {product.title}
        </h3>
        {rating ? <StarRating rating={rating.rating} size={16} /> : null}
        <Price price={product.priceRange.minVariantPrice} compareAt={compareAt} className="mt-auto" />
      </Link>
    </div>
  );
}
