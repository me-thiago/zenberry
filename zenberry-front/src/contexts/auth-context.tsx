"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import type {
  CustomerData,
  LoginCredentials,
  RegisterData,
  UpdateProfilePayload,
} from "@/src/types/auth";
import { authService } from "@/src/services/client/auth-service";
import { clearAuthToken, saveAuthToken } from "@/src/services/server/auth-service";

interface AuthContextType {
  customer: CustomerData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithCredentials: (credentials: LoginCredentials) => Promise<void>;
  registerWithCredentials: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialToken?: string | null;
}

export function AuthProvider({ children, initialToken }: AuthProviderProps) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Sempre começa loading
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [initialized, setInitialized] = useState(false);

  /**
   * Busca os dados do customer autenticado do Shopify
   */
  const refreshCustomer = useCallback(async () => {
    if (!token) {
      setCustomer(null);
      setIsLoading(false);
      setInitialized(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const customerData = await authService.getCurrentCustomer(token);
      setCustomer(customerData);
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      setCustomer(null);
      setToken(null);
      await clearAuthToken();
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, [token]);

  /**
   * Carrega o customer quando o componente monta
   */
  useEffect(() => {
    if (!initialized) {
      refreshCustomer();
    }
  }, [initialized, refreshCustomer]);

  /**
   * Login: atualiza o estado com os dados do customer
   * O token é gerenciado via cookies httpOnly (Server Action)
   */
  const loginWithCredentials = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      const response = await authService.loginWithShopify(credentials);

      // Salvar token em cookie httpOnly
      await saveAuthToken({
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
      });

      // Atualizar estado local
      setCustomer(response.customer);
      setToken(response.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registro: cria conta e atualiza o estado
   */
  const registerWithCredentials = async (data: RegisterData) => {
    setIsLoading(true);

    try {
      const response = await authService.registerWithShopify(data);

      // Salvar token em cookie httpOnly
      await saveAuthToken({
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
      });

      // Atualizar estado local
      setCustomer(response.customer);
      setToken(response.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout: invalida token no Shopify, limpa cookies e estado local
   */
  const logout = async () => {
    setIsLoading(true);

    try {
      // Se houver token, invalidar no Shopify
      if (token) {
        try {
          await authService.logoutShopify(token);
        } catch (error) {
          console.error("Failed to logout from Shopify:", error);
        }
      }
    } finally {
      await clearAuthToken();
      setCustomer(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  /**
   * Atualiza perfil do cliente no Shopify via backend
   * Não usa isLoading global para evitar overlay fullscreen
   */
  const updateProfile = async (data: UpdateProfilePayload) => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    // Não usar setIsLoading aqui - deixar o componente gerenciar seu próprio loading
    const response = await authService.updateProfile(data, token);

    if (response.accessToken && response.expiresAt) {
      await saveAuthToken({
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
      });
      setToken(response.accessToken);
    }

    setCustomer(response.customer);
  };

  const value: AuthContextType = {
    customer,
    isAuthenticated: !!customer && !!token,
    isLoading,
    loginWithCredentials,
    registerWithCredentials,
    logout,
    refreshCustomer,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}