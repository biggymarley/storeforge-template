"use client";

import { useEffect } from "react";
import { CartLineRow } from "@/components/cart/cart-line-row";
import { useCart } from "@/components/cart/cart-provider";
import { IconArrow, IconClose } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { flattenConnection } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/format";

/**
 * Mini-cart slide-over (spec §4; improvised per DESIGN-NOTES §6 — not in the
 * Figma file): right-side panel with 20px left radii, line rows, subtotal,
 * checkout + view-cart actions.
 */
export function MiniCart() {
  const { cart, isOpen, closeCart } = useCart();
  const lines = cart ? flattenConnection(cart.lines) : [];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className="absolute inset-0 bg-foreground/40"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col rounded-l-card bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-xl font-bold">
            Your Cart{cart && cart.totalQuantity > 0 ? ` (${cart.totalQuantity})` : ""}
          </h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="text-muted transition-colors hover:text-foreground"
          >
            <IconClose width={20} height={20} />
          </button>
        </div>

        {lines.length > 0 ? (
          <>
            <div className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {lines.map((line) => (
                <div key={line.id} className="py-5">
                  <CartLineRow line={line} compact onNavigate={closeCart} />
                </div>
              ))}
            </div>
            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-base text-muted">Subtotal</span>
                <span className="text-xl font-bold">
                  {cart
                    ? formatPrice(cart.cost.subtotalAmount.amount, cart.cost.subtotalAmount.currencyCode)
                    : ""}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                {cart?.checkoutUrl ? (
                  <a
                    href={cart.checkoutUrl}
                    className="inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-primary text-base font-medium text-background transition-opacity hover:opacity-85"
                  >
                    Go to Checkout
                    <IconArrow width={20} height={20} />
                  </a>
                ) : null}
                <ButtonLink href="/cart" variant="secondary" size="md" onClick={closeCart}>
                  View Cart
                </ButtonLink>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <h3 className="font-heading text-xl uppercase">Your cart is empty</h3>
            <p className="text-sm text-muted">Looks like you haven&rsquo;t added anything yet.</p>
            <Button size="md" onClick={closeCart}>
              Keep Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
