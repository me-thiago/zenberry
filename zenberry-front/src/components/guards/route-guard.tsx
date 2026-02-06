"use client";

import { ReactNode } from "react";
import { useRouteProtection } from "@/src/hooks/use-route-protection";
import { ZenberryLoader } from "@/src/components/loader/zenberry-loader";

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
  onUnauthorized?: () => void;
  showToast?: boolean;
  toastMessage?: string;
}

export function RouteGuard({
  children,
  requireAuth = true,
  redirectTo = "/auth",
  fallback,
  onUnauthorized,
  showToast = true,
  toastMessage,
}: RouteGuardProps) {
  const { canAccess, isLoading } = useRouteProtection({
    requireAuth,
    redirectTo,
    onUnauthorized,
    showToast,
    toastMessage,
  });

  // Mostra loading durante verificação inicial
  if (isLoading) {
    return fallback || <ZenberryLoader />;
  }

  // Se não pode acessar, não renderiza nada (redirecionamento já foi feito)
  if (!canAccess) {
    return null;
  }

  // Renderiza o conteúdo se pode acessar
  return <>{children}</>;
}
