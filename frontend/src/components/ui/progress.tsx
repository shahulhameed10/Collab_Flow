import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export const Progress = ({ value, className, ...props }: ProgressProps) => {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700", className)} {...props}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};
