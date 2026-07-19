import { resolveContentConfig } from "@/lib/config";
import type { ProductReview } from "@/lib/types/config";

/**
 * Generic placeholder reviews shown until a store configures real ones for a
 * handle in config/content.ts. An explicit `[]` entry for a handle is a
 * deliberate "no reviews" and is respected — only a missing key falls back.
 */
const DEFAULT_REVIEWS: ProductReview[] = [
  {
    name: "Jordan P.",
    quote: "Exactly as described and arrived faster than expected. Really happy with the quality.",
    rating: 5,
    verified: true
  },
  {
    name: "Morgan T.",
    quote: "Great value for the price — this is my second order and it held up just as well as the first.",
    rating: 5,
    verified: true
  },
  {
    name: "Casey R.",
    quote: "Solid product overall. Packaging could be a little sturdier, but no complaints about the item itself.",
    rating: 4,
    verified: true
  }
];

/**
 * Reviews are store-owned config (owner decision, DESIGN-NOTES §4) — the
 * Storefront API has no native reviews. Falls back to generic placeholder
 * reviews for any handle the store hasn't configured yet.
 */
export function getProductReviews(handle: string): ProductReview[] {
  return resolveContentConfig().productReviews[handle] ?? DEFAULT_REVIEWS;
}

export function getProductRating(handle: string): { rating: number; count: number } | null {
  const reviews = getProductReviews(handle);
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return { rating: Math.round((sum / reviews.length) * 2) / 2, count: reviews.length };
}

/**
 * Store-wide social-proof number for the homepage: ratings across the given
 * handles (e.g. everything currently shown on the homepage), weighted by
 * each product's review count. No new config — derived from getProductRating.
 */
export function getAggregateRating(handles: string[]): { rating: number; count: number } | null {
  const ratings = handles.map((handle) => getProductRating(handle)).filter((r) => r !== null);
  if (ratings.length === 0) return null;
  const count = ratings.reduce((total, r) => total + r.count, 0);
  const weightedSum = ratings.reduce((total, r) => total + r.rating * r.count, 0);
  return { rating: Math.round((weightedSum / count) * 2) / 2, count };
}
