"use server";

import { ShopifyError, shopifyFetch } from "@/lib/shopify/client";
import { CUSTOMER_CREATE_MUTATION } from "@/lib/shopify/mutations/customer";
import type { CustomerCreateResult } from "@/lib/shopify/types";

export interface NewsletterResult {
  ok: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter capture via the Storefront API's customerCreate (spec §… "Shopify
 * email capture if trivial" — no ESP integration, no new secret). The
 * Storefront API has no marketing-only signup, so this creates a real
 * customer record with a throwaway generated password and acceptsMarketing:
 * true; the visitor is never shown a password or a login flow. An email
 * that's already registered is treated as a successful opt-in, not an error.
 */
export async function subscribeToNewsletter(email: string): Promise<NewsletterResult> {
  const trimmed = email.trim();
  if (!EMAIL_RE.test(trimmed)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  try {
    const data = await shopifyFetch<CustomerCreateResult>({
      query: CUSTOMER_CREATE_MUTATION,
      variables: {
        input: {
          email: trimmed,
          password: `${crypto.randomUUID()}Aa1!`,
          acceptsMarketing: true
        }
      },
      cache: "no-store"
    });

    const userErrors = data.customerCreate?.customerUserErrors ?? [];
    const alreadyRegistered = userErrors.find((e) => e.code === "TAKEN" || /already been taken/i.test(e.message));
    if (alreadyRegistered) return { ok: true };

    const firstError = userErrors[0];
    if (firstError) return { ok: false, error: firstError.message };

    return { ok: true };
  } catch (error) {
    if (error instanceof ShopifyError) return { ok: false, error: error.message };
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
