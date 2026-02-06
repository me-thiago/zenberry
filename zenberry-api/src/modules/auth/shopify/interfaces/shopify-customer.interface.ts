export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  acceptsMarketing: boolean;
}

export interface ShopifyCustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface ShopifyCustomerCreateResponse {
  customerCreate: {
    customer: ShopifyCustomer | null;
    customerUserErrors: {
      code: string;
      field: string[];
      message: string;
    }[];
  };
}

export interface ShopifyCustomerAccessTokenCreateResponse {
  customerAccessTokenCreate: {
    customerAccessToken: ShopifyCustomerAccessToken | null;
    customerUserErrors: {
      code: string;
      field: string[];
      message: string;
    }[];
  };
}

export interface ShopifyCustomerQueryResponse {
  customer: ShopifyCustomer | null;
}

export interface ShopifyCustomerAccessTokenDeleteResponse {
  customerAccessTokenDelete: {
    deletedAccessToken: string | null;
    deletedCustomerAccessTokenId: string | null;
    userErrors: {
      field: string[];
      message: string;
    }[];
  };
}
