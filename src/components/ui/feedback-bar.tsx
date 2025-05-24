"use client";

import { Spinner } from "./spinner";
import { Error } from "./error";
import { Success } from "./success";
import { cn } from "@/lib/utils";

interface FeedbackBarProps {
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  errorTitle?: string;
  success?: boolean;
  successTitle?: string;
  successMessage?: string;
  className?: string;
}

export function FeedbackBar({
  isLoading,
  loadingMessage = "Loading...",
  error,
  errorTitle = "Error",
  success,
  successTitle = "Success",
  successMessage,
  className,
}: FeedbackBarProps) {
  if (!isLoading && !error && !success) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {isLoading && (
        <div className="flex items-center gap-2 bg-muted p-4 rounded-lg">
          <Spinner className="text-muted-foreground" size="sm" />
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        </div>
      )}

      {error && (
        <Error 
          title={errorTitle}
          message={error}
        />
      )}

      {success && (
        <Success 
          title={successTitle}
          message={successMessage || "Operation completed successfully"}
        />
      )}
    </div>
  );
}