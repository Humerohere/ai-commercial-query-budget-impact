"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  iconClassName?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  className,
  iconClassName,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`h-16 w-16 text-blue-500 animate-spin ${iconClassName}`} />
      {message && (
        <p className="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300 text-center max-w-md">
          {message}
        </p>
      )}
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This might take a moment...</p>
    </div>
  );
};

export default LoadingSpinner;