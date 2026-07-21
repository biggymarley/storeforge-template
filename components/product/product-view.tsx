"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { IconArrow } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/components/ui/toast";
import { TrustBadgesBanner } from "@/components/ui/trust-badges-banner";
import { trackAddToCart, trackViewContent } from "@/lib/analytics";
import { addToCart } from "@/lib/shopify/cart-actions";
import { flattenConnection, type Product, type ProductVariant, type ShopifyImage } from "@/lib/shopify/types";

interface ProductViewProps {
  product: Product;
  rating: { rating: number; count: number } | null;
  /** Variant id -> stock count. Missing/null entries render as available — no data, no badge. */
  inventory: Record<string, number | null>;
}

const LOW_STOCK_THRESHOLD = 10;

/** Shopify's placeholder option on variant-less products. */
function isDefaultOnlyOption(option: Product["options"][number]): boolean {
  return option.optionValues.length === 1 && option.optionValues[0].name === "Default Title";
}

/**
 * PDP top section (Figma 1:2 / 35:1062): thumb rail + main image left,
 * title/rating/price/options/qty/add-to-cart right. Selected options resolve
 * to a variant; price, compare-at and image follow it (PAGE-BLUEPRINTS §PDP).
 */
export function ProductView({ product, rating, inventory }: ProductViewProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<"cart" | "buy" | null>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  const thumbRailRef = useRef<HTMLDivElement>(null);
  const scrollThumbs = (direction: -1 | 1) => {
    thumbRailRef.current?.scrollBy({ left: direction * 100, behavior: "smooth" });
  };

  const variants = useMemo(() => flattenConnection(product.variants), [product.variants]);
  const images = useMemo<ShopifyImage[]>(() => {
    const all = flattenConnection(product.images);
    if (all.length > 0) return all;
    return product.featuredImage ? [product.featuredImage] : [];
  }, [product.images, product.featuredImage]);
  const options = product.options.filter((option) => !isDefaultOnlyOption(option));

  const defaultVariant = variants.find((variant) => variant.availableForSale) ?? variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries((defaultVariant?.selectedOptions ?? []).map((so) => [so.name, so.value]))
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const currentVariant: ProductVariant | undefined = variants.find((variant) =>
    variant.selectedOptions.every((so) => selected[so.name] === so.value)
  );

  // Gallery follows the selected variant's image.
  useEffect(() => {
    const url = currentVariant?.image?.url;
    if (!url) return;
    const index = images.findIndex((image) => image.url === url);
    if (index >= 0) setActiveImage(index);
  }, [currentVariant, images]);

  /** Would picking this value (keeping the other selections) hit a sellable variant? */
  const isValueAvailable = (optionName: string, value: string): boolean =>
    variants.some(
      (variant) =>
        variant.availableForSale &&
        variant.selectedOptions.every((so) =>
          so.name === optionName ? so.value === value : selected[so.name] === so.value
        )
    );

  const add = () => {
    if (!currentVariant) return;
    setActiveAction("cart");
    startTransition(async () => {
      const result = await addToCart(currentVariant.id, quantity);
      if (result.ok) {
        toast("Added to cart");
        trackAddToCart({
          contentId: currentVariant.id,
          value: Number(currentVariant.price.amount) * quantity,
          currency: currentVariant.price.currencyCode
        });
      } else {
        toast(result.error ?? "Could not add to cart.", "error");
      }
    });
  };

  // Adds the line then jumps straight to the /cart page — skips the mini-cart drawer.
  const buyNow = () => {
    if (!currentVariant) return;
    setActiveAction("buy");
    startTransition(async () => {
      const result = await addToCart(currentVariant.id, quantity);
      if (result.ok) {
        trackAddToCart({
          contentId: currentVariant.id,
          value: Number(currentVariant.price.amount) * quantity,
          currency: currentVariant.price.currencyCode
        });
        router.push("/cart");
      } else {
        toast(result.error ?? "Could not add to cart.", "error");
      }
    });
  };

  // Meta Pixel ViewContent — once per PDP visit.
  const minPrice = product.priceRange.minVariantPrice;
  useEffect(() => {
    trackViewContent({ contentId: product.id, value: Number(minPrice.amount), currency: minPrice.currencyCode });
  }, [product.id, minPrice.amount, minPrice.currencyCode]);

  // Mobile sticky CTA appears once the primary Add to Cart row scrolls out of view.
  useEffect(() => {
    const node = ctaRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const main = images[activeImage] ?? images[0];
  // Match the box to the actual photo's aspect ratio so object-contain never letterboxes
  // (which would push the visible image down, out of alignment with the title).
  const mainAspectRatio = main?.width && main?.height ? `${main.width} / ${main.height}` : "444 / 530";
  const outOfStock = currentVariant && !currentVariant.availableForSale;
  const cartLabel = outOfStock ? "Out of Stock" : pending && activeAction === "cart" ? "Adding…" : "Add to Cart";
  const buyNowLabel = outOfStock ? "Out of Stock" : pending && activeAction === "buy" ? "Adding…" : "Buy Now";

  // undefined (no map entry) and null (untracked variant) both mean "no data" — treated as available.
  const quantityAvailable = currentVariant ? inventory[currentVariant.id] : undefined;
  const showLowStock =
    currentVariant?.availableForSale &&
    typeof quantityAvailable === "number" &&
    quantityAvailable > 0 &&
    quantityAvailable <= LOW_STOCK_THRESHOLD;

  return (
    <div className="mt-5 grid gap-6 lg:mt-9 lg:grid-cols-2 lg:items-start lg:gap-10">
      {/* Gallery — main image on top, thumbnail rail below (min-w-0 so it can't widen the grid track).
          Sticky on desktop so it stays in view while the (usually taller) details column scrolls. */}
      <div className="min-w-0 flex flex-col gap-3.5 lg:sticky lg:top-24 lg:self-start">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: mainAspectRatio }}>
          {main ? (
            <Image
              src={main.url}
              alt={main.altText ?? product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-contain"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted">No image</div>
          )}
        </div>
        {images.length > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => scrollThumbs(-1)}
              className="hidden shrink-0 transition-opacity hover:opacity-60 lg:block"
            >
              <IconArrow width={20} height={20} className="rotate-180" />
            </button>
            <div
              ref={thumbRailRef}
              className="flex flex-1 gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={index === activeImage}
                  onClick={() => setActiveImage(index)}
                  className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-card bg-secondary lg:w-20 ${
                    index === activeImage ? "border border-primary" : ""
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText ?? product.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => scrollThumbs(1)}
              className="hidden shrink-0 transition-opacity hover:opacity-60 lg:block"
            >
              <IconArrow width={20} height={20} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Details */}
      <div className="min-w-0 flex flex-col">
        <h1 className="font-heading text-xl uppercase leading-tight lg:text-[2rem] lg:leading-none">
          {product.title}
        </h1>
        {rating ? (
          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={rating.rating} showLabel={false} />
            <span className="text-sm text-muted">({rating.count})</span>
          </div>
        ) : null}
        {currentVariant ? (
          <Price
            price={currentVariant.price}
            compareAt={currentVariant.compareAtPrice}
            size="lg"
            variant="save"
            className="mt-3"
          />
        ) : (
          <Price price={product.priceRange.minVariantPrice} size="lg" variant="save" className="mt-3" />
        )}
        {showLowStock ? (
          <p className="mt-2 text-sm font-medium text-accent">Only {quantityAvailable} left in stock</p>
        ) : null}
        {product.description ? (
          // Long Shopify descriptions get clamped here — the full rich text
          // lives in the Product Details tab below.
          <p className="mt-4 line-clamp-4 text-sm leading-5 text-muted lg:text-base lg:leading-[22px]">
            {product.description}
          </p>
        ) : null}

        {options.map((option) => (
          <div key={option.name} className="mt-6 border-t border-border pt-6">
            <h2 className="text-sm uppercase tracking-wide text-muted">{option.name}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {option.optionValues.map((value) => (
                <Chip
                  key={value.name}
                  size="lg"
                  variant="outline"
                  selected={selected[option.name] === value.name}
                  onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value.name }))}
                  className={isValueAvailable(option.name, value.name) ? "" : "text-muted line-through opacity-40"}
                >
                  {value.name}
                </Chip>
              ))}
            </div>
          </div>
        ))}

        <div ref={ctaRef} className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
          <div className="flex gap-4 lg:gap-5">
            <QuantityStepper
              quantity={quantity}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
              onIncrement={() => setQuantity((q) => q + 1)}
              disabled={pending}
              className="w-[130px] shrink-0 lg:w-[170px]"
            />
            <Button
              size="md"
              variant="primary"
              className="h-[52px] min-w-0 flex-1"
              onClick={buyNow}
              disabled={pending || !currentVariant || !currentVariant.availableForSale}
            >
              {buyNowLabel}
            </Button>
          </div>
          <Button
            size="md"
            variant="secondary"
            className="h-[52px] w-full"
            onClick={add}
            disabled={pending || !currentVariant || !currentVariant.availableForSale}
          >
            {cartLabel}
          </Button>
        </div>

        <TrustBadgesBanner className="mt-4" sizes="(max-width: 1024px) 100vw, 40vw" />
      </div>

      {/* Mobile-only: keeps a purchase path reachable once the row above scrolls out of view. */}
      {!ctaVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background p-4 lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.title}</p>
            {currentVariant ? <Price price={currentVariant.price} /> : null}
          </div>
          <Button
            size="md"
            variant="primary"
            className="h-12 min-w-36"
            onClick={buyNow}
            disabled={pending || !currentVariant || !currentVariant.availableForSale}
          >
            {buyNowLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
