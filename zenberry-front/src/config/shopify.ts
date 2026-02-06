import { type TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";

/**
 * Executes a GraphQL query against the Shopify Storefront API.
 *
 * @param query - The GraphQL query (a TypedDocumentNode for type safety).
 * @param variables - An object of variables to pass to the query.
 * @param cache - The caching strategy for the fetch request. Defaults to 'force-cache'.
 *                Can be set to 'no-store' for dynamic data or a revalidation interval in seconds.
 * @returns A promise that resolves with the query result.
 * @template TResult - The type of the query result.
 * @template TVariables - The type of the query variables.
 */
export async function shopifyQuery<TResult, TVariables>(
  query: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
  cache: RequestCache | { next: { revalidate: number } } = "force-cache"
): Promise<TResult> {
  const { SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_PUBLIC_TOKEN } = process.env;

  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_PUBLIC_TOKEN) {
    throw new Error("Missing Shopify environment variables.");
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;

  // The `print` function from `graphql` converts the TypedDocumentNode into a string.
  const body = JSON.stringify({
    query: print(query),
    variables,
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_PUBLIC_TOKEN,
      },
      body,
      ...(typeof cache === "string" ? { cache } : { next: cache.next }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Shopify API Error: ${response.statusText} - ${errorBody}`
      );
    }

    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL Errors:", JSON.stringify(result.errors, null, 2));
      throw new Error(
        `GraphQL query failed: ${result.errors
          .map((e: any) => e.message)
          .join(", ")}`
      );
    }

    return result.data;
  } catch (error) {
    console.error("Error in shopifyQuery:", error);
    throw error;
  }
}
