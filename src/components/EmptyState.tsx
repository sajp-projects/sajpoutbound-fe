import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function EmptyState({
  icon = <Search className="w-10 h-10 text-gray-300" />,
  title = "Tidak ada data yang ditemukan",
  message = "Coba gunakan kata kunci pencarian yang berbeda",
  action,
  className,
  containerClassName,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 text-center text-gray-500-foreground", containerClassName)}>
      <div className="mb-2">{icon}</div>
      <p className={cn("text-gray-500", className)}>{title}</p>
      <p className={cn("text-sm text-gray-400 mt-2", className)}>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
