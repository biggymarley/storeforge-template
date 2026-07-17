/**
 * Structured data builders (spec §6). Return plain objects — pages serialize
 * them into a `<script type="application/ld+json">` themselves so each page
 * controls its own placement.
 */
import { getSiteUrl } from "@/lib/env";
import { resolveLegalConfig, resolveStoreConfig } from "@/lib/config";
import type { Product } from "@/lib/shopify/types";

export function organizationJsonLd(): Record<string, unknown> {
  const store = resolveStoreConfig();
  const legal = resolveLegalConfig();
  const siteUrl = getSiteUrl();
  const sameAs = Object.values(store.socials).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: legal.legalName || store.name,
    url: siteUrl,
    logo: `${siteUrl}${store.logo.src}`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(legal.emails.support ? { email: legal.emails.support } : {}),
    ...(legal.phone ? { telephone: legal.phone } : {})
  };
}

export function productJsonLd(product: Product): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/products/${product.handle}`;
  const images = product.images.edges.map((edge) => edge.node.url);
  const price = product.priceRange.minVariantPrice;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: images.length > 0 ? images : undefined,
    sku: product.id,
    brand: product.vendor ? { "@type": "Brand", name: product.vendor } : undefined,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: price.currencyCode,
      price: price.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock"
    }
  };
}
