import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShipmentAssignmentReport } from "@/hooks/laporan";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ShipmentAssignmentTablePaginatedProps {
  startDate: string;
  endDate: string;
}

export default function ShipmentAssignmentTablePaginated({
  startDate,
  endDate,
}: ShipmentAssignmentTablePaginatedProps) {
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const { data, isLoading, isError, error } = useShipmentAssignmentReport(
    {
      startDate,
      endDate,
      page,
      limit: 5,
    },
    {
      enabled: !!startDate && !!endDate,
    }
  );

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">
          Error: {error instanceof Error ? error.message : "Terjadi kesalahan"}
        </p>
      </div>
    );
  }

  if (!data?.report?.data || data.report.data.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        Tidak ada data penugasan pengiriman
      </div>
    );
  }

  const shipmentData = data.report.data;
  const pagination = data.pagination;

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                No.
              </TableHead>
              <TableHead className="py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                Plat Armada
              </TableHead>
              <TableHead className="py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                Model Armada
              </TableHead>
              <TableHead className="py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                Total Penugasan
              </TableHead>
              <TableHead className="py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                PENDING
              </TableHead>
              <TableHead className="py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                PROSES
              </TableHead>
              <TableHead className="py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                SELESAI
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipmentData.map((row, idx) => (
              <TableRow
                key={row.armada?.id || idx}
                className={cn(
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                  "border-b border-gray-200 last:border-b-0 h-12"
                )}
              >
                <TableCell className="py-2.5 px-3 text-sm text-left align-middle font-medium">
                  {(page - 1) * 5 + idx + 1}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-sm text-left align-middle">
                  {row.armada?.plateNumber || "-"}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-sm text-left align-middle">
                  {row.armada?.model || "-"}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-sm text-center align-middle">
                  {row.summary?.total ?? 0}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-sm text-center align-middle">
                  {row.summary?.PENDING ?? 0}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-sm text-center align-middle">
                  {row.summary?.PROSES ?? 0}
                </TableCell>
                <TableCell className="py-2.5 px-3 text-sm text-center align-middle">
                  {row.summary?.SELESAI ?? 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-wrap w-full sm:w-auto items-center gap-2 gap-y-2 justify-start sm:justify-end">
          <button
            className="px-3 border-gray-300 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Halaman {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className="px-3 border-gray-300 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => (pagination.hasNext ? p + 1 : p))}
            disabled={!pagination.hasNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
