import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  onRetry: () => void;
}

/**
 * Error state component for permission page
 */
export const ErrorState = ({ onRetry }: ErrorStateProps) => (
  <div className="flex justify-center items-center h-60">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
      <p className="mt-4 text-red-600 font-medium">Gagal memuat data izin</p>
      <p className="text-sm text-gray-400">Terjadi kesalahan pada server</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
        Coba lagi
      </Button>
    </div>
  </div>
);

export default ErrorState;
