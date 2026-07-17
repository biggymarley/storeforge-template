import { PRODUCT_CARD_FRAGMENT } from "@/lib/shopify/fragments";

export const SEARCH_QUERY = /* GraphQL */ `
  query SearchProducts(
    $query: String!
    $first: Int
    $last: Int
    $after: String
    $before: String
    $sortKey: SearchSortKeys
    $reverse: Boolean
  ) {
    search(
      query: $query
      types: [PRODUCT]
      first: $first
      last: $last
      after: $after
      before: $before
      sortKey: $sortKey
      reverse: $reverse
    ) {
      totalCount
      edges {
        cursor
        node {
          ... on Product {
            ...ProductCardFields
          }
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

export const PREDICTIVE_SEARCH_QUERY = /* GraphQL */ `
  query PredictiveSearch($query: String!, $limit: Int!) {
    predictiveSearch(query: $query, limit: $limit, types: [PRODUCT]) {
      products {
        ...ProductCardFields
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
