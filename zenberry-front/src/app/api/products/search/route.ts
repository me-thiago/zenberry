import { NextRequest, NextResponse } from "next/server";
import { shopifyQuery } from "@/src/config/shopify";
import { SEARCH_PRODUCTS_QUERY } from "@/src/queries/shopify/search-products-query";
import { ShopifySearchProductsOperation } from "@/src/types/shopify";
import { mapShopifyProductToProduct } from "@/src/mappers/product-mapper";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "250", 10);

    // Construir query string para Shopify
    // Se não houver query, busca todos os produtos
    // Shopify aceita busca simples por texto que busca em título, descrição e tags
    const shopifyQueryString = query.trim() || undefined;

    // Preparar variáveis - só incluir query se houver valor
    // Limite máximo do Shopify é 250 produtos por query
    const variables: ShopifySearchProductsOperation["variables"] = {
      first: Math.min(limit, 250),
    };
    
    if (shopifyQueryString) {
      variables.query = shopifyQueryString;
    }

    const { products: shopifyProducts } = await shopifyQuery<
      ShopifySearchProductsOperation["data"],
      ShopifySearchProductsOperation["variables"]
    >(
      SEARCH_PRODUCTS_QUERY,
      variables,
      "no-store" // Não cachear buscas
    );

    if (!shopifyProducts) {
      return NextResponse.json(
        { products: [], error: "No products found" },
        { status: 200 }
      );
    }

    const products = shopifyProducts.edges.map(({ node }) =>
      mapShopifyProductToProduct(node)
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json(
      { products: [], error: "Failed to search products" },
      { status: 500 }
    );
  }
}

