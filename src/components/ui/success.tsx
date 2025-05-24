"use client";

import { CheckCircle } from "lucide-react";

interface SuccessProps {
  title?: string;
  message: string;
}

export function Success({ title = "Success", message }: SuccessProps) {
  return (
    <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        <div>
          <h3 className="font-medium text-green-800 dark:text-green-300">
            {title}
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}