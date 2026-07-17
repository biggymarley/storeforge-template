import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/ui/price";
import { StarRating } from "@/components/ui/star-rating";
import { getProductRating } from "@/lib/reviews";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

interface ProductCardProps {
  product: ProductCardType;
  /** Above-the-fold grids should prioritize their first images. */
  priority?: boolean;
}

/** Figma product card: 20px-radius secondary tile, 20px bold title, rating, price row. */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const rating = getProductRating(product.handle);
  const compareAt = product.compareAtPriceRange?.maxVariantPrice;

  return (
    <Link href={`/products/${product.handle}`} className="group flex flex-col gap-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-card bg-secondary">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-muted">No image</div>
        )}
        {!product.availableForSale ? (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-background">
            Sold out
          </span>
        ) : null}
      </div>
      <h3 className="mt-1 text-xl font-bold">{product.title}</h3>
      {rating ? <StarRating rating={rating.rating} /> : null}
      <Price price={product.priceRange.minVariantPrice} compareAt={compareAt} />
    </Link>
  );
}
