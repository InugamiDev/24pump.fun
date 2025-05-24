"use client";

import { AlertCircle } from "lucide-react";

interface ErrorProps {
  title?: string;
  message: string;
}

export function Error({ title = "Error", message }: ErrorProps) {
  return (
    <div className="rounded-md bg-destructive/15 p-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <h3 className="font-medium text-destructive">{title}</h3>
          <p className="text-sm text-destructive/90">{message}</p>
        </div>
      </div>
    </div>
  );
}