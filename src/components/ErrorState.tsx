import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryButtonText?: string;
  height?: string;
}

export function ErrorState({
  title = "Gagal memuat data",
  message = "Terjadi kesalahan pada server",
  onRetry,
  retryButtonText = "Coba lagi",
  height = "h-60",
}: ErrorStateProps) {
  return (
    <div className={`flex justify-center items-center ${height}`}>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <p className="mt-4 text-lg font-medium text-red-600">{title}</p>
        <p className="max-w-md mt-2 text-sm text-gray-600">{message}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-4 cursor-pointer"
          >
            {retryButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
