import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { NavLink } from "@/components/layout/nav-links";
import { PlpPage } from "@/components/plp/plp-page";
import { ErrorState } from "@/components/ui/error-state";
import {
  pageArgsFor,
  parsePlpParams,
  plpParamsToProductFilters,
  sortForCollection,
  type SearchParamsRecord
} from "@/lib/plp";
import { getCollection, getCollections, getCollectionWithProducts } from "@/lib/shopify/api";
import { ShopifyError } from "@/lib/shopify/client";
import { flattenConnection, type FilterFacet } from "@/lib/shopify/types";

interface CollectionPageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<SearchParamsRecord>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { handle } = await params;
  try {
    const collection = await getCollection(handle);
    if (!collection) return {};
    return {
      title: collection.seo.title ?? collection.title,
      description: collection.seo.description ?? (collection.description || undefined)
    };
  } catch {
    return {};
  }
}

/** The price facet's input carries the collection's full price range. */
function priceCeilingFromFacets(facets: FilterFacet[]): number {
  const priceFacet = facets.find((facet) => facet.type === "PRICE_RANGE");
  const input = priceFacet?.values[0]?.input;
  if (input) {
    try {
      const parsed = JSON.parse(input) as { price?: { max?: number } };
      const max = parsed.price?.max;
      if (typeof max === "number" && max > 0) return Math.ceil(max / 10) * 10;
    } catch {
      // fall through to default
    }
  }
  return 100;
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const [{ handle }, sp] = await Promise.all([params, searchParams]);
  const plp = parsePlpParams(sp);
  const filters = plpParamsToProductFilters(plp);

  try {
    const [collection, collections] = await Promise.all([
      getCollectionWithProducts(handle, {
        ...pageArgsFor(plp),
        ...sortForCollection(plp.sort),
        filters: filters.length > 0 ? filters : undefined
      }),
      getCollections()
    ]);

    if (!collection) notFound();

    const facets = collection.products.filters ?? [];
    const categories: NavLink[] = collections
      .filter((c) => c.handle !== handle)
      .map((c) => ({ label: c.title, href: `/collections/${c.handle}` }));

    return (
      <PlpPage
        title={collection.title}
        description={collection.description || undefined}
        breadcrumb={[{ label: collection.title }]}
        products={flattenConnection(collection.products)}
        pageInfo={collection.products.pageInfo ?? {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        }}
        pathname={`/collections/${handle}`}
        searchParams={sp}
        sort={plp.sort}
        categories={categories}
        facets={facets}
        priceCeiling={priceCeilingFromFacets(facets)}
      />
    );
  } catch (error) {
    if (!(error instanceof ShopifyError)) throw error;
    return <ErrorState title="This collection is unavailable" message={error.message} />;
  }
}
