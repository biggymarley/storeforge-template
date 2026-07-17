/** Hand-written Storefront API types for the queries this template runs. */

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface Connection<T> {
  edges: { node: T; cursor?: string }[];
  pageInfo?: PageInfo;
}

export function flattenConnection<T>(connection: Connection<T> | null | undefined): T[] {
  return connection?.edges.map((edge) => edge.node) ?? [];
}

export interface ProductOption {
  name: string;
  optionValues: { name: string; swatch: { color: string | null } | null }[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
  compareAtPrice: Money | null;
  image: ShopifyImage | null;
}

export interface ProductCard {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  compareAtPriceRange: { maxVariantPrice: Money };
}

export interface Product extends ProductCard {
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  variants: Connection<ProductVariant>;
  images: Connection<ShopifyImage>;
  seo: { title: string | null; description: string | null };
  tags: string[];
  vendor: string;
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  seo: { title: string | null; description: string | null };
}

export interface CollectionWithProducts extends Collection {
  products: Connection<ProductCard>;
}

/** Facets returned by collection.products.filters (drives the PLP sidebar). */
export interface FilterFacetValue {
  id: string;
  label: string;
  count: number;
  /** JSON-encoded ProductFilter to apply this value. */
  input: string;
  swatch: { color: string | null } | null;
}

export interface FilterFacet {
  id: string;
  label: string;
  type: "LIST" | "PRICE_RANGE" | "BOOLEAN";
  values: FilterFacetValue[];
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: { totalAmount: Money; amountPerQuantity: Money; compareAtAmountPerQuantity: Money | null };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: { name: string; value: string }[];
    product: { id: string; handle: string; title: string; featuredImage: ShopifyImage | null };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: Connection<CartLine>;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money | null;
  };
  discountCodes: { code: string; applicable: boolean }[];
  discountAllocations: { discountedAmount: Money }[];
}

export interface ShopifyPage {
  id: string;
  handle: string;
  title: string;
  body: string;
  bodySummary: string;
  seo: { title: string | null; description: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserError {
  field: string[] | null;
  message: string;
}

/* ---- operation result shapes ---- */

export interface ProductsQueryResult {
  products: Connection<ProductCard> & { pageInfo: PageInfo };
}

export interface ProductByHandleQueryResult {
  product: Product | null;
}

export interface CollectionsQueryResult {
  collections: Connection<Collection>;
}

export interface CollectionByHandleQueryResult {
  collection:
    | (CollectionWithProducts & {
        products: Connection<ProductCard> & { pageInfo: PageInfo; filters?: FilterFacet[] };
      })
    | null;
}

export interface SearchQueryResult {
  search: Connection<ProductCard> & { pageInfo: PageInfo; totalCount: number };
}

export interface PredictiveSearchQueryResult {
  predictiveSearch: { products: ProductCard[] } | null;
}

export interface PageByHandleQueryResult {
  page: ShopifyPage | null;
}

export interface PagesQueryResult {
  pages: Connection<ShopifyPage>;
}

export interface RecommendationsQueryResult {
  productRecommendations: ProductCard[] | null;
}

export interface CartQueryResult {
  cart: Cart | null;
}

export interface SitemapEntry {
  handle: string;
  updatedAt: string;
}

export interface SitemapQueryResult {
  products: Connection<SitemapEntry>;
  collections: Connection<SitemapEntry>;
  pages: Connection<SitemapEntry>;
}

export interface CartCreateResult {
  cartCreate: { cart: Cart | null; userErrors: UserError[] } | null;
}

export interface CartLinesAddResult {
  cartLinesAdd: { cart: Cart | null; userErrors: UserError[] } | null;
}

export interface CartLinesUpdateResult {
  cartLinesUpdate: { cart: Cart | null; userErrors: UserError[] } | null;
}

export interface CartLinesRemoveResult {
  cartLinesRemove: { cart: Cart | null; userErrors: UserError[] } | null;
}

export interface CartDiscountCodesUpdateResult {
  cartDiscountCodesUpdate: { cart: Cart | null; userErrors: UserError[] } | null;
}
