// Configuração base para fetch
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/v1";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | string[] | number | boolean>;
}

/**
 * Constrói a URL completa com query params
 */
function buildUrl(endpoint: string, params?: FetchOptions["params"]): string {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let url = `${BASE_URL}${normalizedEndpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}

/**
 * Obtém os headers padrão
 */
function getDefaultHeaders(customHeaders?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  return {
    ...headers,
    ...customHeaders,
  };
}

/**
 * Wrapper para fetch com configuração base reutilizável
 * Útil para Server Components e Server Actions
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<T> {
  const { params, headers, ...restOptions } = options || {};

  const url = buildUrl(endpoint, params);
  const defaultHeaders = getDefaultHeaders(headers);

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: defaultHeaders,
    });

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const errorMessage = `HTTP error! status: ${response.status}`;
      console.error(`Error fetching ${endpoint}:`, errorMessage);
      throw new Error(errorMessage);
    }

    // Tentar parsear como JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Métodos auxiliares para facilitar o uso
 */
export const apiFetch = {
  get: <T>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchApi<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: Omit<FetchOptions, "method" | "body">) =>
    fetchApi<T>(endpoint, { ...options, method: "DELETE" }),
};
