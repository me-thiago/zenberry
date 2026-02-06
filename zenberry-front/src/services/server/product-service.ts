import { Product } from "@/src/types/product";
import {
  GetProductsParams,
  GetProductsResponse,
} from "@/src/types/product-api";
import { apiFetch } from "@/src/config/fetch";

// Função para normalizar os produtos da API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeProduct(product: any): Product {
  const imageUrl = "/product.webp";

  // Normaliza o array de imagens
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [imageUrl, imageUrl, imageUrl, imageUrl];

  return {
    ...product,
    images: images,
    price:
      typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price,
    originalPrice: product.originalPrice
      ? typeof product.originalPrice === "string"
        ? parseFloat(product.originalPrice)
        : product.originalPrice
      : 99.99,
    discount: product.discount
      ? typeof product.discount === "string"
        ? parseFloat(product.discount)
        : product.discount
      : 15,
    rating:
      typeof product.rating === "string"
        ? parseFloat(product.rating)
        : product.rating,
    reviewCount:
      typeof product.reviewCount === "string"
        ? parseInt(product.reviewCount)
        : product.reviewCount,
  };
}

export async function getProducts(
  params?: GetProductsParams
): Promise<GetProductsResponse> {
  try {
    const data = await apiFetch.get<GetProductsResponse | Product[]>(
      "/products",
      {
        params: params as Record<string, string | string[] | number | boolean>,
        next: { revalidate: 60 },
      }
    );

    // Se a API retornar um array diretamente, normaliza para o formato esperado
    if (Array.isArray(data)) {
      return {
        products: data.map(normalizeProduct),
        total: data.length,
        page: params?.page || 1,
        limit: params?.limit || 20,
      };
    }

    // Se a API retornar um objeto com a estrutura esperada
    return {
      products: (data.products || []).map(normalizeProduct),
      total: data.total || 0,
      page: data.page || params?.page || 1,
      limit: data.limit || params?.limit || 20,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const data = await apiFetch.get<Product>(`/products/${id}`, {
      next: { revalidate: 60 },
    });

    return normalizeProduct(data);
  } catch (error) {
    console.error("Error fetching product or normalizing:", error);
    throw error;
  }
}
