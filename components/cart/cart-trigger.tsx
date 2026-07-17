"use client";

import { IconCart } from "@/components/icons";
import { useCart } from "@/components/cart/cart-provider";

/** Header cart icon + badge; opens the mini-cart slide-over. */
export function CartTrigger() {
  const { cart, openCart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      type="button"
      aria-label={`Cart, ${count} items`}
      onClick={openCart}
      className="relative transition-opacity hover:opacity-60"
    >
      <IconCart width={24} height={24} />
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-background">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
