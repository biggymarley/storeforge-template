"use client";

import { useTransition } from "react";
import { IconCart } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { trackAddToCart } from "@/lib/analytics";
import { addToCart } from "@/lib/shopify/cart-actions";
import type { Money } from "@/lib/shopify/types";

interface QuickAddButtonProps {
  variantId: string;
  productTitle: string;
  /** Variant price for the Meta Pixel AddToCart event — quick-add products have exactly one variant, so the product min price is exact. */
  price: Money;
  className?: string;
  /** Button text — "Quick Add" on grid cards, e.g. "Add to Cart" on the hero carousel. */
  label?: string;
  /** "sm" is the original grid-card pill; "lg" matches ButtonLink-scale CTAs. */
  size?: "sm" | "lg";
}

const sizes = {
  sm: "px-4 py-2.5 text-xs",
  lg: "px-8 py-3.5 text-sm"
};

/**
 * One-click add for products with exactly one variant (callers only render
 * this when quickAddVariants has a single available entry — anything with
 * real option choices still routes to the PDP).
 */
export function QuickAddButton({
  variantId,
  productTitle,
  price,
  className = "",
  label = "Quick Add",
  size = "sm"
}: QuickAddButtonProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    startTransition(async () => {
      const result = await addToCart(variantId, 1);
      if (result.ok) {
        toast(`Added ${productTitle} to cart`);
        trackAddToCart({ contentId: variantId, value: Number(price.amount), currency: price.currencyCode });
      } else {
        toast(result.error ?? "Could not add to cart.", "error");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Add ${productTitle} to cart`}
      className={`flex items-center justify-center gap-2 rounded-full bg-primary font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60 ${sizes[size]} ${className}`}
    >
      <IconCart width={16} height={16} />
      {pending ? "Adding…" : label}
    </button>
  );
}
