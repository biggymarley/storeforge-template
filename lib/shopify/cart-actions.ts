"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { ShopifyError, shopifyFetch } from "@/lib/shopify/client";
import { CART_COOKIE } from "@/lib/shopify/cart";
import {
  CART_CREATE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION
} from "@/lib/shopify/mutations/cart";
import type {
  Cart,
  CartCreateResult,
  CartDiscountCodesUpdateResult,
  CartLinesAddResult,
  CartLinesRemoveResult,
  CartLinesUpdateResult,
  UserError
} from "@/lib/shopify/types";

/** Uniform result shape for the toast layer (spec §5: surface userErrors). */
export interface CartActionResult {
  ok: boolean;
  error?: string;
}

const OK: CartActionResult = { ok: true };

function failure(error: unknown): CartActionResult {
  if (error instanceof ShopifyError) return { ok: false, error: error.message };
  return { ok: false, error: "Something went wrong updating your cart. Please try again." };
}

function firstUserError(userErrors: UserError[] | undefined): string | null {
  return userErrors && userErrors.length > 0 ? userErrors[0].message : null;
}

async function getCartIdCookie(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE)?.value;
}

async function setCartIdCookie(cartId: string): Promise<void> {
  (await cookies()).set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30
  });
}

async function createCart(): Promise<Cart> {
  const data = await shopifyFetch<CartCreateResult>({
    query: CART_CREATE_MUTATION,
    variables: { input: {} },
    cache: "no-store"
  });
  const cart = data.cartCreate?.cart;
  if (!cart) {
    throw new ShopifyError(firstUserError(data.cartCreate?.userErrors) ?? "Could not create a cart.");
  }
  await setCartIdCookie(cart.id);
  return cart;
}

/**
 * Cookie cart id, creating (and persisting) a cart when absent. Shopify carts
 * expire; mutations that hit a dead cart retry once on a fresh cart.
 */
async function getOrCreateCartId(): Promise<string> {
  return (await getCartIdCookie()) ?? (await createCart()).id;
}

/** True when the mutation response indicates the cookie points at a dead cart. */
function isDeadCart(cart: Cart | null | undefined, userErrors: UserError[] | undefined): boolean {
  return !cart && (!userErrors || userErrors.length === 0);
}

export async function addToCart(variantId: string, quantity: number): Promise<CartActionResult> {
  try {
    const run = async (cartId: string) =>
      shopifyFetch<CartLinesAddResult>({
        query: CART_LINES_ADD_MUTATION,
        variables: { cartId, lines: [{ merchandiseId: variantId, quantity }] },
        cache: "no-store"
      });

    let result = (await run(await getOrCreateCartId())).cartLinesAdd;
    if (isDeadCart(result?.cart, result?.userErrors)) {
      result = (await run((await createCart()).id)).cartLinesAdd;
    }

    const userError = firstUserError(result?.userErrors);
    if (userError) return { ok: false, error: userError };

    revalidateTag("cart");
    return OK;
  } catch (error) {
    return failure(error);
  }
}

export async function updateCartLine(lineId: string, quantity: number): Promise<CartActionResult> {
  if (quantity < 1) return removeCartLine(lineId);
  try {
    const cartId = await getCartIdCookie();
    if (!cartId) return { ok: false, error: "Your cart could not be found." };

    const data = await shopifyFetch<CartLinesUpdateResult>({
      query: CART_LINES_UPDATE_MUTATION,
      variables: { cartId, lines: [{ id: lineId, quantity }] },
      cache: "no-store"
    });

    const userError = firstUserError(data.cartLinesUpdate?.userErrors);
    if (userError) return { ok: false, error: userError };

    revalidateTag("cart");
    return OK;
  } catch (error) {
    return failure(error);
  }
}

export async function removeCartLine(lineId: string): Promise<CartActionResult> {
  try {
    const cartId = await getCartIdCookie();
    if (!cartId) return { ok: false, error: "Your cart could not be found." };

    const data = await shopifyFetch<CartLinesRemoveResult>({
      query: CART_LINES_REMOVE_MUTATION,
      variables: { cartId, lineIds: [lineId] },
      cache: "no-store"
    });

    const userError = firstUserError(data.cartLinesRemove?.userErrors);
    if (userError) return { ok: false, error: userError };

    revalidateTag("cart");
    return OK;
  } catch (error) {
    return failure(error);
  }
}

export async function applyDiscountCode(code: string): Promise<CartActionResult> {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, error: "Enter a promo code first." };
  try {
    const cartId = await getCartIdCookie();
    if (!cartId) return { ok: false, error: "Your cart could not be found." };

    const data = await shopifyFetch<CartDiscountCodesUpdateResult>({
      query: CART_DISCOUNT_CODES_UPDATE_MUTATION,
      variables: { cartId, discountCodes: [trimmed] },
      cache: "no-store"
    });

    const userError = firstUserError(data.cartDiscountCodesUpdate?.userErrors);
    if (userError) return { ok: false, error: userError };

    // Shopify accepts unknown codes without a userError; it just marks them inapplicable.
    const applied = data.cartDiscountCodesUpdate?.cart?.discountCodes.find(
      (dc) => dc.code.toLowerCase() === trimmed.toLowerCase()
    );
    if (applied && !applied.applicable) {
      return { ok: false, error: `“${trimmed}” is not a valid promo code.` };
    }

    revalidateTag("cart");
    return OK;
  } catch (error) {
    return failure(error);
  }
}
