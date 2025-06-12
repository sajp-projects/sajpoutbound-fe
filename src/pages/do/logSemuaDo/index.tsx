import { useSearchParams } from "react-router";
import { Download } from "lucide-react";

import { useDeliveryOrderLogs } from "@/hooks/doLog";

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
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { formatNumber } from "@/utils/formatNumber";
import { Pagination } from "@/components/Pagination";
import { Link } from "react-router";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { DeliveryOrderLog } from "@/types/doLog";
import { getActionLabel } from "@/utils/badges";

export default function LogSemuaDo() {
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { data, isLoading } = useDeliveryOrderLogs({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const renderChanges = (
    oldData: Record<string, unknown> | null,
    newData: Record<string, unknown> | null
  ) => {
    if (!oldData && !newData) return null;

    if (newData && !oldData) {
      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-600">
            Data delivery order yang dibuat:
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                    No. DO
                  </td>
                  <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                    {newData.doNumber as string}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                    Pelanggan
                  </td>
                  <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                    {newData.customerName as string}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                    Alamat
                  </td>
                  <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                    {newData.address as string}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                    Catatan Internal
                  </td>
                  <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                    {newData.internalNote as string}
                  </td>
                </tr>
                {typeof newData.items !== "undefined" &&
                  Array.isArray(newData.items) && (
                    <tr>
                      <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                        Item
                      </td>
                      <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                        <ul className="pl-2 list-inside">
                          {(
                            newData.items as {
                              productName: string;
                              quantity: number;
                            }[]
                          ).map((item, idx) => (
                            <li key={idx}>
                              {item.productName}: {formatNumber(item.quantity)}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (
      (oldData && !newData) ||
      (oldData && newData && oldData.deletedAt !== newData.deletedAt)
    ) {
      const isRestore = newData?.deletedAt === null;
      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-600">
            {isRestore
              ? "Delivery Order dipulihkan:"
              : "Data delivery order yang diarsipkan:"}
          </div>
          {oldData && (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr>
                    <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                      No. DO
                    </td>
                    <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                      {oldData.doNumber as string}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                      Status
                    </td>
                    <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                      {isRestore ? "Dipulihkan" : "Diarsipkan"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (oldData && newData) {
      const changes = [];

      if (oldData.doNumber !== newData.doNumber) {
        changes.push({
          field: "No. DO",
          oldValue: oldData.doNumber as string,
          newValue: newData.doNumber as string,
        });
      }

      if (oldData.customerName !== newData.customerName) {
        changes.push({
          field: "Pelanggan",
          oldValue: oldData.customerName as string,
          newValue: newData.customerName as string,
        });
      }

      if (oldData.address !== newData.address) {
        changes.push({
          field: "Alamat",
          oldValue: oldData.address as string,
          newValue: newData.address as string,
        });
      }

      if (oldData.internalNote !== newData.internalNote) {
        changes.push({
          field: "Catatan Internal",
          oldValue: oldData.internalNote as string,
          newValue: newData.internalNote as string,
        });
      }

      // Compare items if they exist
      if (
        oldData.items &&
        newData.items &&
        Array.isArray(oldData.items) &&
        Array.isArray(newData.items)
      ) {
        changes.push({
          field: "Item",
          oldValue: "Lihat detail perubahan item",
          newValue: "Lihat detail perubahan item",
          items: {
            old: oldData.items,
            new: newData.items,
          },
        });
      }

      if (changes.length === 0) return null;

      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-600">
            Perubahan:
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
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
                    <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                      {change.field}
                    </td>
                    <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                      {change.field === "Item" &&
                      "items" in change &&
                      change.items ? (
                        <ul className="pl-2 list-inside">
                          {(
                            change.items.old as {
                              productName: string;
                              quantity: number;
                            }[]
                          ).map((item, idx) => (
                            <li key={idx}>
                              {item.productName}: {formatNumber(item.quantity)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        change.oldValue
                      )}
                    </td>
                    <td className="max-w-full p-1 overflow-hidden border border-gray-200 whitespace-nowrap text-ellipsis">
                      {change.field === "Item" &&
                      "items" in change &&
                      change.items ? (
                        <ul className="pl-2 list-inside">
                          {(
                            change.items.new as {
                              productName: string;
                              quantity: number;
                            }[]
                          ).map((item, idx) => (
                            <li key={idx}>
                              {item.productName}: {formatNumber(item.quantity)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        change.newValue
                      )}
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

  const getDoNumber = (log: DeliveryOrderLog): string => {
    if (
      log.newData &&
      typeof log.newData === "object" &&
      "doNumber" in log.newData
    ) {
      return String(log.newData.doNumber || "");
    }
    if (
      log.oldData &&
      typeof log.oldData === "object" &&
      "doNumber" in log.oldData
    ) {
      return String(log.oldData.doNumber || "");
    }
    return "";
  };

  const getCustomerName = (log: DeliveryOrderLog): string => {
    if (log.deliveryOrder) {
      return log.deliveryOrder.customer.name;
    }
    if (
      log.newData &&
      typeof log.newData === "object" &&
      "customerName" in log.newData
    ) {
      return String(log.newData.customerName || "");
    }
    if (
      log.oldData &&
      typeof log.oldData === "object" &&
      "customerName" in log.oldData
    ) {
      return String(log.oldData.customerName || "");
    }
    return "";
  };

  const renderLogTable = () => (
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
                No. DO
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Pelanggan
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
              logs.map((log: DeliveryOrderLog, index: number) => (
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
                    {getDoNumber(log) && (
                      <span className="font-medium text-gray-700">
                        {getDoNumber(log)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.deliveryOrder ? (
                      <Link
                        to={`/do/${log.deliveryOrder.id}`}
                        className="font-medium text-blue-600 hover:underline whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                      >
                        {log.deliveryOrder.customer.name}
                      </Link>
                    ) : (
                      <span className="text-gray-700">
                        {getCustomerName(log)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-md font-medium border",
                        getActionLabel(log.action).color
                      )}
                    >
                      {getActionLabel(log.action).label}
                    </Badge>
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
                            {renderChanges(log.oldData, log.newData)}
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
  );

  const renderLogCards = () => (
    <div className="space-y-4 sm:hidden">
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
          <EmptyState title="Tidak ada data log yang ditemukan." message="" />
        </div>
      ) : (
        logs.map((log: DeliveryOrderLog) => (
          <div
            key={log.id}
            className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Badge
                  className={cn(
                    "rounded-md font-medium border",
                    getActionLabel(log.action).color
                  )}
                >
                  {getActionLabel(log.action).label}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDateShort(log.createdAt)}
                </span>
              </div>

              <div className="mb-2">
                {getDoNumber(log) && (
                  <div className="mb-1">
                    <span className="text-sm font-medium">No. DO: </span>
                    <span className="text-sm text-gray-700">
                      {getDoNumber(log)}
                    </span>
                  </div>
                )}
                {getCustomerName(log) && (
                  <div className="mb-1">
                    <span className="text-sm font-medium">Pelanggan: </span>
                    {log.deliveryOrder ? (
                      <Link
                        to={`/do/${log.deliveryOrder.id}`}
                        className="max-w-full text-sm text-blue-600 truncate hover:underline"
                      >
                        {log.deliveryOrder.customer.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-700">
                        {getCustomerName(log)}
                      </span>
                    )}
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
                  {renderChanges(log.oldData, log.newData)}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">
          Log Aktivitas Delivery Order
        </h1>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Semua Aktivitas Delivery Order
            </h2>
            <p className="text-sm text-gray-500">
              Riwayat perubahan data delivery order di sistem
            </p>
          </div>
          <div className="flex flex-wrap items-center w-full gap-3 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-9 min-w-[100px] bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm flex items-center px-3"
            >
              <Download className="w-3 h-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data log..." />
        ) : (
          <div>
            {renderLogTable()}
            {renderLogCards()}
            {data && (
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
