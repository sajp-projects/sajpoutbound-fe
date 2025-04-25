import { Link, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Search } from "lucide-react";

import { useUserLogs } from "@/hooks/userLog";
import { useUser } from "@/hooks/user";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { Pagination } from "@/components/Pagination";

export default function LogPengguna() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  // Mengambil parameter dari URL
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  // Pastikan kita memiliki ID pengguna
  const userId = id || "";

  // Fetch data user
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useUser(
    { id: userId },
    {
      enabled: !!userId,
    }
  );

  // Fetch data log pengguna
  const {
    data,
    isLoading: loading,
    isError,
    refetch,
  } = useUserLogs(userId, {
    enabled: !!userId,
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
        return { label: "Diarsipkan", color: "bg-red-100 text-red-800 border-red-200" };
      case "RESTORE":
        return { label: "Dipulihkan", color: "bg-blue-100 text-blue-800 border-blue-200" };
      default:
        return { label: action, color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  // Helper untuk mendapatkan label yang sesuai untuk jenis entitas
  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case "USER":
        return { label: "Pengguna", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "ROLE":
        return { label: "Peran", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      default:
        return { label: entityType, color: "bg-gray-100 text-gray-800 border-gray-200" };
    }
  };

  // Helper untuk menampilkan perubahan data
  const renderDataChanges = (oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) => {
    if (!oldData && !newData) return null;

    // Jika hanya ada newData, ini adalah pembuatan baru
    if (!oldData && newData) {
      return (
        <div className="text-xs space-y-1 mt-2">
          <p className="font-medium text-gray-700">Data baru:</p>
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(newData, null, 2)}</pre>
        </div>
      );
    }

    // Jika hanya ada oldData, ini adalah penghapusan
    if (oldData && !newData) {
      return (
        <div className="text-xs space-y-1 mt-2">
          <p className="font-medium text-gray-700">Data lama:</p>
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">{JSON.stringify(oldData, null, 2)}</pre>
        </div>
      );
    }

    // Jika keduanya ada, ini adalah pembaruan
    return (
      <div className="text-xs space-y-1 mt-2">
        <p className="font-medium text-gray-700">Perubahan:</p>
        <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(
            {
              old: oldData,
              new: newData,
            },
            null,
            2
          )}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to={`/pengguna/${id}`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Log Aktivitas Pengguna</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        {userLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="w-6 h-6 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div>
          </div>
        ) : userError ? (
          <div className="bg-red-50 p-4 rounded-md mb-6">
            <p className="text-red-600 font-medium">Error: Gagal memuat data pengguna</p>
          </div>
        ) : userData ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Log Aktivitas: {userData.name}</h2>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 p-4 rounded-md mb-6">
            <p className="text-amber-600 font-medium">Peringatan: ID pengguna tidak ditemukan</p>
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
                            <div className="flex items-center gap-2">
                              <Badge className={cn("rounded-md font-medium border", getActionLabel(log.action).color)}>{getActionLabel(log.action).label}</Badge>
                              <Badge className={cn("rounded-md font-medium border", getEntityTypeLabel(log.entityType).color)}>{getEntityTypeLabel(log.entityType).label}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-blue-600">{log.performedBy.name}</span>
                              <span className="text-xs text-gray-500">{log.performedBy.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-gray-700 line-clamp-2">{log.description}</p>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn("rounded-md font-medium border", getActionLabel(log.action).color)}>{getActionLabel(log.action).label}</Badge>
                          <Badge className={cn("rounded-md font-medium border", getEntityTypeLabel(log.entityType).color)}>{getEntityTypeLabel(log.entityType).label}</Badge>
                        </div>
                        <span className="text-xs text-gray-500">{formatDateShort(log.createdAt)}</span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-700 mb-1">{log.description}</p>
                        <div className="text-xs text-gray-500">
                          Dilakukan oleh: <span className="font-medium text-blue-600">{log.performedBy.name}</span>
                        </div>
                      </div>

                      {renderDataChanges(log.oldData, log.newData)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Gunakan komponen Pagination */}
            <Pagination totalItems={pagination.total} itemsPerPage={pagination.limit} currentPage={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} />
          </div>
        )}
      </div>
    </div>
  );
}
