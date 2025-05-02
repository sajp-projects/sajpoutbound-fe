import { useWarehouses, useDeleteWarehouse } from "@/hooks/gudang";
import { Download, Edit, Eye, History, Plus, Search, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";

import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { showSuccessAlert, showErrorAlert, isConfirmed, showForbiddenAlert, showDeleteConfirmationAlert } from "@/utils/sweetAlert";

export default function DaftarGudang() {
  const [searchParams] = useSearchParams();

  // Mengambil parameter langsung dari URL
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  // Fetch gudang dengan pagination
  const {
    data,
    isLoading,
    isError,
    error: warehouseError,
    refetch,
  } = useWarehouses({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const warehouses = data?.warehouses || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Sinkronkan pagination.page dengan URL jika ada perbedaan
  useEffect(() => {
    if (data && pagination.page !== currentPage) {
      console.log(`Page mismatch: URL says ${currentPage}, API says ${pagination.page}`);
    }
  }, [data, pagination.page, currentPage]);

  // Mutation untuk menghapus gudang
  const deleteWarehouseMutation = useDeleteWarehouse({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Gudang berhasil dihapus");
      refetch();
    },
    onError: (error) => {
      try {
        // Cek jika pesan error adalah Forbidden
        if (error.message && error.message.includes("Forbidden")) {
          showForbiddenAlert("Akses Ditolak", "Anda tidak memiliki akses untuk menghapus gudang ini.");
        } else {
          const errorObj = JSON.parse(error.message);
          showErrorAlert("Gagal Menghapus Gudang", errorObj.message || "Terjadi kesalahan saat menghapus gudang");
        }
      } catch {
        showErrorAlert("Gagal Menghapus Gudang", error.message || "Terjadi kesalahan saat menghapus gudang");
      }
    },
  });

  // Fungsi untuk konfirmasi penghapusan gudang
  const handleDeleteWarehouse = (id: string, name: string) => {
    showDeleteConfirmationAlert("Gudang", `Apakah Anda yakin ingin menghapus gudang "${name}"?`).then((result) => {
      if (isConfirmed(result)) {
        deleteWarehouseMutation.mutate({ id });
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Gudang</h1>
        <Link to="/gudang/tambah">
          <Button className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm text-sm font-medium text-white w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Gudang
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gudang</h2>
            <p className="text-sm text-gray-500">Manajemen data gudang penyimpanan</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto items-center">
            <Button variant="outline" size="sm" className="h-9 min-w-[100px] bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm flex items-center px-3">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <SearchInput placeholder="Cari gudang..." className="max-w-full sm:max-w-md" />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-blue-600 font-medium">Memuat data gudang...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="mt-4 text-red-600 font-medium">Gagal memuat data gudang</p>
              <p className="text-sm text-gray-400 max-w-md">{warehouseError instanceof Error ? warehouseError.message : "Terjadi kesalahan pada server"}</p>
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
                      <TableHead className="w-[50px] font-semibold text-gray-700 py-4">No.</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Nama</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Deskripsi</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4">Pengelola</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4">Tgl. Dibuat</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                            <Search className="h-10 w-10 mb-2 text-gray-300" />
                            <p className="text-gray-500">Tidak ada data gudang yang ditemukan.</p>
                            <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      warehouses.map((gudang, idx) => (
                        <TableRow key={gudang.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                          <TableCell className="font-medium text-center">{idx + 1 + (pagination.page - 1) * pagination.limit}</TableCell>
                          <TableCell className="font-medium text-blue-600">{gudang.name}</TableCell>
                          <TableCell className="truncate max-w-[200px] sm:max-w-none text-gray-600">{gudang.description}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {gudang.user ? (
                              <Link to={`/pengguna/${gudang.user.id}`} className="text-blue-600 hover:underline">
                                {gudang.user.name}
                              </Link>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500">{formatDate(gudang.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Link to={`/gudang/${gudang.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/gudang/${gudang.id}/edit`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Edit">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/gudang/${gudang.id}/log`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" title="Log Aktivitas">
                                  <History className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Hapus"
                                onClick={() => handleDeleteWarehouse(gudang.id, gudang.name)}
                                disabled={deleteWarehouseMutation.isPending && deleteWarehouseMutation.variables?.id === gudang.id}
                              >
                                {deleteWarehouseMutation.isPending && deleteWarehouseMutation.variables?.id === gudang.id ? (
                                  <div className="h-4 w-4 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
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
              {warehouses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
                  <Search className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-gray-500">Tidak ada data gudang yang ditemukan.</p>
                  <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                </div>
              ) : (
                warehouses.map((gudang) => (
                  <div key={gudang.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-blue-600">{gudang.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{gudang.description}</p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        <p>
                          Dibuat: <span className="font-medium">{formatDateShort(gudang.createdAt)}</span>
                        </p>
                        {gudang.user && (
                          <p>
                            Pengelola:{" "}
                            <Link to={`/pengguna/${gudang.user.id}`} className="text-blue-600 hover:underline">
                              {gudang.user.name}
                            </Link>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                        <Link to={`/gudang/${gudang.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/gudang/${gudang.id}/edit`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/gudang/${gudang.id}/log`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" title="Log Aktivitas">
                            <History className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Hapus"
                          onClick={() => handleDeleteWarehouse(gudang.id, gudang.name)}
                          disabled={deleteWarehouseMutation.isPending && deleteWarehouseMutation.variables?.id === gudang.id}
                        >
                          {deleteWarehouseMutation.isPending && deleteWarehouseMutation.variables?.id === gudang.id ? (
                            <div className="h-4 w-4 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {data && <Pagination totalItems={pagination.total} itemsPerPage={pagination.limit} currentPage={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} />}
          </div>
        )}
      </div>
    </div>
  );
}
