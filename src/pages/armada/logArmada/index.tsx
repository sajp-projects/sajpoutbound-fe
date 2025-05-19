import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import { useArmadaLogsByArmadaId } from "@/hooks/armadaLog";
import { useArmada } from "@/hooks/armada";

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
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { getActionLabel } from "@/utils/badges";

export default function LogArmada() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const armadaId = id || "";

  const { data: armadaData, isLoading: armadaLoading } = useArmada(
    { id: armadaId },
    {
      enabled: !!armadaId,
    }
  );

  const { data, isLoading } = useArmadaLogsByArmadaId(armadaId, {
    enabled: !!armadaId,
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

  const getEntityTypeLabel = (entityType: string) => {
    const labels = {
      ARMADA: {
        label: "Armada",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      },
    };
    return (
      labels[entityType as keyof typeof labels] || {
        label: entityType,
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
          <div className="log-detail-header">Data armada yang dibuat:</div>
          <div className="log-detail-container">
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="log-detail-label">Model</td>
                  <td className="log-detail-value">
                    {newData.model as string}
                  </td>
                </tr>
                <tr>
                  <td className="log-detail-label">ID</td>
                  <td className="log-detail-value">
                    {newData.id_sl as string}
                  </td>
                </tr>
                <tr>
                  <td className="log-detail-label">Plat Nomor</td>
                  <td className="log-detail-value">
                    {newData.plateNumber as string}
                  </td>
                </tr>
                <tr>
                  <td className="log-detail-label">Deskripsi</td>
                  <td className="log-detail-value">
                    {newData.description as string}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Untuk penghapusan data
    if (oldData && !newData) {
      return (
        <div>
          <div className="log-detail-header">Data armada yang dihapus:</div>
          <div className="log-detail-container">
            <table className="w-full text-xs border-collapse">
              <tbody>
                <tr>
                  <td className="log-detail-label">Model</td>
                  <td className="log-detail-value">
                    {oldData.model as string}
                  </td>
                </tr>
                <tr>
                  <td className="log-detail-label">ID</td>
                  <td className="log-detail-value">
                    {oldData.id_sl as string}
                  </td>
                </tr>
                <tr>
                  <td className="log-detail-label">Plat Nomor</td>
                  <td className="log-detail-value">
                    {oldData.plateNumber as string}
                  </td>
                </tr>
                <tr>
                  <td className="log-detail-label">Deskripsi</td>
                  <td className="log-detail-value">
                    {oldData.description as string}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Untuk pembaruan data
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
          field: "ID",
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
          <div className="log-detail-header">Perubahan:</div>
          <div className="log-detail-container">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="log-detail-label">Field</th>
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
                    <td className="log-detail-label">{change.field}</td>
                    <td className="log-detail-value">{change.oldValue}</td>
                    <td className="log-detail-value">{change.newValue}</td>
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
      {/* Tabel Desktop */}
      <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
        <div className="log-table-container">
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
                        <span className="font-medium text-blue-600 log-table-cell">
                          {log.performedBy.name}
                        </span>
                        <span className="text-xs text-gray-500 log-table-cell">
                          {log.performedBy.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-700 truncate-text-2">
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

      {/* Mobile Card View */}
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

                <div className="mb-2">
                  <p className="mb-1 text-sm text-gray-700 truncate-text-2">
                    {log.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    Dilakukan oleh:{" "}
                    <span className="font-medium text-blue-600 truncate-text">
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

      {/* Pagination */}
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
    </>
  );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/armada/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Log Aktivitas Armada
        </h1>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        {armadaLoading ? (
          <LoadingState text="Memuat data armada..." height="h-20" />
        ) : !armadaData ? (
          <div className="p-4 mb-6 rounded-md bg-amber-50">
            <p className="font-medium text-amber-600">
              Peringatan: ID armada tidak ditemukan
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900">
                Log Aktivitas: {armadaData.model}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                ID: {armadaData.id_sl}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium">Plat Nomor:</span>{" "}
                {armadaData.plateNumber}
              </p>
            </div>
          </div>
        )}

        {isLoading ? <LoadingState text="Memuat data log..." /> : <LogList />}
      </div>
    </div>
  );
}
