import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { resolveMarketingConfig } from "@/lib/config";
import { getEnv } from "@/lib/env";
import { verifyShopifyWebhook } from "@/lib/webhooks/verify-shopify-hmac";

// HMAC verification needs node:crypto and the raw body bytes.
export const runtime = "nodejs";

/** The slice of Shopify's orders/paid payload this route reads — everything optional, webhooks are external input. */
interface ShopifyOrderPayload {
  id?: number;
  order_number?: number;
  total_price?: string;
  currency?: string;
  email?: string | null;
  customer?: { email?: string | null } | null;
  line_items?: Array<{
    product_id?: number | null;
    variant_id?: number | null;
    quantity?: number;
    price?: string;
  }>;
}

/**
 * Shopify orders/paid webhook — the only place this headless storefront ever
 * sees a confirmed purchase (checkout happens on Shopify's domain, so no page
 * here can track it client-side). Verifies the delivery, then forwards a
 * Purchase event to Meta's Conversions API when that integration is configured.
 *
 * Shopify retries on any non-2xx and duplicate deliveries are normal — this
 * handler always 200s once processing succeeds, and the CAPI event_id (derived
 * from the order id) lets Meta dedup redelivered orders on their side.
 */
export async function POST(request: Request) {
  const env = getEnv();
  if (!env.SHOPIFY_WEBHOOK_SECRET) {
    return new NextResponse("Webhook secret not configured", { status: 401 });
  }

  // Raw text, never request.json() first — the HMAC is computed over the raw bytes.
  const rawBody = await request.text();
  const signature = request.headers.get("x-shopify-hmac-sha256") ?? "";
  if (!verifyShopifyWebhook(rawBody, signature, env.SHOPIFY_WEBHOOK_SECRET)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let order: ShopifyOrderPayload;
  try {
    order = JSON.parse(rawBody) as ShopifyOrderPayload;
  } catch {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  // Optional integration — a CAPI failure must never fail the webhook itself.
  const { metaPixelId } = resolveMarketingConfig();
  if (env.META_CAPI_ACCESS_TOKEN && metaPixelId) {
    try {
      await sendMetaPurchase(order, metaPixelId, env.META_CAPI_ACCESS_TOKEN);
    } catch (error) {
      console.error("[webhooks/shopify/orders] Meta CAPI Purchase failed:", error);
    }
  }

  return NextResponse.json({ received: true });
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function sendMetaPurchase(order: ShopifyOrderPayload, pixelId: string, accessToken: string): Promise<void> {
  const email = order.email ?? order.customer?.email ?? "";
  const contents = (order.line_items ?? []).map((item) => ({
    id: String(item.variant_id ?? item.product_id ?? ""),
    quantity: item.quantity ?? 1,
    item_price: Number(item.price ?? 0)
  }));

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        // Same order id on a redelivery → Meta drops the duplicate.
        event_id: order.id != null ? `shopify-order-${order.id}` : undefined,
        user_data: {
          // Meta requires PII hashed — normalized (trim + lowercase) then SHA-256, never plaintext.
          em: email ? [sha256(email.trim().toLowerCase())] : []
        },
        custom_data: {
          value: Number(order.total_price ?? 0),
          currency: order.currency ?? "USD",
          content_type: "product",
          contents
        }
      }
    ]
  };

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );
  if (!response.ok) {
    throw new Error(`Meta CAPI responded ${response.status}: ${await response.text()}`);
  }
}
