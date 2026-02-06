import gql from "graphql-tag";

export const CREATE_CART_MUTATION = gql`
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                  }
                }
              }
            }
          }
        }
        buyerIdentity {
          email
        }
      }
    }
  }
`;
