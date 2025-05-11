import { Search } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = <Search className="w-10 h-10 text-gray-300" />,
  title = "Tidak ada data yang ditemukan",
  message = "Coba gunakan kata kunci pencarian yang berbeda",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <div className="mb-2">{icon}</div>
      <p className="text-gray-500">{title}</p>
      <p className="text-sm text-gray-400">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
