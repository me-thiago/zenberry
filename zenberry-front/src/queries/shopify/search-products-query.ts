import gql from "graphql-tag";

export const SEARCH_PRODUCTS_QUERY = gql`
  query searchProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          description
          tags
          productType
          vendor
          featuredImage {
            url
            altText
            width
            height
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          productBenefit: metafield(namespace: "custom", key: "productBenefit") {
            value
          }
          ingredients: metafield(namespace: "shopify", key: "cbd-ingredients") {
            references(first: 10) {
              edges {
                node {
                  ... on Metaobject {
                    id
                    type
                    fields {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

