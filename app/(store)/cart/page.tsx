import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";
import { resolveLegalConfig, resolveMarketingConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Your Cart" };

export default function CartPage() {
  const legal = resolveLegalConfig();
  const marketing = resolveMarketingConfig();

  return (
    <div className="mx-auto max-w-page px-4 pb-2 pt-5 lg:pt-6">
      <CartPageContent policies={legal.policies} marketing={marketing} />
    </div>
  );
}
