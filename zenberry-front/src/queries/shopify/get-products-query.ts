import gql from "graphql-tag";

export const GET_PRODUCTS_QUERY = gql`
  query getProducts($first: Int!) {
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
          metafields(identifiers: [
            {namespace: "custom", key: "productcbdtype"},
            {namespace: "custom", key: "productcbd"},
            {namespace: "custom", key: "productcategory"},
            {namespace: "custom", key: "productconcentration"},
            {namespace: "custom", key: "productcarrier"},
            {namespace: "custom", key: "productuse"},
            {namespace: "custom", key: "productingredients"},
            {namespace: "custom", key: "productthc"},
            {namespace: "custom", key: "productquantity"}
          ]) {
            key
            value
          }
        }
      }
    }
  }
`;
