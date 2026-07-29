"use client";

import { CartPageContent } from "@/components/cart/cart-page-content";
import { CartProvider } from "@/components/cart/cart-provider";
import { ToastProvider } from "@/components/ui/toast";
import type { ResolvedLegalConfig, ResolvedMarketingConfig } from "@/lib/config";
import type { Cart, CartLine } from "@/lib/shopify/types";

function money(amount: string, currencyCode = "MAD") {
  return { amount, currencyCode };
}

function line(id: string, title: string, options: { name: string; value: string }[], amount: string, qty: number): CartLine {
  return {
    id,
    quantity: qty,
    cost: {
      totalAmount: money(amount),
      amountPerQuantity: money(String(Number(amount) / qty)),
      compareAtAmountPerQuantity: null
    },
    merchandise: {
      id: `${id}-variant`,
      title,
      selectedOptions: options,
      product: { id: `${id}-product`, handle: "sample", title, featuredImage: null }
    }
  };
}

const lines: CartLine[] = [
  line("1", "Anker SOLIX F3800 Portable Power Station 3840Wh | 6000W", [{ name: "Color", value: "Space Gray" }], "1999.99", 1),
  line("2", "Relaxed Fit Tee", [{ name: "Size", value: "Medium" }], "1000.00", 2)
];

const mockCart: Cart = {
  id: "mock",
  checkoutUrl: "#",
  totalQuantity: 3,
  lines: { edges: lines.map((node) => ({ node })) },
  cost: {
    subtotalAmount: money("2999.99"),
    totalAmount: money("2999.99"),
    totalTaxAmount: null
  },
  discountCodes: [],
  discountAllocations: []
};

export function CartPreviewClient({
  policies,
  marketing
}: {
  policies: ResolvedLegalConfig["policies"];
  marketing: ResolvedMarketingConfig;
}) {
  return (
    <ToastProvider>
      <CartProvider cart={mockCart}>
        <div className="mx-auto max-w-page px-4 pb-2 pt-5 lg:pt-6">
          <CartPageContent policies={policies} marketing={marketing} />
        </div>
      </CartProvider>
    </ToastProvider>
  );
}
