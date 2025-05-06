import { useSearchParams } from "react-router";
import { Download } from "lucide-react";

import { useWarehouseLogs } from "@/hooks/gudangLog";
import { WarehouseLog } from "@/types/gudangLog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

export default function LogSemuaGudang() {
  const [searchParams] = useSearchParams();

  
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  
  const { data, isLoading } = useWarehouseLogs({
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

  
  const getActionLabel = (action: string): ActionLabel => {
    const labels: Record<string, ActionLabel> = {
      CREATE: { label: "Dibuat", color: "bg-green-100 text-green-800 border-green-200" },
      UPDATE: { label: "Diperbarui", color: "bg-amber-100 text-amber-800 border-amber-200" },
      DELETE: { label: "Dihapus", color: "bg-red-100 text-red-800 border-red-200" },
      RESTORE: { label: "Dipulihkan", color: "bg-blue-100 text-blue-800 border-blue-200" },
    };

    return labels[action] || { label: action, color: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  
  const renderChanges = (oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) => {
    if (!oldData && !newData) return null;

    
    if (newData && !oldData) {
      return (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Data gudang yang dibuat:</div>
          <table className="text-xs w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Nama</td>
                <td className="border border-gray-200 px-2 py-1">{newData.name as string}</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Deskripsi</td>
                <td className="border border-gray-200 px-2 py-1">{newData.description as string}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    
    if (oldData && !newData) {
      return (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Data gudang yang dihapus:</div>
          <table className="text-xs w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Nama</td>
                <td className="border border-gray-200 px-2 py-1">{oldData.name as string}</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Deskripsi</td>
                <td className="border border-gray-200 px-2 py-1">{oldData.description as string}</td>
              </tr>
            </tbody>
          </table>
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

      if (oldData.description !== newData.description) {
        changes.push({
          field: "Deskripsi",
          oldValue: oldData.description as string,
          newValue: newData.description as string,
        });
      }

      
      type UserType = { name: string };
      const oldUser = (oldData.user as UserType)?.name || "-";
      const newUser = (newData.user as UserType)?.name || "-";

      if (oldUser !== newUser) {
        changes.push({
          field: "Pengelola",
          oldValue: oldUser,
          newValue: newUser,
        });
      }

      if (changes.length === 0) return null;

      return (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Perubahan:</div>
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-2 py-1 text-left font-medium">Field</th>
                <th className="border border-gray-200 px-2 py-1 text-left font-medium">Nilai Lama</th>
                <th className="border border-gray-200 px-2 py-1 text-left font-medium">Nilai Baru</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-200 px-2 py-1 font-medium">{change.field}</td>
                  <td className="border border-gray-200 px-2 py-1">{change.oldValue}</td>
                  <td className="border border-gray-200 px-2 py-1">{change.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  
  const getWarehouseName = (log: WarehouseLog) => {
    if (log.warehouse) {
      return log.warehouse.name;
    } else if (log.newData && log.newData.name) {
      return log.newData.name as string;
    } else if (log.oldData && log.oldData.name) {
      return log.oldData.name as string;
    }
    return "Gudang tidak diketahui";
  };

  
  const renderLogTable = () => (
    <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-b border-gray-200">
              <TableHead className="w-[50px] font-semibold text-gray-700 py-4">No</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Waktu</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Gudang</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Aksi</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Dilakukan Oleh</TableHead>
              <TableHead className="font-semibold text-gray-700 py-4">Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <EmptyState title="Tidak ada data log yang ditemukan." message="" />
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log: WarehouseLog, index: number) => (
                <TableRow key={log.id} className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                  <TableCell className="font-medium text-center">{index + 1 + (pagination.page - 1) * pagination.limit}</TableCell>
                  <TableCell className="text-gray-700">{formatDate(log.createdAt)}</TableCell>
                  <TableCell>
                    {log.warehouse ? (
                      <Link to={`/gudang/${log.warehouse.id}`} className="font-medium text-blue-600 hover:underline">
                        {log.warehouse.name}
                      </Link>
                    ) : (
                      <span className="text-gray-700">{getWarehouseName(log)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-md font-medium border", getActionLabel(log.action).color)}>{getActionLabel(log.action).label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-600">{log.performedBy.name}</span>
                      <span className="text-xs text-gray-500">{log.performedBy.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-700 line-clamp-2">{log.description}</p>
                    <div className="mt-2">
                      {(log.oldData || log.newData) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 py-1 h-auto text-xs text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.currentTarget.nextElementSibling?.classList.toggle("hidden");
                            }}
                          >
                            Lihat Detail
                          </Button>
                          <div className="hidden mt-2">{renderChanges(log.oldData, log.newData)}</div>
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
    <div className="sm:hidden space-y-4">
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
          <EmptyState title="Tidak ada data log yang ditemukan." message="" />
        </div>
      ) : (
        logs.map((log: WarehouseLog) => (
          <div key={log.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <Badge className={cn("rounded-md font-medium border", getActionLabel(log.action).color)}>{getActionLabel(log.action).label}</Badge>
                <span className="text-xs text-gray-500">{formatDateShort(log.createdAt)}</span>
              </div>

              <div className="mb-2">
                <div className="mb-1">
                  <span className="text-sm font-medium">Gudang: </span>
                  {log.warehouse ? (
                    <Link to={`/gudang/${log.warehouse.id}`} className="text-sm text-blue-600 hover:underline">
                      {log.warehouse.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-700">{getWarehouseName(log)}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1">{log.description}</p>
                <div className="text-xs text-gray-500">
                  Dilakukan oleh: <span className="font-medium text-blue-600">{log.performedBy.name}</span>
                </div>
              </div>

              {(log.oldData || log.newData) && <div className="mt-3 border-t border-gray-100 pt-3">{renderChanges(log.oldData, log.newData)}</div>}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">Log Aktivitas Gudang</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Semua Aktivitas Gudang</h2>
            <p className="text-sm text-gray-500">Riwayat perubahan data gudang di sistem</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto items-center">
            <Button variant="outline" size="sm" className="h-9 min-w-[100px] bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm flex items-center px-3">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
            {data && <Pagination totalItems={pagination.total} itemsPerPage={pagination.limit} currentPage={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} />}
          </div>
        )}
      </div>
    </div>
  );
}
