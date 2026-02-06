"use client";

import { ReactNode } from "react";
import { RouteGuard } from "./route-guard";

interface GuestOnlyPageProps {
  children: ReactNode;
  fallback?: ReactNode;
  toastMessage?: string;
  showToast?: boolean;
  redirectTo?: string;
}

export function GuestOnlyPage({
  children,
  fallback,
  toastMessage,
  showToast = true,
  redirectTo = "/",
}: GuestOnlyPageProps) {
  return (
    <RouteGuard
      requireAuth={false}
      redirectTo={redirectTo}
      fallback={fallback}
      showToast={showToast}
      toastMessage={toastMessage}
    >
      {children}
    </RouteGuard>
  );
}
