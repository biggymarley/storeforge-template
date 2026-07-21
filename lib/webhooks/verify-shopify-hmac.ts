import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies a Shopify webhook signature: HMAC-SHA256 of the raw request body
 * keyed with the custom app's API secret, base64-encoded, compared against the
 * X-Shopify-Hmac-Sha256 header. The comparison is constant-time
 * (timingSafeEqual), and the body must be the raw bytes as received — parsing
 * and re-serializing JSON first would change them and break verification.
 *
 * Pure function of its inputs so it can be unit-tested without a request.
 */
export function verifyShopifyWebhook(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest();
  const provided = Buffer.from(signature, "base64");
  // timingSafeEqual throws on length mismatch; unequal length is a mismatch, not an error.
  if (provided.length !== digest.length) return false;
  return timingSafeEqual(digest, provided);
}
