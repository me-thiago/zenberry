"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      richColors
      closeButton
      expand={true}
      theme={"light"}
      position={"top-right"}
    />
  );
}
