import { resolveLegalConfig, resolveMarketingConfig } from "@/lib/config";
import { CartPreviewClient } from "./preview-client";

export const metadata = { title: "Cart preview (dev)" };

/** Template-internal responsive QA for the cart page — mock cart, no Shopify needed. */
export default function CartPreviewPage() {
  const legal = resolveLegalConfig();
  const marketing = resolveMarketingConfig();
  return <CartPreviewClient policies={legal.policies} marketing={marketing} />;
}
