"use client";

import { FormEvent, ReactNode } from "react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface TabFormProps {
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  isValid?: boolean;
  className?: string;
}

export function TabForm({
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  onCancel,
  isLoading = false,
  isValid = true,
  className
}: TabFormProps) {
  return (
    <form 
      onSubmit={onSubmit} 
      className={cn("space-y-4", className)}
    >
      {children}
      
      <div className="flex items-center justify-end gap-2 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
        )}
        
        <Button 
          type="submit" 
          disabled={isLoading || !isValid}
        >
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
