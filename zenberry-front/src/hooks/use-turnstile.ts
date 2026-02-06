/**
 * Turnstile Hook
 * Manages Turnstile verification state for chat protection
 */

import { useState, useCallback } from "react";

interface UseTurnstileReturn {
  token: string | null;
  isVerified: boolean;
  isVerifying: boolean;
  error: string | null;
  onVerify: (token: string) => void;
  onError: () => void;
  onExpired: () => void;
  reset: () => void;
}

export function useTurnstile(): UseTurnstileReturn {
  const [token, setToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onVerify = useCallback((newToken: string) => {
    setToken(newToken);
    setIsVerifying(false);
    setError(null);
  }, []);

  const onError = useCallback(() => {
    setError("Verification failed. Please refresh the page.");
    setIsVerifying(false);
  }, []);

  const onExpired = useCallback(() => {
    setToken(null);
    setIsVerifying(true);
    // Token expired, widget will auto-refresh
  }, []);

  const reset = useCallback(() => {
    setToken(null);
    setIsVerifying(true);
    setError(null);
  }, []);

  return {
    token,
    isVerified: !!token,
    isVerifying,
    error,
    onVerify,
    onError,
    onExpired,
    reset,
  };
}
