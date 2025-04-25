import { Button } from "@/components/ui/button";
import { getPageRange } from "@/utils/pagination";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback } from "react";
import { useSearchParams } from "react-router";

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function Pagination({ totalItems, itemsPerPage, currentPage, totalPages, hasNext, hasPrev }: PaginationProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Fungsi untuk mengubah halaman dengan aman
  const handlePageChange = useCallback(
    (page: number) => {
      // Kloning semua parameter yang ada untuk menghindari kehilangan data
      const newParams = new URLSearchParams(searchParams);

      // Pastikan parameter seperti roleId tetap ada saat pindah halaman
      newParams.set("page", page.toString());

      // Menggunakan { replace: false } untuk memastikan halaman ditambahkan ke history
      setSearchParams(newParams, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  // Jika tidak ada items, jangan tampilkan pagination
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t border-gray-200 mt-4 gap-4">
      <div className="text-sm text-gray-500 text-center sm:text-left">
        Menampilkan <strong className="text-gray-700">{Math.min(itemsPerPage, totalItems)}</strong> dari <strong className="text-gray-700">{totalItems}</strong> item
      </div>

      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={!hasPrev} className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-2 sm:px-3">
          <ArrowLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <div className="flex items-center gap-1 overflow-x-auto py-1 px-1 max-w-[200px] sm:max-w-none">
          {getPageRange(currentPage, totalPages).map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="px-2">
                ...
              </span>
            ) : (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => typeof page === "number" && handlePageChange(page)}
                className={cn("h-8 w-8 p-0 sm:h-8 sm:w-8", currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={!hasNext} className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-2 sm:px-3">
          <span className="hidden sm:inline">Selanjutnya</span>
          <ArrowRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
}
