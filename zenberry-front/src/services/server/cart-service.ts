'use server';

import { shopifyQuery } from '@/src/config/shopify';
import { CREATE_CART_MUTATION } from '@/src/queries/shopify/create-cart-mutation';
import { ShopifyCreateCartOperation } from '@/src/types/shopify';
import { redirect } from 'next/navigation';
import { getAuthToken } from './auth-service';

export interface CheckoutLineItem {
  variantId: string;
  quantity: number;
}

/**
 * Server action to create a checkout with cart items and redirect to Shopify checkout.
 * IMPORTANT: User must be authenticated before calling this function.
 * Use the useProtectedAction hook to ensure authentication on the client side.
 * @param lineItems - Array of products with variantId and quantity
 * @returns Redirect to Shopify checkout URL
 */
export async function createCheckoutFromCart(lineItems: CheckoutLineItem[]) {
  if (!lineItems || lineItems.length === 0) {
    throw new Error('Cart is empty');
  }

  try {
    // Get authentication token (required)
    const token = await getAuthToken();

    if (!token) {
      throw new Error('User must be authenticated to create checkout');
    }

    // Build cart input with buyer identity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cartInput: any = {
      lines: lineItems.map(item => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      })),
      buyerIdentity: {
        customerAccessToken: token,
      },
    };

    const { cartCreate } = await shopifyQuery<
      ShopifyCreateCartOperation['data'],
      ShopifyCreateCartOperation['variables']
    >(
      CREATE_CART_MUTATION,
      {
        input: cartInput,
      },
      'no-store'
    );

    if (cartCreate?.cart?.checkoutUrl) {
      redirect(cartCreate.cart.checkoutUrl);
    } else {
      throw new Error('Failed to create checkout URL');
    }
  } catch (error) {
    // Don't catch NEXT_REDIRECT errors - they're expected behavior
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    console.error('Checkout creation failed:', error);
    console.error('Line items:', JSON.stringify(lineItems, null, 2));
    throw new Error('Could not create checkout. Please try again.');
  }
}
