import { useSearchParams } from "react-router";

import { useAllUserLogs } from "@/hooks/userLog";

import { EmptyState } from "@/components/EmptyState";
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
import { cn } from "@/lib/utils";
import { getActionLabel } from "@/utils/badges";
import { formatDate, formatDateShort } from "@/utils/date";
import { Link } from "react-router";

interface UserLog {
  id: string;
  createdAt: string;
  action: string;
  description: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  performedBy: {
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export default function LogSemuaPengguna() {
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { data, isLoading } = useAllUserLogs({
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
          <div className="text-xs font-medium text-gray-600 mb-1">
            Data pengguna yang dibuat:
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                    Nama
                  </td>
                  <td className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full border border-gray-200 p-1">
                    {newData.name as string}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                    Email
                  </td>
                  <td className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full border border-gray-200 p-1">
                    {newData.email as string}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                    Peran
                  </td>
                  <td className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full border border-gray-200 p-1">
                    {newData.roleId as string}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                    Gudang
                  </td>
                  <td className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full border border-gray-200 p-1">
                    {newData.warehouseId as string}
                  </td>
                </tr>
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
          <div className="text-xs font-medium text-gray-600 mb-1">
            {isRestore
              ? "Pengguna dipulihkan:"
              : "Data pengguna yang diarsipkan:"}
          </div>
          {oldData && (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  <tr>
                    <td className="font-medium bg-gray-50 w-[120px] border border-gray-200 p-1">
                      Status
                    </td>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full border border-gray-200 p-1">
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

      if (oldData.name !== newData.name) {
        changes.push({
          field: "Nama",
          oldValue: oldData.name as string,
          newValue: newData.name as string,
        });
      }

      if (oldData.email !== newData.email) {
        changes.push({
          field: "Email",
          oldValue: oldData.email as string,
          newValue: newData.email as string,
        });
      }

      if (oldData.roleId !== newData.roleId) {
        changes.push({
          field: "Peran",
          oldValue: oldData.roleId as string,
          newValue: newData.roleId as string,
        });
      }

      if (oldData.warehouseId !== newData.warehouseId) {
        const oldWarehouseId = oldData.warehouseId
          ? (oldData.warehouseId as string)
          : "-";
        const newWarehouseId = newData.warehouseId
          ? (newData.warehouseId as string)
          : "-";

        changes.push({
          field: "Gudang",
          oldValue: oldWarehouseId,
          newValue: newWarehouseId,
        });
      }

      if (changes.length === 0) return null;

      return (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">
            Perubahan:
          </div>
          <div className="overflow-x-auto w-full">
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
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full border border-gray-200 p-1">
                      {change.oldValue}
                    </td>
                    <td className="whitespace-nowrap overflow-hidden text-ellipsis max-w-full border border-gray-200 p-1">
                      {change.newValue}
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

  const renderLogTable = () => (
    <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
      <div className="overflow-x-auto w-full">
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
                Pengguna
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
              logs.map((log: UserLog, index: number) => (
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
                    {log.user && (
                      <Link
                        to={`/pengguna/${log.user.id}`}
                        className="font-medium text-blue-600 hover:underline whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                      >
                        {log.user.name}
                      </Link>
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
                    <p className="text-sm text-gray-700 line-clamp-2 overflow-hidden">
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
        logs.map((log: UserLog) => (
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
                {log.user && (
                  <div className="mb-1">
                    <span className="text-sm font-medium">Pengguna: </span>
                    <Link
                      to={`/pengguna/${log.user.id}`}
                      className="text-sm text-blue-600 hover:underline truncate max-w-full"
                    >
                      {log.user.name}
                    </Link>
                  </div>
                )}
                <p className="mb-1 text-sm text-gray-700 line-clamp-2 overflow-hidden">
                  {log.description}
                </p>
                <div className="text-xs text-gray-500">
                  Dilakukan oleh:{" "}
                  <span className="font-medium text-blue-600 truncate max-w-full">
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
          Log Aktivitas Pengguna
        </h1>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Semua Aktivitas Pengguna
            </h2>
            <p className="text-sm text-gray-500">
              Riwayat perubahan data pengguna di sistem
            </p>
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
