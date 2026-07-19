/**
 * Typed data layer over shopifyFetch — every page/layout goes through these
 * helpers instead of assembling queries inline. All reads use the client's
 * default ISR caching (revalidate 60, spec §5); cart lives in cart.ts.
 */
import { shopifyFetch } from "@/lib/shopify/client";
import {
  COLLECTIONS_QUERY,
  COLLECTION_BY_HANDLE_QUERY
} from "@/lib/shopify/queries/collections";
import { PAGE_BY_HANDLE_QUERY } from "@/lib/shopify/queries/pages";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCT_INVENTORY_QUERY,
  RECOMMENDATIONS_QUERY
} from "@/lib/shopify/queries/products";
import { SITEMAP_QUERY } from "@/lib/shopify/queries/sitemap";
import {
  flattenConnection,
  type Collection,
  type CollectionByHandleQueryResult,
  type CollectionsQueryResult,
  type PageByHandleQueryResult,
  type PageInfo,
  type Product,
  type ProductByHandleQueryResult,
  type ProductCard,
  type ProductInventoryQueryResult,
  type ProductsQueryResult,
  type RecommendationsQueryResult,
  type ShopifyPage,
  type SitemapEntry,
  type SitemapQueryResult
} from "@/lib/shopify/types";

/** Cursor + sort arguments shared by the paginated PLP grids. */
export interface PageArgs {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

export interface ProductFilterArg {
  available?: boolean;
  price?: { min?: number; max?: number };
  variantOption?: { name: string; value: string };
}

export async function getCollections(first = 50): Promise<Collection[]> {
  const data = await shopifyFetch<CollectionsQueryResult>({
    query: COLLECTIONS_QUERY,
    variables: { first }
  });
  // "frontpage" is Shopify's auto-created Home page collection — never a nav destination.
  return flattenConnection(data.collections).filter((c) => c.handle !== "frontpage");
}

export async function getCollection(handle: string): Promise<Collection | null> {
  const data = await shopifyFetch<CollectionByHandleQueryResult>({
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: { handle, first: 1 }
  });
  return data.collection;
}

export interface CollectionProductsArgs extends PageArgs {
  sortKey?: "TITLE" | "PRICE" | "BEST_SELLING" | "CREATED" | "COLLECTION_DEFAULT" | "RELEVANCE";
  reverse?: boolean;
  filters?: ProductFilterArg[];
}

export async function getCollectionWithProducts(
  handle: string,
  { first, last, after, before, sortKey, reverse, filters }: CollectionProductsArgs = {}
): Promise<CollectionByHandleQueryResult["collection"]> {
  const data = await shopifyFetch<CollectionByHandleQueryResult>({
    query: COLLECTION_BY_HANDLE_QUERY,
    variables: {
      handle,
      ...(last ? { last, before } : { first: first ?? 12, after }),
      sortKey: sortKey ?? "COLLECTION_DEFAULT",
      reverse: reverse ?? false,
      filters
    }
  });
  return data.collection;
}

export interface ProductsArgs extends PageArgs {
  query?: string;
  sortKey?: "TITLE" | "PRICE" | "BEST_SELLING" | "CREATED_AT" | "RELEVANCE";
  reverse?: boolean;
}

export async function getProducts({
  first,
  last,
  after,
  before,
  query,
  sortKey,
  reverse
}: ProductsArgs = {}): Promise<{ products: ProductCard[]; pageInfo: PageInfo }> {
  const data = await shopifyFetch<ProductsQueryResult>({
    query: PRODUCTS_QUERY,
    variables: {
      ...(last ? { last, before } : { first: first ?? 12, after }),
      query,
      sortKey,
      reverse
    }
  });
  return { products: flattenConnection(data.products), pageInfo: data.products.pageInfo };
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<ProductByHandleQueryResult>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle }
  });
  return data.product;
}

/**
 * Per-variant stock counts, keyed by variant id. Callers should `.catch(() => ({}))` —
 * an empty map means "no data" (untracked inventory or missing Storefront scope), which
 * the UI treats the same as available: no low-stock badge shown, nothing blocked.
 */
export async function getProductInventory(handle: string): Promise<Record<string, number | null>> {
  const data = await shopifyFetch<ProductInventoryQueryResult>({
    query: PRODUCT_INVENTORY_QUERY,
    variables: { handle }
  });
  if (!data.product) return {};
  return Object.fromEntries(flattenConnection(data.product.variants).map((v) => [v.id, v.quantityAvailable]));
}

export async function getProductRecommendations(productId: string): Promise<ProductCard[]> {
  const data = await shopifyFetch<RecommendationsQueryResult>({
    query: RECOMMENDATIONS_QUERY,
    variables: { productId }
  });
  return data.productRecommendations ?? [];
}


export async function getPage(handle: string): Promise<ShopifyPage | null> {
  const data = await shopifyFetch<PageByHandleQueryResult>({
    query: PAGE_BY_HANDLE_QUERY,
    variables: { handle }
  });
  return data.page;
}

/** Highest product price in the store — the PLP price slider's ceiling. */
export async function getMaxProductPrice(): Promise<number> {
  const { products } = await getProducts({ first: 1, sortKey: "PRICE", reverse: true });
  const amount = Number(products[0]?.priceRange.maxVariantPrice.amount ?? 0);
  return Math.max(100, Math.ceil(amount / 10) * 10);
}

/**
 * Home section convention (PAGE-BLUEPRINTS §Home, documented in README): a
 * store owner controls a section by creating a collection with the given
 * handle; without one we fall back to a product sort.
 */
export async function getHomeSectionProducts(
  collectionHandle: string,
  fallbackSort: { sortKey: "CREATED_AT" | "BEST_SELLING"; reverse?: boolean },
  count = 4
): Promise<ProductCard[]> {
  const collection = await getCollectionWithProducts(collectionHandle, { first: count });
  const fromCollection = collection ? flattenConnection(collection.products) : [];
  if (fromCollection.length > 0) return fromCollection;
  const { products } = await getProducts({ first: count, ...fallbackSort });
  return products;
}

/** Handles-only data for sitemap.ts — never used to render a page. */
export async function getSitemapEntries(): Promise<{
  products: SitemapEntry[];
  collections: SitemapEntry[];
  pages: SitemapEntry[];
}> {
  const data = await shopifyFetch<SitemapQueryResult>({
    query: SITEMAP_QUERY,
    variables: { first: 250 }
  });
  return {
    products: flattenConnection(data.products),
    collections: flattenConnection(data.collections),
    pages: flattenConnection(data.pages)
  };
}
