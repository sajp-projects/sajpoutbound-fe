import { Button } from "@/components/ui/button";
import { getPageRange } from "@/utils/pagination";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
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

  function pindahHalaman(halaman: number) {
    setSearchParams({ ...Object.fromEntries(searchParams), page: halaman.toString() });
  }

  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t border-gray-200 mt-4 gap-4">
      <div className="text-sm text-gray-500 text-center sm:text-left">
        Menampilkan <strong>{Math.min(itemsPerPage, totalItems)}</strong> dari <strong>{totalItems}</strong> item
      </div>

      <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => pindahHalaman(currentPage - 1)} disabled={!hasPrev} className="h-8 px-2">
          <ArrowLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
          {getPageRange(currentPage, totalPages).map((halaman, idx) =>
            halaman === "..." ? (
              <span key={`titik-${idx}`} className="px-2">
                ...
              </span>
            ) : (
              <Button
                key={`halaman-${halaman}`}
                variant={currentPage === halaman ? "default" : "outline"}
                size="sm"
                onClick={() => typeof halaman === "number" && pindahHalaman(halaman)}
                className={cn("h-8 w-8 p-0", currentPage === halaman && "bg-blue-600 text-white")}
              >
                {halaman}
              </Button>
            )
          )}
        </div>

        <Button variant="outline" size="sm" onClick={() => pindahHalaman(currentPage + 1)} disabled={!hasNext} className="h-8 px-2">
          <span className="hidden sm:inline">Selanjutnya</span>
          <ArrowRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
}
