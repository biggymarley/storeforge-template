import { PRODUCT_CARD_FRAGMENT, PRODUCT_FRAGMENT } from "@/lib/shopify/fragments";

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      last: $last
      after: $after
      before: $before
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          ...ProductCardFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
  ${PRODUCT_FRAGMENT}
`;

// Separate from PRODUCT_BY_HANDLE_QUERY on purpose: quantityAvailable requires the
// unauthenticated_read_product_inventory Storefront API scope, which not every store's
// token has. Isolating it means a missing scope only drops the stock badge, not the whole PDP.
export const PRODUCT_INVENTORY_QUERY = /* GraphQL */ `
  query ProductInventory($handle: String!) {
    product(handle: $handle) {
      variants(first: 100) {
        edges {
          node {
            id
            quantityAvailable
          }
        }
      }
    }
  }
`;

export const RECOMMENDATIONS_QUERY = /* GraphQL */ `
  query ProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductCardFields
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
