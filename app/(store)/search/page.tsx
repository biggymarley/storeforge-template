import type { Metadata } from "next";
import { Suspense } from "react";
import type { NavLink } from "@/components/layout/nav-links";
import { SearchBar } from "@/components/layout/search-bar";
import { PlpPage } from "@/components/plp/plp-page";
import { ErrorState } from "@/components/ui/error-state";
import {
  pageArgsFor,
  parsePlpParams,
  plpParamsToProductFilters,
  SEARCH_SORT_OPTIONS,
  sortForSearch,
  type SearchParamsRecord
} from "@/lib/plp";
import { getCollections, getMaxProductPrice, searchProducts } from "@/lib/shopify/api";
import { ShopifyError } from "@/lib/shopify/client";

interface SearchPageProps {
  searchParams: Promise<SearchParamsRecord>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const q = querystringQuery(await searchParams);
  return { title: q ? `Search results for “${q}”` : "Search" };
}

function querystringQuery(sp: SearchParamsRecord): string {
  const raw = sp.q;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() ?? "";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = querystringQuery(sp);
  const params = parsePlpParams(sp);

  // No query yet (mobile lands here from the header icon) — show a prompt with
  // a full-width search input instead of an empty result grid.
  if (!q) {
    return (
      <div className="mx-auto max-w-310 px-4 py-16 lg:py-24">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
          <h1 className="font-heading text-3xl uppercase lg:text-4xl">Search</h1>
          <p className="text-sm text-muted lg:text-base">
            Type what you&apos;re looking for and we&apos;ll match it against every product in the store.
          </p>
          <Suspense>
            <SearchBar className="w-full" autoFocus />
          </Suspense>
        </div>
      </div>
    );
  }

  const filters = plpParamsToProductFilters(params);

  try {
    const [{ products, pageInfo, totalCount }, collections, priceCeiling] = await Promise.all([
      searchProducts(q, {
        ...pageArgsFor(params),
        ...sortForSearch(params.sort),
        productFilters: filters.length > 0 ? filters : undefined
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
        title={`Search results for “${q}”`}
        breadcrumb={[{ label: "Search" }]}
        products={products}
        pageInfo={pageInfo}
        pathname="/search"
        searchParams={sp}
        sort={params.sort}
        sortOptions={SEARCH_SORT_OPTIONS}
        categories={categories}
        facets={[]}
        priceCeiling={priceCeiling}
        totalCount={totalCount}
      />
    );
  } catch (error) {
    if (!(error instanceof ShopifyError)) throw error;
    return <ErrorState title="Search is unavailable" message={error.message} />;
  }
}
