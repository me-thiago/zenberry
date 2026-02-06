import { apiFetch } from "@/src/config/fetch";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  CustomerData,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "@/src/types/auth";

export const authService = {
  /**
   * Login com Shopify via backend NestJS
   */
  loginWithShopify: async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    return apiFetch.post<AuthResponse>("/auth/shopify/login", credentials);
  },

  /**
   * Registro com Shopify via backend NestJS
   */
  registerWithShopify: async (data: RegisterData): Promise<AuthResponse> => {
    return apiFetch.post<AuthResponse>("/auth/shopify/register", data);
  },

  /**
   * Buscar dados do customer autenticado
   */
  getCurrentCustomer: async (accessToken: string): Promise<CustomerData> => {
    return apiFetch.get<CustomerData>("/auth/shopify/customer", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  /**
   * Logout (invalidar token Shopify)
   */
  logoutShopify: async (accessToken: string): Promise<void> => {
    await apiFetch.post<void>("/auth/shopify/logout", undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  /**
   * Atualizar perfil do cliente via backend (proxy Shopify)
   */
  updateProfile: async (
    payload: UpdateProfilePayload,
    accessToken: string
  ): Promise<UpdateProfileResponse> => {
    return apiFetch.put<UpdateProfileResponse>("/users/settings", payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
