"use client";

import { useState, useTransition, type Ref } from "react";
import { useCart } from "@/components/cart/cart-provider";
import { IconArrow, IconShield, IconTag } from "@/components/icons";
import { TrustStrip } from "@/components/product/trust-strip";
import { Button } from "@/components/ui/button";
import { PaymentBadges } from "@/components/ui/payment-badges";
import { useToast } from "@/components/ui/toast";
import type { ResolvedLegalConfig, ResolvedMarketingConfig } from "@/lib/config";
import { trackCheckoutConversion } from "@/lib/analytics";
import { applyDiscountCode } from "@/lib/shopify/cart-actions";
import { formatPrice } from "@/lib/format";

interface OrderSummaryProps {
  policies: ResolvedLegalConfig["policies"];
  marketing: ResolvedMarketingConfig;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Order summary card: subtotal, accent discount row (only when allocations
 * exist), total, promo input + Apply, checkout button, then a trust block
 * (payment badges + secure-checkout note + shipping/returns) — reassurance
 * right next to the highest-friction step in the funnel. Accepts `ref` (React
 * 19 prop-ref) so the cart page can observe when it scrolls out of view.
 */
export function OrderSummary({ policies, marketing, className = "", ref }: OrderSummaryProps) {
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
    <div ref={ref} className={`rounded-card bg-secondary px-6 py-6 ${className}`}>
      <h2 className="text-xl font-bold lg:text-2xl">Order Summary</h2>
      <dl className="mt-5 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <dt className="text-base text-muted lg:text-xl">
            Subtotal · {cart.totalQuantity} item{cart.totalQuantity === 1 ? "" : "s"}
          </dt>
          <dd className="text-base font-bold lg:text-xl">
            {formatPrice(cart.cost.subtotalAmount.amount, currency)}
          </dd>
        </div>
        {discount > 0 ? (
          <div className="flex items-center justify-between">
            <dt className="text-base text-muted lg:text-xl">
              Discount{appliedCodes.length > 0 ? ` (${appliedCodes.map((dc) => dc.code).join(", ")})` : ""}
            </dt>
            <dd className="text-base font-bold text-accent lg:text-xl">-{formatPrice(discount, currency)}</dd>
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
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-foreground/30">
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
          onClick={() =>
            // Fire-and-continue — must never block the navigation to checkout.
            trackCheckoutConversion(marketing.googleAdsConversionId, marketing.googleAdsConversionLabel, {
              value: Number(cart.cost.totalAmount.amount),
              currency: cart.cost.totalAmount.currencyCode
            })
          }
          className="mt-6 inline-flex h-[60px] w-full items-center justify-center gap-3 rounded-full bg-primary text-base font-medium tracking-wide text-background transition-opacity hover:opacity-85"
        >
          Go to Checkout
          <IconArrow width={24} height={24} />
        </a>
      ) : null}

      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
        <IconShield width={16} height={16} className="shrink-0" />
        Secure checkout · taxes and discounts calculated at checkout
      </p>

      <PaymentBadges className="mt-5 justify-center" />

      <TrustStrip policies={policies} className="mt-6 border-t border-border pt-5" />
    </div>
  );
}
