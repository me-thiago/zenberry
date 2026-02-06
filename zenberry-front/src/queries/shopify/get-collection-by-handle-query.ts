import gql from "graphql-tag";

export const GET_COLLECTION_BY_HANDLE_QUERY = gql`
  query getCollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first) {
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
            images(first: 10) {
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
            productBenefit: metafield(
              namespace: "custom"
              key: "productBenefit"
            ) {
              value
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
      }
    }
  }
`;
