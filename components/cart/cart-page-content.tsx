"use client";

import { CartLineRow } from "@/components/cart/cart-line-row";
import { useCart } from "@/components/cart/cart-provider";
import { OrderSummary } from "@/components/cart/order-summary";
import { ButtonLink } from "@/components/ui/button";
import { flattenConnection } from "@/lib/shopify/types";

/** Figma /cart body (31:32): lines card 715 + summary 505, stacked on mobile. */
export function CartPageContent() {
  const { cart } = useCart();
  const lines = cart ? flattenConnection(cart.lines) : [];

  if (lines.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-start gap-4 rounded-card border border-border p-8 lg:p-12">
        <h2 className="font-heading text-2xl uppercase lg:text-3xl">Your cart is empty</h2>
        <p className="text-sm text-muted lg:text-base">
          Looks like you haven&rsquo;t added anything yet — let&rsquo;s fix that.
        </p>
        <ButtonLink href="/products" size="md">
          Shop Now
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="min-w-0 divide-y divide-border rounded-card border border-border px-4 sm:px-6">
        {lines.map((line) => (
          <div key={line.id} className="py-5">
            <CartLineRow line={line} />
          </div>
        ))}
      </div>
      <OrderSummary />
    </div>
  );
}
