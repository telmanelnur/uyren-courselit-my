"use client";

import { cn } from "@workspace/ui/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  showNumbers?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "purple" | "orange";
  className?: string;
}

export function ProgressBar({
  current,
  total,
  showNumbers = true,
  size = "md",
  color = "blue",
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  const colorClasses = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    orange: "bg-orange-600",
  };

  return (
    <div className={cn("w-full", className)}>
      {showNumbers && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {current} of {total} completed ({percentage}%)
          </span>
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full", sizeClasses[size])}>
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            colorClasses[color],
            sizeClasses[size],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
