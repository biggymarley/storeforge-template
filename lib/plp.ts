/**
 * Shared PLP state: the URL-searchParams contract used by /products,
 * /collections/[handle] and /search, and its mapping onto Storefront
 * queries. URL scheme:
 *
 *   ?sort=newest|best-selling|price-asc|price-desc
 *   &price_min=10&price_max=200
 *   &instock=1
 *   &f.Color=Black,Red        ← one `f.<OptionName>` param per variant option
 *   &after=<cursor> | &before=<cursor>
 *
 * `f.*` is generic on purpose: the sidebar renders whatever option facets
 * Shopify returns (Color, Size, Material…), so stores aren't limited to the
 * design's Colors/Size sections.
 */
import type { ProductFilterArg } from "@/lib/shopify/api";

export const PLP_PAGE_SIZE = 12;

export type SortValue = "best-selling" | "newest" | "price-asc" | "price-desc";

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "best-selling", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }
];

/**
 * The Storefront `search` connection only sorts by RELEVANCE | PRICE, so the
 * search page offers a reduced menu. The default slot ("best-selling", i.e. no
 * `sort` param) reads as "Relevance" there.
 */
export const SEARCH_SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "best-selling", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }
];

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const PLP_KEYS = new Set(["sort", "price_min", "price_max", "instock", "after", "before"]);

/** Keys owned by the PLP filter/sort/paging state. Anything else (e.g. the search page's `q`) must survive filter changes. */
export function isPlpParam(key: string): boolean {
  return PLP_KEYS.has(key) || key.startsWith("f.");
}

export interface PlpParams {
  sort: SortValue;
  priceMin?: number;
  priceMax?: number;
  inStock: boolean;
  /** Variant-option selections keyed by option name, from `f.<name>` params. */
  options: Record<string, string[]>;
  after?: string;
  before?: string;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function parsePlpParams(searchParams: SearchParamsRecord): PlpParams {
  const sortRaw = first(searchParams.sort);
  const sort = SORT_OPTIONS.some((option) => option.value === sortRaw)
    ? (sortRaw as SortValue)
    : "best-selling";

  const options: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (!key.startsWith("f.") || key.length <= 2) continue;
    const values = (Array.isArray(value) ? value : [value])
      .filter((v): v is string => Boolean(v))
      .flatMap((v) => v.split(","))
      .map((v) => v.trim())
      .filter(Boolean);
    if (values.length > 0) options[key.slice(2)] = values;
  }

  return {
    sort,
    priceMin: parseNumber(first(searchParams.price_min)),
    priceMax: parseNumber(first(searchParams.price_max)),
    inStock: first(searchParams.instock) === "1",
    options,
    after: first(searchParams.after),
    before: first(searchParams.before)
  };
}

/** Serializes filter/sort state (never cursors — a filter change resets paging). */
export function plpParamsToSearchString(params: Omit<PlpParams, "after" | "before">): string {
  const out = new URLSearchParams();
  if (params.sort !== "best-selling") out.set("sort", params.sort);
  if (params.priceMin !== undefined) out.set("price_min", String(params.priceMin));
  if (params.priceMax !== undefined) out.set("price_max", String(params.priceMax));
  if (params.inStock) out.set("instock", "1");
  for (const [name, values] of Object.entries(params.options)) {
    if (values.length > 0) out.set(`f.${name}`, values.join(","));
  }
  const s = out.toString();
  return s ? `?${s}` : "";
}

/** Prev/next hrefs that keep the current filters and swap only the cursor. */
export function paginationHrefs(
  pathname: string,
  searchParams: SearchParamsRecord,
  cursors: { startCursor: string | null; endCursor: string | null }
): { previousHref: string; nextHref: string } {
  const base = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "after" || key === "before") continue;
    const v = first(value);
    if (v) base.set(key, v);
  }
  const prev = new URLSearchParams(base);
  if (cursors.startCursor) prev.set("before", cursors.startCursor);
  const next = new URLSearchParams(base);
  if (cursors.endCursor) next.set("after", cursors.endCursor);
  return {
    previousHref: `${pathname}?${prev.toString()}`,
    nextHref: `${pathname}?${next.toString()}`
  };
}

/* ---- Storefront mappings ---- */

/** ProductFilter[] for collection.products / search (supports variant options). */
export function plpParamsToProductFilters(params: PlpParams): ProductFilterArg[] {
  const filters: ProductFilterArg[] = [];
  if (params.inStock) filters.push({ available: true });
  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    filters.push({ price: { min: params.priceMin, max: params.priceMax } });
  }
  for (const [name, values] of Object.entries(params.options)) {
    // Same-name filters are OR'd by Shopify; different names are AND'd.
    for (const value of values) filters.push({ variantOption: { name, value } });
  }
  return filters;
}

/**
 * products(query:) string for /products — the products connection has no
 * `filters` arg, so variant options can't be applied there (price and
 * availability can). Option facets are a collection/search-page feature.
 */
export function plpParamsToProductsQuery(params: PlpParams): string | undefined {
  const parts: string[] = [];
  if (params.inStock) parts.push("available_for_sale:true");
  // The products-query search syntax prices variants, not products.
  if (params.priceMin !== undefined) parts.push(`variants.price:>=${params.priceMin}`);
  if (params.priceMax !== undefined) parts.push(`variants.price:<=${params.priceMax}`);
  return parts.length > 0 ? parts.join(" AND ") : undefined;
}

export function sortForProducts(sort: SortValue): {
  sortKey: "BEST_SELLING" | "CREATED_AT" | "PRICE";
  reverse: boolean;
} {
  switch (sort) {
    case "newest":
      return { sortKey: "CREATED_AT", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      return { sortKey: "BEST_SELLING", reverse: false };
  }
}

export function sortForCollection(sort: SortValue): {
  sortKey: "BEST_SELLING" | "CREATED" | "PRICE";
  reverse: boolean;
} {
  switch (sort) {
    case "newest":
      return { sortKey: "CREATED", reverse: true };
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      return { sortKey: "BEST_SELLING", reverse: false };
  }
}

export function sortForSearch(sort: SortValue): {
  sortKey: "RELEVANCE" | "PRICE";
  reverse: boolean;
} {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    default:
      // "newest"/"best-selling" aren't search sort keys — relevance is the default.
      return { sortKey: "RELEVANCE", reverse: false };
  }
}

/** Cursor paging args: `before` implies backwards paging (last/before). */
export function pageArgsFor(params: PlpParams): {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
} {
  if (params.before) return { last: PLP_PAGE_SIZE, before: params.before };
  return { first: PLP_PAGE_SIZE, after: params.after };
}
