import { SetupScreen } from "@/components/setup-screen";
import { isShopifyConfigured } from "@/lib/env";
import { shopifyFetch, ShopifyError } from "@/lib/shopify/client";
import { PRODUCTS_QUERY } from "@/lib/shopify/queries/products";
import type { ProductsQueryResult } from "@/lib/shopify/types";

export const metadata = { title: "Scratch — raw Shopify data" };

/**
 * Phase B proving ground (spec §9): renders raw Storefront API data to verify
 * the client, credentials and API version before any real UI exists.
 * Template-internal; not linked from anywhere.
 */
export default async function ScratchPage() {
  if (!isShopifyConfigured()) {
    return <SetupScreen />;
  }

  let data: ProductsQueryResult | null = null;
  let error: string | null = null;

  try {
    data = await shopifyFetch<ProductsQueryResult>({
      query: PRODUCTS_QUERY,
      variables: { first: 5 }
    });
  } catch (e) {
    error = e instanceof ShopifyError ? e.message : "Unexpected error fetching products.";
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="font-heading text-2xl uppercase">Scratch: products(first: 5)</h1>
      {error ? (
        <p className="mt-4 rounded-card border border-border p-4 text-accent">{error}</p>
      ) : (
        <pre className="mt-4 overflow-x-auto rounded-card bg-secondary p-4 text-xs leading-5">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}
