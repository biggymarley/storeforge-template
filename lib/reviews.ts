import { resolveContentConfig } from "@/lib/config";
import type { ProductReview } from "@/lib/types/config";

/**
 * Reviews are store-owned config (owner decision, DESIGN-NOTES §4) — the
 * Storefront API has no native reviews. All review UI hides gracefully when a
 * product has no entries.
 */
export function getProductReviews(handle: string): ProductReview[] {
  return resolveContentConfig().productReviews[handle] ?? [];
}

export function getProductRating(handle: string): { rating: number; count: number } | null {
  const reviews = getProductReviews(handle);
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return { rating: Math.round((sum / reviews.length) * 2) / 2, count: reviews.length };
}
