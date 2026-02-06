/**
 * Cloudflare Turnstile Widget
 * Invisible CAPTCHA that protects against bots without affecting UX
 */

"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          size?: "compact" | "flexible" | "normal";
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
}

export function TurnstileWidget({
  onVerify,
  onError,
  onExpired,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    if (widgetIdRef.current) return; // Already rendered

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      "error-callback": onError,
      "expired-callback": onExpired,
      size: "compact",
      theme: "light",
    });
  }, [siteKey, onVerify, onError, onExpired]);

  useEffect(() => {
    // Skip if no site key configured (development mode)
    if (!siteKey) {
      console.warn("Turnstile: No site key configured, skipping verification");
      // Auto-verify in development
      onVerify("dev-mode-token");
      return;
    }

    // Load Turnstile script if not already loaded
    if (!scriptLoadedRef.current && !document.getElementById("turnstile-script")) {
      const script = document.createElement("script");
      script.id = "turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;

      window.onTurnstileLoad = () => {
        scriptLoadedRef.current = true;
        renderWidget();
      };

      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, renderWidget, onVerify]);

  // Compact widget - small checkbox style, minimal visual impact
  return <div ref={containerRef} className="mb-2" />;
}
