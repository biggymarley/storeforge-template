const PAGE_FRAGMENT = /* GraphQL */ `
  fragment PageFields on Page {
    id
    handle
    title
    body
    bodySummary
    seo {
      title
      description
    }
    createdAt
    updatedAt
  }
`;

export const PAGE_BY_HANDLE_QUERY = /* GraphQL */ `
  query PageByHandle($handle: String!) {
    page(handle: $handle) {
      ...PageFields
    }
  }
  ${PAGE_FRAGMENT}
`;

export const PAGES_QUERY = /* GraphQL */ `
  query Pages($first: Int!) {
    pages(first: $first) {
      edges {
        node {
          ...PageFields
        }
      }
    }
  }
  ${PAGE_FRAGMENT}
`;
