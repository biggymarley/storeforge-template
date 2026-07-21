/**
 * Client-side tracking helpers for the optional ad pixels (config/marketing.ts).
 * Pure functions of their inputs — this file never reads config itself.
 *
 * Every helper is safe to call unconditionally: app/layout.tsx only injects the
 * gtag / Meta Pixel scripts when the matching id is configured, so when a
 * platform is off `window.gtag` / `window.fbq` doesn't exist and the call is a
 * no-op. Checkout happens on Shopify's hosted domain, outside this app, so no
 * true Purchase event exists anywhere in this codebase — the checkout-click
 * conversion below is a checkout-intent proxy, not a confirmed sale.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

interface TrackedProduct {
  /** Shopify product or variant gid. */
  contentId: string;
  value: number;
  currency: string;
}

/** Meta Pixel ViewContent — fired once per PDP visit. */
export function trackViewContent({ contentId, value, currency }: TrackedProduct): void {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "ViewContent", { content_ids: [contentId], content_type: "product", value, currency });
}

/** Meta Pixel AddToCart — fired after a successful cart mutation, never before. */
export function trackAddToCart({ contentId, value, currency }: TrackedProduct): void {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "AddToCart", { content_ids: [contentId], content_type: "product", value, currency });
}

/** Meta Pixel PageView — the base snippet covers the hard load; this covers client-side route changes. */
export function trackPageView(): void {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "PageView");
}

/**
 * Google Ads conversion on the "Go to Checkout" click. Fire-and-continue:
 * never preventDefault/blocks the navigation to Shopify checkout.
 */
export function trackCheckoutConversion(
  conversionId: string,
  conversionLabel: string,
  { value, currency }: { value: number; currency: string }
): void {
  if (typeof window === "undefined" || !conversionId || !conversionLabel) return;
  window.gtag?.("event", "conversion", {
    send_to: `${conversionId}/${conversionLabel}`,
    value,
    currency
  });
}
