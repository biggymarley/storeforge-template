import { cookies } from "next/headers";
import { shopifyFetch } from "@/lib/shopify/client";
import { CART_QUERY } from "@/lib/shopify/queries/cart";
import type { Cart, CartQueryResult } from "@/lib/shopify/types";

export const CART_COOKIE = "cartId";

/**
 * Current cart for the request, or null when no cart cookie exists (or the
 * cart expired/completed checkout on Shopify's side). Read-only: creating a
 * cart sets a cookie, which only server actions may do (`cart-actions.ts`).
 */
export async function getCart(): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;

  const data = await shopifyFetch<CartQueryResult>({
    query: CART_QUERY,
    variables: { cartId },
    cache: "no-store"
  });
  return data.cart;
}
