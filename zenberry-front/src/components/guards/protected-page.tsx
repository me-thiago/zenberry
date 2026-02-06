"use client";

import { ReactNode } from "react";
import { RouteGuard } from "./route-guard";

interface ProtectedPageProps {
  children: ReactNode;
  fallback?: ReactNode;
  toastMessage?: string;
}

export function ProtectedPage({
  children,
  fallback,
  toastMessage,
}: ProtectedPageProps) {
  return (
    <RouteGuard
      requireAuth={true}
      redirectTo="/auth"
      fallback={fallback}
      showToast={true}
      toastMessage={toastMessage}
    >
      {children}
    </RouteGuard>
  );
}
