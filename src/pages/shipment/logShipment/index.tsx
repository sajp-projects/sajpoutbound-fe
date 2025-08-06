import { useShipmentLogsByShipmentId } from "@/hooks/shipmentLog";
import { ArrowLeft } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

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
import { useShipment } from "@/hooks/shipment";
import { cn } from "@/lib/utils";
import { ShipmentItem } from "@/types/shipment";
import { getActionLabel } from "@/utils/badges";
import { formatDate, formatDateShort } from "@/utils/date";

export default function LogPengiriman() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const shipmentId = id || "";

  const { data: shipmentData, isLoading: shipmentLoading } = useShipment(
    { id: shipmentId },
    {
      enabled: !!shipmentId,
    }
  );

  const {
    data: logData,
    isLoading,
    isError,
    error,
    refetch,
  } = useShipmentLogsByShipmentId(
    { shipmentId: shipmentId },
    {
      enabled: !!shipmentId,
      refetchOnWindowFocus: false,
    }
  );

  const logs = logData?.logs || [];
  const pagination = logData?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "SHIPMENT":
        return {
          label: "Pengiriman",
          color: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "SHIPMENT_ITEM":
        return {
          label: "Item Pengiriman",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        };
      default:
        return {
          label: entityType,
          color: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const renderChanges = (
    oldData: Record<string, unknown> | null,
    newData: Record<string, unknown> | null
  ) => {
    if (!oldData && !newData) return null;

    if (newData && !oldData) {
      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-700">
            Data pengiriman yang dibuat:
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <tbody>
                {Object.entries(newData).map(([key, value]) => {
                  if (typeof value === "object" || Array.isArray(value))
                    return null;
                  return (
                    <tr key={key}>
                      <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                        {key}
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        {String(value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (oldData && !newData) {
      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-700">
            Data pengiriman yang dihapus:
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <tbody>
                {Object.entries(oldData).map(([key, value]) => {
                  if (typeof value === "object" || Array.isArray(value))
                    return null;
                  return (
                    <tr key={key}>
                      <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                        {key}
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        {String(value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (oldData && newData) {
      const changes: {
        field: string;
        oldValue: unknown;
        newValue: unknown;
      }[] = [];

      Object.keys(newData).forEach((key) => {
        if (
          JSON.stringify(oldData[key]) !== JSON.stringify(newData[key]) &&
          oldData[key] !== undefined
        ) {
          changes.push({
            field: key,
            oldValue: oldData[key],
            newValue: newData[key],
          });
        }
      });

      if (changes.length === 0) return null;

      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-700">
            Perubahan:
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-1 font-medium text-left border border-gray-200">
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
                {changes.map((change, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 font-medium border border-gray-200">
                      {change.field}
                    </td>
                    <td className="px-2 py-1 border border-gray-200">
                      {typeof change.oldValue === "object"
                        ? JSON.stringify(change.oldValue)
                        : String(change.oldValue || "")}
                    </td>
                    <td className="px-2 py-1 border border-gray-200">
                      {typeof change.newValue === "object"
                        ? JSON.stringify(change.newValue)
                        : String(change.newValue || "")}
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

  const LogList = () => (
    <>
      <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
        <div className="overflow-auto overflow-x-auto">
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    <EmptyState
                      title="Tidak ada data log yang ditemukan."
                      message=""
                    />
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => (
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
                        <span className="font-medium text-blue-600">
                          {log.performedBy.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {log.performedBy.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {log.description}
                      </p>
                      {(log.oldData || log.newData) && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                            onClick={(e) =>
                              e.currentTarget.nextElementSibling?.classList.toggle(
                                "hidden"
                              )
                            }
                          >
                            Lihat Detail
                          </Button>
                          <div className="hidden mt-2">
                            {renderChanges(log.oldData, log.newData)}
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-4 sm:hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
            <EmptyState title="Tidak ada data log yang ditemukan." message="" />
          </div>
        ) : (
          logs.map((log) => (
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

                <div className="mb-3">
                  <p className="mb-1 text-sm text-gray-700">
                    {log.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    Dilakukan oleh:{" "}
                    <span className="font-medium text-blue-600">
                      {log.performedBy.name}
                    </span>
                  </div>
                </div>

                {(log.oldData || log.newData) && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    {renderChanges(log.oldData, log.newData)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {logData && (
        <Pagination
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      )}
    </>
  );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center mb-4">
        <Link to={`/pengiriman/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Log Aktivitas Pengiriman
        </h1>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        {shipmentLoading ? (
          <LoadingState text="Memuat data pengiriman..." height="h-20" />
        ) : !shipmentData ? (
          <div className="p-4 mb-6 rounded-md bg-amber-50">
            <p className="font-medium text-amber-600">
              Peringatan: ID pengiriman tidak ditemukan
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900">
                Log Aktivitas:{" "}
                {shipmentData.type === "ANTAR" ? (
                  <Link
                    to={`/armada/${shipmentData.armadaId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {shipmentData.armada?.plateNumber || "N/A"}
                  </Link>
                ) : (
                  shipmentData.plateNumber
                )}
                ({shipmentData.type === "ANTAR" ? "Antar" : "Jemput"})
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium">Nomor Pengiriman:</span>{" "}
                {shipmentData.shipmentNumber}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                {shipmentData.status}
              </p>
              {Array.isArray(shipmentData.shipmentItems) &&
                shipmentData.shipmentItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {shipmentData.shipmentItems.map((item: ShipmentItem) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 rounded-md font-medium text-xs",
                          "bg-blue-50 text-blue-600 border-blue-200"
                        )}
                      >
                        {item.product?.name || "Item"} ({item.requestedQuantity}{" "}
                        {item.product?.satuan || "unit"})
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingState text="Memuat data log..." />
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
          <LogList />
        )}
      </div>
    </div>
  );
}
