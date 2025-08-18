"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface TabContentProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
  onRetry?: () => void;
}

export function TabContent({
  children,
  isLoading = false,
  error = null,
  className,
  onRetry
}: TabContentProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 h-40 text-center">
        <p className="text-destructive mb-4">{error}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("py-2", className)}>
      {children}
    </div>
  );
}
