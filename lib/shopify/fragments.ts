export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCardFields on Product {
    id
    handle
    title
    availableForSale
    featuredImage {
      ...ImageFields
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    quickAddVariants: variants(first: 2) {
      edges {
        node {
          id
          availableForSale
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

export const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    ...ProductCardFields
    description
    descriptionHtml
    vendor
    tags
    seo {
      title
      description
    }
    options {
      name
      optionValues {
        name
        swatch {
          color
        }
      }
    }
    images(first: 20) {
      edges {
        node {
          ...ImageFields
        }
      }
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          image {
            ...ImageFields
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    discountCodes {
      code
      applicable
    }
    discountAllocations {
      discountedAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
            compareAtAmountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              selectedOptions {
                name
                value
              }
              product {
                id
                handle
                title
                featuredImage {
                  ...ImageFields
                }
              }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;
