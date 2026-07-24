"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { IconArrow, IconCart, IconShield } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PaymentBadges } from "@/components/ui/payment-badges";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/components/ui/toast";
import { trackAddToCart, trackViewContent } from "@/lib/analytics";
import { addToCart } from "@/lib/shopify/cart-actions";
import { flattenConnection, type Product, type ProductVariant, type ShopifyImage } from "@/lib/shopify/types";

interface ProductViewProps {
  product: Product;
  rating: { rating: number; count: number } | null;
  /** Variant id -> stock count. Missing/null entries render as available — no data, no badge. */
  inventory: Record<string, number | null>;
  /** `enabled` gates the reassurance row; `image`/`alt` retained for config/store-bulk compatibility. */
  trustBadges: { image: string; alt: string; enabled: boolean };
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
export function ProductView({ product, rating, inventory, trustBadges }: ProductViewProps) {
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

  /** A representative variant image for an option value (first variant carrying that value with a photo). */
  const optionValueImage = (optionName: string, value: string): string | undefined =>
    variants.find(
      (variant) =>
        variant.image?.url && variant.selectedOptions.some((so) => so.name === optionName && so.value === value)
    )?.image?.url;

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
  // Fixed square frame regardless of the photo's own dimensions — object-contain
  // centers each image inside the bg-secondary frame, so tall or wide product shots
  // stay perfectly aligned across the catalog instead of stretching the box.
  const mainAspectRatio = 1;
  const outOfStock = currentVariant && !currentVariant.availableForSale;

  // Discount % for the gallery badge — derived from the active variant's compare-at.
  const activePrice = currentVariant?.price ?? product.priceRange.minVariantPrice;
  const activeCompareAt = currentVariant?.compareAtPrice ?? null;
  const discountPercent =
    activeCompareAt && Number(activeCompareAt.amount) > Number(activePrice.amount)
      ? Math.round(((Number(activeCompareAt.amount) - Number(activePrice.amount)) / Number(activeCompareAt.amount)) * 100)
      : 0;

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
        <div className="group relative w-full overflow-hidden rounded-card border border-border bg-secondary">
          <div className="relative w-full" style={{ aspectRatio: mainAspectRatio }}>
            {main ? (
              <Image
                src={main.url}
                alt={main.altText ?? product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted">No image</div>
            )}
          </div>
          {outOfStock ? (
            <div className="absolute left-4 top-4 rounded-full bg-primary/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
              Sold out
            </div>
          ) : discountPercent > 0 ? (
            <div className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">
              -{discountPercent}%
            </div>
          ) : null}
          {images.length > 1 ? (
            <div className="absolute bottom-4 right-4 rounded-full bg-primary/70 px-2.5 py-1 text-xs font-medium text-background backdrop-blur-sm">
              {activeImage + 1} / {images.length}
            </div>
          ) : null}
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
                  className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-card bg-secondary transition lg:w-20 ${
                    index === activeImage
                      ? "ring-2 ring-inset ring-primary"
                      : "border border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText ?? product.title}
                    fill
                    sizes="80px"
                    className="object-contain p-1.5"
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
        <h1 className="mt-1.5 font-heading text-xl uppercase leading-tight lg:text-[2rem] lg:leading-none">
          {product.title}
        </h1>
        {rating ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <StarRating rating={rating.rating} showLabel={false} />
            <span className="text-sm font-semibold">{rating.rating.toFixed(1)}</span>
            <span className="text-sm text-muted">
              ({rating.count} review{rating.count === 1 ? "" : "s"})
            </span>
          </div>
        ) : null}
        {currentVariant ? (
          <Price
            price={currentVariant.price}
            compareAt={currentVariant.compareAtPrice}
            size="lg"
            variant="save"
            className="mt-4"
          />
        ) : (
          <Price price={product.priceRange.minVariantPrice} size="lg" variant="save" className="mt-4" />
        )}

        {/* Availability pill — green when in stock, accent when running low. */}
        {!outOfStock ? (
          <div className="mt-3 inline-flex w-fit items-center gap-2 text-sm font-medium">
            <span className="relative flex size-2.5">
              <span className={`absolute inline-flex size-full rounded-full ${showLowStock ? "bg-accent" : "bg-success"}`} />
            </span>
            {showLowStock ? (
              <span className="text-accent">Only {quantityAvailable} left in stock</span>
            ) : (
              <span className="text-success">In stock, ready to ship</span>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm font-medium text-muted">Currently out of stock</p>
        )}

        {product.description ? (
          // Long Shopify descriptions get clamped here — the full rich text
          // lives in the Product Details tab below.
          <p className="mt-4 line-clamp-4 text-sm leading-5 text-muted lg:text-base lg:leading-[22px]">
            {product.description}
          </p>
        ) : null}

        {options.map((option) => {
          // Image-swatch mode only when values map to genuinely different photos
          // (color/bundle/style). Same-image options (e.g. size) stay text chips.
          const valueImages = new Map(
            option.optionValues.map((value) => [value.name, optionValueImage(option.name, value.name)])
          );
          const useImages = new Set([...valueImages.values()].filter(Boolean)).size >= 2;
          const selectedValue = selected[option.name];

          return (
            <div key={option.name} className="mt-6 border-t border-border pt-6">
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm uppercase tracking-wide text-muted">{option.name}</h2>
                {useImages && selectedValue ? <span className="text-sm font-medium">{selectedValue}</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {option.optionValues.map((value) => {
                  const available = isValueAvailable(option.name, value.name);
                  const isSelected = selectedValue === value.name;

                  if (useImages) {
                    const image = valueImages.get(value.name);
                    return (
                      <button
                        key={value.name}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value.name }))}
                        className={`flex max-w-full items-center gap-3 rounded-card border p-2 pr-3.5 text-left transition ${
                          isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/30"
                        } ${available ? "" : "opacity-40"}`}
                      >
                        <span className="relative size-11 shrink-0 overflow-hidden rounded-md bg-secondary">
                          {image ? (
                            <Image src={image} alt="" fill sizes="44px" className="object-contain p-1" />
                          ) : null}
                        </span>
                        <span className={`text-sm font-medium leading-snug ${available ? "" : "line-through"}`}>
                          {value.name}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <Chip
                      key={value.name}
                      size="lg"
                      variant="outline"
                      selected={isSelected}
                      onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value.name }))}
                      className={available ? "" : "text-muted line-through opacity-40"}
                    >
                      {value.name}
                    </Chip>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Buy box — quantity, primary actions, and reassurance grouped in one card. */}
        <div ref={ctaRef} className="mt-6 flex flex-col gap-4 rounded-card border border-border p-4 lg:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 lg:gap-5">
            <QuantityStepper
              quantity={quantity}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
              onIncrement={() => setQuantity((q) => q + 1)}
              disabled={pending}
              className="w-full shrink-0 sm:w-[130px] lg:w-[170px]"
            />
            <Button
              size="md"
              variant="primary"
              className="h-[52px] min-w-0 flex-1 whitespace-nowrap"
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
            <IconCart width={20} height={20} />
            {cartLabel}
          </Button>
          <div className="flex items-center justify-center gap-2 text-xs text-muted">
            <IconShield width={16} height={16} className="shrink-0" />
            <span>Secure checkout — encrypted &amp; protected</span>
          </div>
        </div>

        {/* Reassurance row — config-gated via trustBadges.enabled (store-bulk owns that flag);
            content is the payment-method marks rather than a config image. */}
        {trustBadges.enabled ? (
          <div className="mt-6 border-t border-border pt-6">
            <PaymentBadges className="mt-3 justify-center" badgeWidth={44} badgeHeight={28} />
          </div>
        ) : null}
      </div>

      {/* Mobile-only: keeps a purchase path reachable once the row above scrolls out of view. */}
      {!ctaVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background/95 p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden">
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
