"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { IconArrow, IconTag } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { applyDiscountCode } from "@/lib/shopify/cart-actions";
import { formatPrice } from "@/lib/format";

/**
 * Figma Order Summary card (31:645): subtotal, accent discount row (only when
 * allocations exist), total, promo input + Apply, checkout arrow button.
 * Delivery fee is checkout territory — Shopify's cart doesn't return one.
 */
export function OrderSummary() {
  const { cart } = useCart();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  if (!cart) return null;

  const currency = cart.cost.subtotalAmount.currencyCode;
  const discount = cart.discountAllocations.reduce(
    (sum, allocation) => sum + Number(allocation.discountedAmount.amount),
    0
  );
  const appliedCodes = cart.discountCodes.filter((dc) => dc.applicable);

  const apply = () => {
    startTransition(async () => {
      const result = await applyDiscountCode(code);
      if (result.ok) {
        toast("Promo code applied");
        setCode("");
      } else {
        toast(result.error ?? "Could not apply that code.", "error");
      }
    });
  };

  return (
    <div className="rounded-card border border-border px-6 py-5">
      <h2 className="text-xl font-bold lg:text-2xl">Order Summary</h2>
      <dl className="mt-5 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <dt className="text-base text-muted lg:text-xl">Subtotal</dt>
          <dd className="text-base font-bold lg:text-xl">
            {formatPrice(cart.cost.subtotalAmount.amount, currency)}
          </dd>
        </div>
        {discount > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-base text-muted lg:text-xl">
              Discount{appliedCodes.length > 0 ? ` (${appliedCodes.map((dc) => dc.code).join(", ")})` : ""}
            </dt>
            <dd className="text-base font-bold text-accent lg:text-xl">
              -{formatPrice(discount, currency)}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-border pt-5">
          <dt className="text-base lg:text-xl">Total</dt>
          <dd className="text-xl font-bold lg:text-2xl">
            {formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-secondary px-4 py-3">
          <IconTag width={24} height={24} className="shrink-0" />
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") apply();
            }}
            placeholder="Add promo code"
            aria-label="Promo code"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40"
          />
        </div>
        <Button size="md" className="h-12 min-w-[100px]" onClick={apply} disabled={pending || !code.trim()}>
          Apply
        </Button>
      </div>

      {cart.checkoutUrl ? (
        <a
          href={cart.checkoutUrl}
          className="mt-6 inline-flex h-[60px] w-full items-center justify-center gap-3 rounded-full bg-primary text-base font-medium text-background transition-opacity hover:opacity-85"
        >
          Go to Checkout
          <IconArrow width={24} height={24} />
        </a>
      ) : null}
    </div>
  );
}
