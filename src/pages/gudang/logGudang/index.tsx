import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Search, RefreshCcw } from "lucide-react";

import { useWarehouse } from "@/hooks/gudang";
import { useWarehouseLogsByWarehouseId } from "@/hooks/gudangLogs";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { Pagination } from "@/components/Pagination";

export default function LogGudang() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  // Mengambil parameter dari URL
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  // Pastikan kita memiliki ID gudang
  const warehouseId = id || "";

  // Fetch data gudang
  const {
    data: gudangData,
    isLoading: gudangLoading,
    isError: gudangError,
  } = useWarehouse(
    { id: warehouseId },
    {
      enabled: !!warehouseId,
    }
  );

  // Fetch data log gudang
  const {
    data,
    isLoading: loading,
    isError,
    refetch,
  } = useWarehouseLogsByWarehouseId(warehouseId, {
    enabled: !!warehouseId,
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

  // Helper untuk mendapatkan label yang sesuai untuk jenis aksi
  const getActionLabel = (action: string) => {
    switch (action) {
      case "CREATE":
        return { label: "Dibuat", color: "bg-green-100 text-green-800 border-green-200" };
      case "UPDATE":
        return { label: "Diperbarui", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "DELETE":
        return { label: "Dihapus", color: "bg-red-100 text-red-800 border-red-200" };
      case "RESTORE":
        return { label: "Dipulihkan", color: "bg-blue-100 text-blue-800 border-blue-200" };
      default:
        return { label: action, color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  // Helper untuk menampilkan perubahan data
  const renderChanges = (oldData: any, newData: any) => {
    if (!oldData && !newData) return null;

    // Jika tidak ada perubahan untuk ditampilkan
    if (!oldData && !newData) return null;

    // Untuk aksi CREATE
    if (newData && !oldData) {
      return (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Data gudang yang dibuat:</div>
          <table className="text-xs w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Nama</td>
                <td className="border border-gray-200 px-2 py-1">{newData.name}</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Deskripsi</td>
                <td className="border border-gray-200 px-2 py-1">{newData.description}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // Untuk aksi DELETE
    if (oldData && !newData) {
      return (
        <div>
          <div className="text-xs font-medium text-gray-700 mb-1">Data gudang yang dihapus:</div>
          <table className="text-xs w-full border-collapse">
            <tbody>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Nama</td>
                <td className="border border-gray-200 px-2 py-1">{oldData.name}</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-2 py-1 bg-gray-50 font-medium">Deskripsi</td>
                <td className="border border-gray-200 px-2 py-1">{oldData.description}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    // Untuk aksi UPDATE
    if (oldData && newData) {
      // Bandingkan field-field untuk melihat perubahan
      const changes = [];

      if (oldData.name !== newData.name) {
        changes.push({
          field: "Nama",
          oldValue: oldData.name,
          newValue: newData.name,
        });
      }

      if (oldData.description !== newData.description) {
        changes.push({
          field: "Deskripsi",
          oldValue: oldData.description,
          newValue: newData.description,
        });
      }

      // Bandingkan pengelola jika ada perubahan
      const oldUser = oldData.user ? oldData.user.name : "-";
      const newUser = newData.user ? newData.user.name : "-";

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

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to={`/gudang/${id}`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Log Aktivitas Gudang</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        {gudangLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
          </div>
        ) : gudangError ? (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-600 font-medium">Error: Gagal memuat data gudang</p>
          </div>
        ) : gudangData ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Log Aktivitas: {gudangData.name}</h2>
              <p className="text-sm text-gray-500">{gudangData.description}</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 p-4 rounded-md mb-6">
            <p className="text-amber-600 font-medium">Peringatan: ID gudang tidak ditemukan</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-blue-600 font-medium">Memuat data log...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="mt-4 text-red-600 font-medium">Gagal memuat data log</p>
              <p className="text-sm text-gray-400">Terjadi kesalahan pada server</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Coba lagi
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Table untuk tampilan desktop & tablet */}
            <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-[50px] font-semibold text-gray-700 py-4">No</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Waktu</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Aksi</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Dilakukan Oleh</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Deskripsi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                            <Search className="h-10 w-10 mb-2 text-gray-300" />
                            <p className="text-gray-500">Tidak ada data log yang ditemukan.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log, index) => (
                        <TableRow key={log.id} className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                          <TableCell className="font-medium text-center">{index + 1 + (pagination.page - 1) * pagination.limit}</TableCell>
                          <TableCell className="text-gray-700">{formatDate(log.createdAt)}</TableCell>
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
                              {log.oldData || log.newData ? (
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
                              ) : null}
                              <div className="hidden mt-2">{renderChanges(log.oldData, log.newData)}</div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Card untuk tampilan mobile */}
            <div className="sm:hidden space-y-4">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
                  <Search className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-gray-500">Tidak ada data log yang ditemukan.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={cn("rounded-md font-medium border", getActionLabel(log.action).color)}>{getActionLabel(log.action).label}</Badge>
                        <span className="text-xs text-gray-500">{formatDateShort(log.createdAt)}</span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-700 mb-1">{log.description}</p>
                        <div className="text-xs text-gray-500">
                          Dilakukan oleh: <span className="font-medium text-blue-600">{log.performedBy.name}</span>
                        </div>
                      </div>

                      {log.oldData || log.newData ? <div className="mt-3 border-t border-gray-100 pt-3">{renderChanges(log.oldData, log.newData)}</div> : null}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Gunakan komponen Pagination */}
            {data && <Pagination totalItems={pagination.total} itemsPerPage={pagination.limit} currentPage={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} />}
          </div>
        )}
      </div>
    </div>
  );
}
