import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryButtonText?: string;
  height?: string;
}

export function ErrorState({ title = "Gagal memuat data", message = "Terjadi kesalahan pada server", onRetry, retryButtonText = "Coba lagi", height = "h-60" }: ErrorStateProps) {
  return (
    <div className={`flex justify-center items-center ${height}`}>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-red-200 rounded-full border-t-red-600 animate-spin"></div>
        <p className="mt-4 font-medium text-red-600">{title}</p>
        <p className="text-sm text-gray-400">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-4 cursor-pointer">
            {retryButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
