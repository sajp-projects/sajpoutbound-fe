import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShipmentLogs } from "@/hooks/shipmentLog";
import { cn } from "@/lib/utils";
import { ShipmentLog } from "@/types/shipmentLog";
import { getActionLabel, getEntityTypeLabel } from "@/utils/badges";
import { formatDate, formatDateShort } from "@/utils/date";
import { buildDiffRows, prettifyField, stringifyValue } from "@/utils/shipment/shipmentLog";
import { getShipmentNumber, renderChanges } from "@/utils/shipment/shipmentUtils";
import { Link, useSearchParams } from "react-router";

export default function LogSemuaPengiriman() {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const {
    data = {
      logs: [],
      pagination: {
        total: 0,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    isLoading,
    isError,
    error,
    refetch,
  } = useShipmentLogs({
    refetchOnWindowFocus: false,
  });

  const logs = data.logs;
  const pagination = data.pagination;

  // Helper function to render changes table with diff rows
  const renderChangesWithDiff = (
    oldData: Record<string, unknown> | null,
    newData: Record<string, unknown> | null
  ) => {
    if (!oldData && !newData) return null;

    // Handle creation and deletion cases
    if ((!oldData && newData) || (oldData && !newData)) {
      return renderChanges(oldData, newData, prettifyField, stringifyValue);
    }

    // Handle updates with diff rows
    if (oldData && newData) {
      const rows = buildDiffRows(oldData, newData);
      if (rows.length === 0) return null;

      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-600">
            Perubahan:
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="font-medium bg-gray-50 w-[220px] border border-gray-200 p-1 text-left">
                    Field
                  </th>
                  <th className="px-2 py-1 font-medium text-left border border-gray-200">
                    Nilai Lama
                  </th>
                  <th className="px-2 py-1 font-medium text-left border border-gray-200">
                    Nilai Baru
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((change, idx) => (
                  <tr key={idx}>
                    <td className="font-medium bg-gray-50 w-[220px] border border-gray-200 p-1">
                      {prettifyField(change.field)}
                    </td>
                    <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                      {stringifyValue(change.oldValue)}
                    </td>
                    <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                      {stringifyValue(change.newValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">
          Log Aktivitas Pengiriman
        </h1>
      </div>

      {/* Main Content */}
      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Semua Aktivitas Pengiriman
            </h2>
            <p className="text-sm text-gray-500">
              Riwayat perubahan data pengiriman di sistem
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data log aktivitas..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data log aktivitas"
            message={
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan saat memuat data log aktivitas"
            }
            onRetry={() => refetch()}
          />
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="w-[50px] font-semibold text-gray-700 py-4">
                        No
                      </TableHead>
                      <TableHead className="py-4 font-semibold text-gray-700">
                        Waktu
                      </TableHead>
                      <TableHead className="py-4 font-semibold text-gray-700">
                        Pengiriman
                      </TableHead>
                      <TableHead className="py-4 font-semibold text-gray-700">
                        Aksi
                      </TableHead>
                      <TableHead className="py-4 font-semibold text-gray-700">
                        Dilakukan Oleh
                      </TableHead>
                      <TableHead className="py-4 font-semibold text-gray-700">
                        Deskripsi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <EmptyState
                            title="Tidak ada data log yang ditemukan."
                            message=""
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log: ShipmentLog, index: number) => (
                        <TableRow
                          key={log.id}
                          className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50")}
                        >
                          <TableCell className="font-medium text-center">
                            {index + 1 + (pagination.page - 1) * pagination.limit}
                          </TableCell>
                          <TableCell className="text-gray-700">
                            {formatDate(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            {log.shipment && (
                              <Link
                                to={`/pengiriman/${log.shipment.id}`}
                                className="font-medium text-blue-600 hover:underline whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                              >
                                {getShipmentNumber(log) || "No Number"}
                              </Link>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={cn(
                                  "rounded-md font-medium border",
                                  getActionLabel(log.action).color
                                )}
                              >
                                {getActionLabel(log.action).label}
                              </Badge>
                              <Badge
                                className={cn(
                                  "rounded-md font-medium border",
                                  getEntityTypeLabel(log.entityType).color
                                )}
                              >
                                {getEntityTypeLabel(log.entityType).label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-blue-600 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                {log.performedBy.name}
                              </span>
                              <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                {log.performedBy.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="overflow-hidden text-sm text-gray-700 line-clamp-2">
                              {log.description}
                            </p>
                            <div className="mt-2">
                              {(log.oldData || log.newData) && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                                    onClick={(e) => {
                                      e.currentTarget.nextElementSibling?.classList.toggle(
                                        "hidden"
                                      );
                                    }}
                                  >
                                    Lihat Detail
                                  </Button>
                                  <div className="hidden mt-2">
                                    {renderChangesWithDiff(log.oldData, log.newData)}
                                  </div>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 sm:hidden">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data log yang ditemukan." message="" />
                </div>
              ) : (
                logs.map((log: ShipmentLog) => (
                  <div
                    key={log.id}
                    className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            className={cn(
                              "rounded-md font-medium border",
                              getActionLabel(log.action).color
                            )}
                          >
                            {getActionLabel(log.action).label}
                          </Badge>
                          <Badge
                            className={cn(
                              "rounded-md font-medium border",
                              getEntityTypeLabel(log.entityType).color
                            )}
                          >
                            {getEntityTypeLabel(log.entityType).label}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateShort(log.createdAt)}
                        </span>
                      </div>

                      <div className="mb-2">
                        {log.shipment && (
                          <div className="mb-1">
                            <span className="text-sm font-medium">Pengiriman: </span>
                            <Link
                              to={`/pengiriman/${log.shipment.id}`}
                              className="max-w-full text-sm text-blue-600 truncate hover:underline"
                            >
                              {log.shipment.type === "ANTAR" ? "Antar" : "Jemput"} -{" "}
                              {getShipmentNumber(log) || "No Number"}
                            </Link>
                          </div>
                        )}
                        <p className="mb-1 overflow-hidden text-sm text-gray-700 line-clamp-2">
                          {log.description}
                        </p>
                        <div className="text-xs text-gray-500">
                          Dilakukan oleh:{" "}
                          <span className="max-w-full font-medium text-blue-600 truncate">
                            {log.performedBy.name}
                          </span>
                        </div>
                      </div>

                      {(log.oldData || log.newData) && (
                        <div className="pt-3 mt-3 border-t border-gray-100">
                          {renderChangesWithDiff(log.oldData, log.newData)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="mt-4">
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
