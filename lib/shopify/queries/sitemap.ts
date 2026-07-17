/** Lightweight handles-only query — sitemap.ts must not pull full card data. */
export const SITEMAP_QUERY = /* GraphQL */ `
  query Sitemap($first: Int!) {
    products(first: $first) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
    collections(first: $first) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
    pages(first: $first) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;
