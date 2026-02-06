import gql from "graphql-tag";

export const GET_PRODUCT_BY_HANDLE_QUERY = gql`
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      productType
      tags
      priceRange {
        minVariantPrice {
          amount
          currencyCode
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
      featuredImage {
        url
        altText
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
