import { useSearchParams } from "react-router";
import { Download } from "lucide-react";

import { useArmadaLogs } from "@/hooks/armadaLog";
import { ArmadaLog } from "@/types/armadaLog";

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
import { Pagination } from "@/components/Pagination";
import { Link } from "react-router";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";

interface ActionLabel {
  label: string;
  color: string;
}

export default function LogSemuaArmada() {
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { data, isLoading } = useArmadaLogs({
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

  const getArmadaName = (log: ArmadaLog) => {
    if (log.armada) {
      return log.armada.model;
    } else if (log.newData && log.newData.model) {
      return log.newData.model as string;
    } else if (log.oldData && log.oldData.model) {
      return log.oldData.model as string;
    }
    return "Armada tidak diketahui";
  };

  const getActionLabel = (action: string): ActionLabel => {
    const labels: Record<string, ActionLabel> = {
      CREATE: {
        label: "Dibuat",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      UPDATE: {
        label: "Diperbarui",
        color: "bg-amber-100 text-amber-800 border-amber-200",
      },
      DELETE: {
        label: "Dihapus",
        color: "bg-red-100 text-red-800 border-red-200",
      },
      RESTORE: {
        label: "Dipulihkan",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
    };

    return (
      labels[action] || {
        label: action,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    );
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
            Data armada yang dibuat:
          </div>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Model
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.model as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  ID SL
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.id_sl as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Plat Nomor
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.plateNumber as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Deskripsi
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.description as string}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (oldData && !newData) {
      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-700">
            Data armada yang dihapus:
          </div>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Model
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.model as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  ID SL
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.id_sl as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Plat Nomor
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.plateNumber as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Deskripsi
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.description as string}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (oldData && newData) {
      const changes = [];

      if (oldData.model !== newData.model) {
        changes.push({
          field: "Model",
          oldValue: oldData.model as string,
          newValue: newData.model as string,
        });
      }

      if (oldData.id_sl !== newData.id_sl) {
        changes.push({
          field: "ID SL",
          oldValue: oldData.id_sl as string,
          newValue: newData.id_sl as string,
        });
      }

      if (oldData.plateNumber !== newData.plateNumber) {
        changes.push({
          field: "Plat Nomor",
          oldValue: oldData.plateNumber as string,
          newValue: newData.plateNumber as string,
        });
      }

      if (oldData.description !== newData.description) {
        changes.push({
          field: "Deskripsi",
          oldValue: oldData.description as string,
          newValue: newData.description as string,
        });
      }

      if (changes.length === 0) return null;

      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-700">
            Perubahan:
          </div>
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
                    {change.oldValue}
                  </td>
                  <td className="px-2 py-1 border border-gray-200">
                    {change.newValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  const renderLogTable = () => (
    <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
      <div className="overflow-x-auto">
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
                Armada
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
              logs.map((log: ArmadaLog, index: number) => (
                <TableRow
                  key={log.id}
                  className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50")}
                >
                  <TableCell className="font-medium text-center">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <div className="truncate-text" title={formatDate(log.createdAt)}>
                      {formatDate(log.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.armada ? (
                      <Link
                        to={`/armada/${log.armada.id}`}
                        className="font-medium text-blue-600 hover:underline truncate-text block"
                        title={log.armada.model}
                      >
                        {log.armada.model}
                      </Link>
                    ) : (
                      <span className="text-gray-700 truncate-text" title={getArmadaName(log)}>
                        {getArmadaName(log)}
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
                      <span className="font-medium text-blue-600 truncate-text" title={log.performedBy.name}>
                        {log.performedBy.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate-text" title={log.performedBy.email}>
                        {log.performedBy.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p
                      className="text-sm text-gray-700 truncate-text-2"
                      title={log.description}
                    >
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
        logs.map((log: ArmadaLog) => (
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
                <div className="mb-1">
                  <span className="text-sm font-medium">Armada: </span>
                  {log.armada ? (
                    <Link
                      to={`/armada/${log.armada.id}`}
                      className="text-sm text-blue-600 hover:underline truncate-text inline-block max-w-[150px] align-bottom"
                      title={log.armada.model}
                    >
                      {log.armada.model}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-700 truncate-text" title={getArmadaName(log)}>
                      {getArmadaName(log)}
                    </span>
                  )}
                </div>
                <p className="mb-1 text-sm text-gray-700 truncate-text-2" title={log.description}>
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
  );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">
          Log Aktivitas Armada
        </h1>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Semua Aktivitas Armada
            </h2>
            <p className="text-sm text-gray-500">
              Riwayat perubahan data armada di sistem
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
