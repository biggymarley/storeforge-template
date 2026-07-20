import { resolveStoreConfig } from "@/lib/config";
import { getSiteUrl, isShopifyConfigured } from "@/lib/env";
import { getMerchantFeedProducts } from "@/lib/shopify/api";
import { flattenConnection, type MerchantFeedProduct } from "@/lib/shopify/types";

/** Merchant Center only re-fetches on its own (daily) schedule — an hour of staleness is fine. */
export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name: string, value: string): string {
  return `<${name}>${escapeXml(value)}</${name}>`;
}

function productItems(product: MerchantFeedProduct, siteUrl: string, brand: string, fallbackCurrency: string): string[] {
  const variants = flattenConnection(product.variants);
  const link = `${siteUrl}/products/${product.handle}`;
  // Google caps description at 5000 chars; anything longer gets the item disapproved.
  const description = (product.description || product.title).slice(0, 5000);

  return variants.map((variant) => {
    // Shopify's placeholder title for single-variant products — not a real option name.
    const title = variant.title && variant.title !== "Default Title" ? `${product.title} - ${variant.title}` : product.title;
    const image = variant.image ?? product.featuredImage;
    const amount = Number(variant.price.amount);
    const price = `${Number.isFinite(amount) ? amount.toFixed(2) : variant.price.amount} ${variant.price.currencyCode || fallbackCurrency}`;

    return [
      "<item>",
      tag("g:id", variant.id),
      tag("g:title", title),
      tag("description", description),
      tag("g:link", link),
      ...(image ? [tag("g:image_link", image.url)] : []),
      ...(variants.length > 1 ? [tag("g:item_group_id", product.id)] : []),
      tag("g:availability", variant.availableForSale ? "in stock" : "out of stock"),
      tag("g:price", price),
      tag("g:brand", brand),
      tag("g:condition", "new"),
      "</item>"
    ].join("");
  });
}

function feedResponse(store: { name: string }, siteUrl: string, itemsXml: string): Response {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel>` +
    tag("title", store.name) +
    tag("link", siteUrl) +
    tag("description", `${store.name} product feed`) +
    itemsXml +
    `</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=0, s-maxage=${revalidate}`
    }
  });
}

export async function GET(): Promise<Response> {
  const store = resolveStoreConfig();
  const siteUrl = getSiteUrl();

  if (!isShopifyConfigured()) return feedResponse(store, siteUrl, "");

  try {
    const products = await getMerchantFeedProducts();
    const items = products.flatMap((product) => productItems(product, siteUrl, store.name, store.currency));
    return feedResponse(store, siteUrl, items.join(""));
  } catch {
    // Shopify unreachable — Merchant Center should still see a parseable (empty) feed, not a 500.
    return feedResponse(store, siteUrl, "");
  }
}
