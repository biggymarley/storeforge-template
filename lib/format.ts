import { resolveStoreConfig } from "@/lib/config";

/**
 * Single money formatter for the whole template (spec §5).
 * Shopify's returned currencyCode always wins; storeConfig.currency is only
 * the fallback when a value arrives without one.
 */
export function formatPrice(amount: string | number, currencyCode?: string): string {
  const currency = currencyCode || resolveStoreConfig().currency;
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(value)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value);
}
