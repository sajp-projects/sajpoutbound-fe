import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOperationalReportTable } from "@/hooks/report";
import { cn } from "@/lib/utils";
import {
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_TYPE_LABELS,
} from "@/utils/constants";
import { formatNumber } from "@/utils/formatNumber";
import { useEffect, useState } from "react";

interface DataOperasionalTableProps {
  startDate: string;
  endDate: string;
  status: string;
  shipmentType: "ALL" | "ANTAR" | "JEMPUT";
}

export default function DataOperasionalTable({
  startDate,
  endDate,
  status,
  shipmentType,
}: DataOperasionalTableProps) {
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, status, shipmentType]);

  const { data, isLoading, isError, error } = useOperationalReportTable(
    {
      startDate,
      endDate,
      status: status === "ALL" ? undefined : status,
      type: shipmentType === "ALL" ? undefined : shipmentType,
      page,
      limit: 5,
    },
    {
      enabled: !!startDate && !!endDate,
    }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROSES":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SELESAI":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
          Error: {error?.message || "Terjadi kesalahan"}
        </p>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden overflow-hidden w-full rounded-lg border border-gray-200 sm:block">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[5%] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                  No.
                </TableHead>
                <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                  Nomor Pengiriman
                </TableHead>
                <TableHead className="w-[15%] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                  Tipe
                </TableHead>
                <TableHead className="w-[15%] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                  Status
                </TableHead>
                <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                  Plat Nomor
                </TableHead>
                <TableHead className="w-[15%] py-3 px-3 text-right font-semibold text-gray-700 text-sm">
                  <div className="truncate" title="Total Barang">
                    Total Barang
                  </div>
                </TableHead>
                <TableHead className="w-[20%] py-3 px-3 text-right font-semibold text-gray-700 text-sm">
                  Total Berat
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    index % 2 === 0 ? "bg-white" : "bg-gray-50",
                    "border-b border-gray-200 last:border-b-0 h-12"
                  )}
                >
                  <TableCell className="py-2.5 px-3 font-medium text-center text-sm align-middle">
                    {(page - 1) * 5 + index + 1}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-gray-600 text-sm align-middle">
                    <div className="wrap-text" title={row.shipmentNumber}>
                      {row.shipmentNumber}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-center text-gray-600 text-sm align-middle">
                    {SHIPMENT_TYPE_LABELS[row.type]}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-center text-gray-600 text-sm align-middle">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 rounded-md font-medium text-xs",
                        getStatusColor(row.status)
                      )}
                    >
                      {SHIPMENT_STATUS_LABELS[row.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-gray-600 text-sm align-middle">
                    {row.plateNumber}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-gray-600 text-sm align-middle">
                    {formatNumber(row.totalItems)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right text-gray-600 text-sm align-middle">
                    <div
                      className="truncate"
                      title={
                        row.totalWeight !== 0
                          ? `${formatNumber(row.totalWeight)} kg`
                          : "Belum ditimbang"
                      }
                    >
                      {row.totalWeight !== 0
                        ? `${formatNumber(row.totalWeight)} kg`
                        : "Belum ditimbang"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block sm:hidden">
        <div className="space-y-3">
          {data.data.map((row) => (
            <div key={row.id} className="p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">
                    {row.shipmentNumber}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium px-2.5 py-0.5",
                    getStatusColor(row.status)
                  )}
                >
                  {SHIPMENT_STATUS_LABELS[row.status]}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Tipe: </span>
                  {SHIPMENT_TYPE_LABELS[row.type]}
                </div>
                <div>
                  <span className="font-medium">Plat Nomor: </span>
                  {row.plateNumber}
                </div>
                <div>
                  <span className="font-medium">Total Barang: </span>
                  {formatNumber(row.totalItems)}
                </div>
                <div>
                  <span className="font-medium">Total Berat: </span>
                  {formatNumber(row.totalWeight)} kg
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {data.pagination && (
        <div className="flex flex-wrap w-full sm:w-auto items-center gap-2 gap-y-2 justify-start sm:justify-end">
          <button
            className="px-3 border-gray-300 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.pagination.hasPrev}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Halaman {data.pagination.page} / {data.pagination.totalPages}
          </span>
          <button
            className="px-3 border-gray-300 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() =>
              setPage((p) => (data.pagination.hasNext ? p + 1 : p))
            }
            disabled={!data.pagination.hasNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
