"use client";

import { useTransition } from "react";
import { IconCart } from "@/components/icons";
import { useToast } from "@/components/ui/toast";
import { addToCart } from "@/lib/shopify/cart-actions";

interface QuickAddButtonProps {
  variantId: string;
  productTitle: string;
  className?: string;
}

/**
 * One-click add for grid cards with exactly one variant (product-card.tsx
 * only renders this when quickAddVariants has a single available entry —
 * anything with real option choices still routes to the PDP).
 */
export function QuickAddButton({ variantId, productTitle, className = "" }: QuickAddButtonProps) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    startTransition(async () => {
      const result = await addToCart(variantId, 1);
      if (result.ok) toast(`Added ${productTitle} to cart`);
      else toast(result.error ?? "Could not add to cart.", "error");
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={`Add ${productTitle} to cart`}
      className={`flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-60 ${className}`}
    >
      <IconCart width={16} height={16} />
      {pending ? "Adding…" : "Quick Add"}
    </button>
  );
}
