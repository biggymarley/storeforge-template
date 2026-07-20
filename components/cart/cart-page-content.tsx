"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CartLineRow } from "@/components/cart/cart-line-row";
import { useCart } from "@/components/cart/cart-provider";
import { OrderSummary } from "@/components/cart/order-summary";
import { IconArrow, IconCart } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import type { ResolvedLegalConfig } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { flattenConnection } from "@/lib/shopify/types";

interface CartPageContentProps {
  policies: ResolvedLegalConfig["policies"];
}

/** Cart page body: heading + line-item list + sticky order summary, with a mobile sticky-checkout bar once the summary scrolls out of view (mirrors the PDP's sticky-CTA pattern). */
export function CartPageContent({ policies }: CartPageContentProps) {
  const { cart } = useCart();
  const lines = cart ? flattenConnection(cart.lines) : [];
  const summaryRef = useRef<HTMLDivElement>(null);
  const [summaryVisible, setSummaryVisible] = useState(true);

  useEffect(() => {
    const node = summaryRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setSummaryVisible(entry.isIntersecting), {
      threshold: 0
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [lines.length]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href="/products"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <IconArrow width={16} height={16} className="rotate-180" />
          Continue shopping
        </Link>
        <h1 className="font-heading text-[2rem] uppercase lg:text-[2.5rem]">
          Your Cart{cart && cart.totalQuantity > 0 ? ` (${cart.totalQuantity})` : ""}
        </h1>
      </div>

      {lines.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-card border border-border p-8 lg:p-12">
          <IconCart width={40} height={40} className="text-muted" />
          <h2 className="font-heading text-2xl uppercase lg:text-3xl">Your cart is empty</h2>
          <p className="text-sm text-muted lg:text-base">
            Looks like you haven&rsquo;t added anything yet — let&rsquo;s fix that.
          </p>
          <ButtonLink href="/products" size="md">
            Shop Now
          </ButtonLink>
        </div>
      ) : (
        <>
          <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="min-w-0 divide-y divide-border rounded-card border border-border px-4 sm:px-6">
              {lines.map((line) => (
                <div key={line.id} className="py-5">
                  <CartLineRow line={line} />
                </div>
              ))}
            </div>
            <OrderSummary ref={summaryRef} policies={policies} className="lg:sticky lg:top-24" />
          </div>

          {cart && !summaryVisible ? (
            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border bg-background p-4 lg:hidden">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">Total</p>
                <p className="text-lg font-bold">
                  {formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}
                </p>
              </div>
              {cart.checkoutUrl ? (
                <a
                  href={cart.checkoutUrl}
                  className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-background transition-opacity hover:opacity-85"
                >
                  Checkout
                  <IconArrow width={20} height={20} />
                </a>
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
