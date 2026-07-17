import type { MetadataRoute } from "next";
import { getSiteUrl, isShopifyConfigured } from "@/lib/env";
import { getSitemapEntries } from "@/lib/shopify/api";
import { POLICY_HANDLES } from "@/lib/policies";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/search`, changeFrequency: "weekly", priority: 0.3 },
    ...POLICY_HANDLES.map((handle) => ({
      url: `${siteUrl}/policies/${handle}`,
      changeFrequency: "yearly" as const,
      priority: 0.2
    }))
  ];

  if (!isShopifyConfigured()) return staticEntries;

  try {
    const { products, collections, pages } = await getSitemapEntries();
    return [
      ...staticEntries,
      ...products.map((product) => ({
        url: `${siteUrl}/products/${product.handle}`,
        lastModified: product.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8
      })),
      ...collections.map((collection) => ({
        url: `${siteUrl}/collections/${collection.handle}`,
        lastModified: collection.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.7
      })),
      ...pages.map((page) => ({
        url: `${siteUrl}/pages/${page.handle}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.4
      }))
    ];
  } catch {
    // Shopify unreachable at build/request time — ship the static routes only.
    return staticEntries;
  }
}
