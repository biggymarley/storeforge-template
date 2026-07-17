import type { Metadata } from "next";
import type { NavLink } from "@/components/layout/nav-links";
import { PlpPage } from "@/components/plp/plp-page";
import { ErrorState } from "@/components/ui/error-state";
import {
  pageArgsFor,
  parsePlpParams,
  plpParamsToProductsQuery,
  sortForProducts,
  type SearchParamsRecord
} from "@/lib/plp";
import { getCollections, getMaxProductPrice, getProducts } from "@/lib/shopify/api";
import { ShopifyError } from "@/lib/shopify/client";

export const metadata: Metadata = { title: "All Products" };

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const sp = await searchParams;
  const params = parsePlpParams(sp);

  try {
    const [{ products, pageInfo }, collections, priceCeiling] = await Promise.all([
      getProducts({
        ...pageArgsFor(params),
        query: plpParamsToProductsQuery(params),
        ...sortForProducts(params.sort)
      }),
      getCollections(),
      getMaxProductPrice()
    ]);

    const categories: NavLink[] = collections.map((collection) => ({
      label: collection.title,
      href: `/collections/${collection.handle}`
    }));

    return (
      <PlpPage
        title="All Products"
        breadcrumb={[{ label: "All Products" }]}
        products={products}
        pageInfo={pageInfo}
        pathname="/products"
        searchParams={sp}
        sort={params.sort}
        categories={categories}
        facets={[]}
        priceCeiling={priceCeiling}
      />
    );
  } catch (error) {
    if (!(error instanceof ShopifyError)) throw error;
    return <ErrorState title="Products are unavailable" message={error.message} />;
  }
}
