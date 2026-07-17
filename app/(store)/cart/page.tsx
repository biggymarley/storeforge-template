import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export const metadata: Metadata = { title: "Your Cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-310 px-4 pb-2 pt-5 lg:pt-6">
      <Breadcrumbs items={[{ label: "Cart" }]} className="text-sm lg:text-base" />
      <h1 className="mt-4 font-heading text-[2rem] uppercase lg:mt-6 lg:text-[2.5rem]">Your Cart</h1>
      <CartPageContent />
    </div>
  );
}
