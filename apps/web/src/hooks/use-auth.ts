"use client";

import { useMutation } from "@tanstack/react-query";
import { AuthClientService } from "@/lib/auth/client-service";

export type AuthProvider = "google" | "email" | "github" | "facebook";

interface AuthMutationResult {
  success: boolean;
  error?: string;
}

interface AuthData {
  email?: string;
  // Add other fields for other providers as needed
}

/**
 * Unified Firebase Auth hook supporting multiple providers
 */
export const useFirebaseAuth = () => {
  return useMutation<AuthMutationResult, Error, { provider: AuthProvider; data?: AuthData }>({
    mutationFn: async ({ provider, data }): Promise<AuthMutationResult> => {
      switch (provider) {
        case "google":
          return await AuthClientService.signInWithGoogle();
        case "email":
          // Placeholder for email authentication
          if (!data?.email) {
            return { success: false, error: "Email required" };
          }
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          return {
            success: false,
            error: "Email authentication not yet implemented"
          };
        default:
          return { success: false, error: `Provider '${provider}' not supported` };
      }
    },
    retry: (failureCount, error) => {
      // Retry up to 2 times for network errors
      if (failureCount < 2 && error.message.includes('network')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    onSuccess: (data, variables) => {
      if (data.success) {
        console.log(`${variables.provider} authentication successful`);
      }
    },
    onError: (error, variables) => {
      console.error(`${variables.provider} authentication failed:`, error);
    },
  });
};
