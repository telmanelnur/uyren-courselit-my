"use client";

import { useState } from "react";
import { useToast } from "@workspace/components-library";

export interface MutationOptions<TData, TError> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onSettled?: () => void;
}

export interface UseMutationResult<TData, TVariables, TError> {
  mutate: (variables: TVariables) => Promise<void>;
  isLoading: boolean;
  error: TError | null;
  data: TData | null;
  reset: () => void;
}

/**
 * A simplified mutation hook for tabs component
 */
export function useTabMutation<TData = unknown, TVariables = unknown, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TError>
): UseMutationResult<TData, TVariables, TError> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<TError | null>(null);
  const [data, setData] = useState<TData | null>(null);
  const { toast } = useToast();

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setData(null);
  };

  const mutate = async (variables: TVariables) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(variables);
      setData(result);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      setError(err as TError);
      
      if (options?.onError) {
        options.onError(err as TError);
      } else {
        // Default error handling
        toast({
          title: "Error",
          description: (err as Error).message,
          variant: "destructive",
        });
      }
      
      throw err;
    } finally {
      setIsLoading(false);
      
      if (options?.onSettled) {
        options.onSettled();
      }
    }
  };

  return {
    mutate,
    isLoading,
    error,
    data,
    reset
  };
}
