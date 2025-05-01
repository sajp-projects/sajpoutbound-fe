import { Search } from 'lucide-react';

/**
 * Empty state component for permission page
 */
export const EmptyState = () => (
  <div className="bg-white border border-gray-200 rounded-lg py-8">
    <div className="flex flex-col items-center justify-center text-muted-foreground">
      <Search className="h-10 w-10 mb-2 text-gray-300" />
      <p className="text-gray-500">Tidak ada data izin yang ditemukan.</p>
      <p className="text-sm text-gray-400">
        Coba gunakan kata kunci pencarian yang berbeda.
      </p>
    </div>
  </div>
);

export default EmptyState;
