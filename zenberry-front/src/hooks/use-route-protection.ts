"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthContext } from "@/src/contexts/auth-context";

interface UseRouteProtectionOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  onUnauthorized?: () => void;
  showToast?: boolean;
  toastMessage?: string;
}

export function useRouteProtection(options: UseRouteProtectionOptions = {}) {
  const {
    requireAuth = true,
    redirectTo = "/auth",
    onUnauthorized,
    showToast = true,
    toastMessage,
  } = options;

  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Aguardar o carregamento inicial da autenticação
    if (isLoading) return;

    // Evitar múltiplos redirecionamentos
    if (hasRedirected.current) return;

    // Se requer autenticação e usuário não está autenticado
    if (requireAuth && !isAuthenticated) {
      hasRedirected.current = true;
      
      if (showToast) {
        toast.error(
          toastMessage ||
            "You need to be authenticated to access this page"
        );
      }

      if (onUnauthorized) {
        onUnauthorized();
      } else {
        router.replace(redirectTo);
      }
      return;
    }

    // Se não requer autenticação (página de login) e usuário já está autenticado
    if (!requireAuth && isAuthenticated) {
      hasRedirected.current = true;
      
      if (showToast) {
        toast.info(toastMessage || "You are already authenticated");
      }
      router.replace(redirectTo);
      return;
    }

    // Reset flag se o estado mudou adequadamente
    hasRedirected.current = false;
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    redirectTo,
    router,
    onUnauthorized,
    showToast,
    toastMessage,
  ]);

  return {
    isAuthenticated,
    isLoading,
    canAccess: requireAuth ? isAuthenticated : !isAuthenticated,
  };
}
