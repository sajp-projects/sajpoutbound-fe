import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  light?: boolean;
}

export function LoadingSpinner({
  size = "md",
  className,
  light = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = light
    ? "border-white border-t-transparent"
    : "border-blue-200 border-t-blue-600";

  return (
    <div
      className={cn(
        "border-2 rounded-full animate-spin",
        sizeClasses[size],
        colorClasses,
        className
      )}
    />
  );
}
