"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { StarRating } from "@/components/ui/star-rating";
import { useToast } from "@/components/ui/toast";
import { addToCart } from "@/lib/shopify/cart-actions";
import { flattenConnection, type Product, type ProductVariant, type ShopifyImage } from "@/lib/shopify/types";

interface ProductViewProps {
  product: Product;
  rating: { rating: number; count: number } | null;
}

/** Shopify's placeholder option on variant-less products. */
function isDefaultOnlyOption(option: Product["options"][number]): boolean {
  return option.optionValues.length === 1 && option.optionValues[0].name === "Default Title";
}

/**
 * PDP top section (Figma 1:2 / 35:1062): thumb rail + main image left,
 * title/rating/price/options/qty/add-to-cart right. Selected options resolve
 * to a variant; price, compare-at and image follow it (PAGE-BLUEPRINTS §PDP).
 */
export function ProductView({ product, rating }: ProductViewProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

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
    startTransition(async () => {
      const result = await addToCart(currentVariant.id, quantity);
      if (result.ok) toast("Added to cart");
      else toast(result.error ?? "Could not add to cart.", "error");
    });
  };

  const main = images[activeImage] ?? images[0];

  return (
    <div className="mt-5 grid gap-6 lg:mt-9 lg:grid-cols-2 lg:items-start lg:gap-10">
      {/* Gallery — min-w-0 so many thumbs can't widen the grid track */}
      <div className="min-w-0 flex-col flex gap-3.5 lg:flex-row">
        {images.length > 1 ? (
          <div className="order-2 flex gap-3.5 overflow-x-auto lg:order-1 lg:max-h-[530px] lg:flex-col lg:overflow-y-auto">
            {images.map((image, index) => (
              <button
                key={image.url}
                type="button"
                aria-label={`View image ${index + 1}`}
                aria-pressed={index === activeImage}
                onClick={() => setActiveImage(index)}
                className={`relative aspect-[152/167] w-24 shrink-0 overflow-hidden rounded-card bg-secondary lg:w-[152px] ${
                  index === activeImage ? "border border-primary" : ""
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText ?? product.title}
                  fill
                  sizes="152px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
        <div className="relative order-1 aspect-[444/530] w-full overflow-hidden rounded-card bg-secondary lg:order-2 lg:w-auto lg:min-w-0 lg:flex-1">
          {main ? (
            <Image
              src={main.url}
              alt={main.altText ?? product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted">No image</div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="min-w-0 flex flex-col">
        <h1 className="font-heading text-2xl uppercase leading-tight lg:text-[2.5rem] lg:leading-none">
          {product.title}
        </h1>
        {rating ? <StarRating rating={rating.rating} className="mt-3" /> : null}
        {currentVariant ? (
          <Price
            price={currentVariant.price}
            compareAt={currentVariant.compareAtPrice}
            size="lg"
            className="mt-3"
          />
        ) : (
          <Price price={product.priceRange.minVariantPrice} size="lg" className="mt-3" />
        )}
        {product.description ? (
          // Long Shopify descriptions get clamped here — the full rich text
          // lives in the Product Details tab below.
          <p className="mt-4 line-clamp-5 text-sm leading-5 text-muted lg:text-base lg:leading-[22px]">
            {product.description}
          </p>
        ) : null}

        {options.map((option) => {
          const isColor = option.optionValues.some((value) => value.swatch?.color);
          return (
            <div key={option.name} className="mt-6 border-t border-border pt-6">
              <h2 className="text-sm text-muted">
                {isColor ? `Select ${option.name}` : `Choose ${option.name}`}
              </h2>
              {isColor ? (
                <div className="mt-4 flex flex-wrap gap-4">
                  {option.optionValues.map((value) => (
                    <ColorSwatch
                      key={value.name}
                      color={value.swatch?.color ?? "#ccc"}
                      colorName={value.name}
                      selected={selected[option.name] === value.name}
                      onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value.name }))}
                      className={isValueAvailable(option.name, value.name) ? "" : "opacity-30"}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {option.optionValues.map((value) => (
                    <Chip
                      key={value.name}
                      size="lg"
                      selected={selected[option.name] === value.name}
                      onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value.name }))}
                      className={isValueAvailable(option.name, value.name) ? "" : "line-through opacity-40"}
                    >
                      {value.name}
                    </Chip>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-6 flex gap-4 border-t border-border pt-6 lg:gap-5">
          <QuantityStepper
            quantity={quantity}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrement={() => setQuantity((q) => q + 1)}
            disabled={pending}
            className="w-[130px] shrink-0 lg:w-[170px]"
          />
          <Button
            size="md"
            className="h-[52px] min-w-0 flex-1"
            onClick={add}
            disabled={pending || !currentVariant || !currentVariant.availableForSale}
          >
            {currentVariant && !currentVariant.availableForSale ? "Out of Stock" : pending ? "Adding…" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
