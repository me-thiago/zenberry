"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/src/contexts/auth-context";
import { toast } from "sonner";

/**
 * Hook to execute protected actions that require authentication.
 * Automatically handles redirection to auth page if user is not authenticated.
 * 
 * @example
 * const executeProtectedAction = useProtectedAction();
 * 
 * const handleCheckout = () => {
 *   executeProtectedAction(async () => {
 *     await createCheckoutFromCart(items);
 *   });
 * };
 */
export function useProtectedAction() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  /**
   * Executes an action only if user is authenticated.
   * If not authenticated, shows a toast and redirects to auth page.
   * 
   * @param action - The async function to execute if authenticated
   * @param options - Optional configuration
   * @returns Promise<boolean> - true if action was executed, false if redirected
   */
  const executeProtectedAction = async (
    action: () => Promise<void>,
    options?: {
      redirectTo?: string;
      errorMessage?: string;
      skipToast?: boolean;
    }
  ): Promise<boolean> => {
    const {
      redirectTo = "/auth",
      errorMessage = "To proceed to checkout, you need to log in or sign up first",
      skipToast = false,
    } = options || {};

    // Wait for auth state to load
    if (isLoading) {
      return false;
    }

    // Check authentication
    if (!isAuthenticated) {
      if (!skipToast) {
        toast.error(errorMessage);
      }
      router.push(redirectTo);
      return false;
    }

    // Execute the protected action
    try {
      await action();
      return true;
    } catch (error) {
      // Re-throw to let the caller handle specific errors
      throw error;
    }
  };

  return executeProtectedAction;
}
