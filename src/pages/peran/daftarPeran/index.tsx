import { useDeleteRole, useRoles } from "@/hooks/role";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Download, Eye, Filter, Pencil, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { getPageRange } from "@/utils/pagination";

type SortField = "name" | "description" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

export default function Role() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Mengambil parameter langsung dari URL - ini adalah sumber kebenaran utama
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");
  const searchQuery = searchParams.get("search") || "";
  const sortFieldParam = (searchParams.get("sort") as SortField) || "name";
  const sortDirectionParam = (searchParams.get("sortDirection") as SortDirection) || "asc";

  // State untuk input pencarian, tidak terhubung langsung ke URL
  const [searchInputValue, setSearchInputValue] = useState(searchQuery);

  // Fetch peran dari API dengan pagination
  const {
    data,
    isLoading: loading,
    isError,
    refetch,
  } = useRoles({
    staleTime: 5000,
    refetchOnMount: "always",
  });

  const roles = data?.roles || [];
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

  // Fungsi untuk mengubah halaman dengan aman
  const handlePageChange = useCallback(
    (page: number) => {
      // Penting: Kita kloning semua parameter yang ada untuk menghindari kehilangan data
      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", page.toString());

      console.log(`Setting page to ${page}`);
      // Gunakan { replace: false } untuk memastikan halaman ditambahkan ke history
      setSearchParams(newParams, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  // Fungsi untuk mengubah sorting
  const handleSort = useCallback(
    (field: SortField) => {
      const currentSort = (searchParams.get("sort") as SortField) || "name";
      const currentDirection = (searchParams.get("sortDirection") as SortDirection) || "asc";

      // Ubah arah sorting jika field yang sama diklik
      const newDirection = field === currentSort && currentDirection === "asc" ? "desc" : "asc";

      // Penting: Kita kloning semua parameter yang ada
      const newParams = new URLSearchParams(searchParams);
      newParams.set("sort", field);
      newParams.set("sortDirection", newDirection);
      newParams.set("page", "1"); // Reset ke halaman pertama saat sorting berubah

      console.log(`Setting sort to ${field}, direction: ${newDirection}`);
      setSearchParams(newParams, { replace: false });
    },
    [searchParams, setSearchParams]
  );

  // Handle search (debounced)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchInputValue === searchQuery) return; // Hindari pembaruan tidak perlu

      // Update search params
      const newParams = new URLSearchParams(searchParams);
      if (searchInputValue) {
        newParams.set("search", searchInputValue);
      } else {
        newParams.delete("search");
      }
      // Reset ke halaman 1 saat pencarian
      newParams.set("page", "1");

      console.log(`Setting search to "${searchInputValue}"`);
      setSearchParams(newParams, { replace: false });
    }, 300);

    return () => clearTimeout(delay);
  }, [searchInputValue, searchParams, setSearchParams, searchQuery]);

  // Komponen untuk ikon sort
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortFieldParam !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortDirectionParam === "asc" ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  const deleteRole = useDeleteRole({
    onError: (error) => {
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus Peran",
        text: error.message || "Terjadi kesalahan saat menghapus peran",
        confirmButtonText: "Tutup",
      });
    },
    onSuccess: (data) => {
      Swal.fire({
        icon: "success",
        title: "Peran Berhasil Dihapus",
        text: `Peran "${data.name}" telah berhasil dihapus`,
        timer: 1500,
        showConfirmButton: false,
      });

      // Refresh data peran setelah berhasil menghapus
      refetch();
    },
  });

  const handleDeleteRole = (id: string, name: string) => {
    Swal.fire({
      title: "Konfirmasi Hapus Peran",
      text: `Apakah Anda yakin ingin menghapus peran "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRole.mutate({ id });
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Peran</h1>
        <Link to="/peran/tambah">
          <Button className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm text-sm font-medium text-white w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Peran
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Peran</h2>
            <p className="text-sm text-gray-500">Manajemen data peran dalam sistem</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm" onClick={() => refetch()}>
              <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari peran..."
              className="w-full pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-blue-600 font-medium">Memuat data peran...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="mt-4 text-red-600 font-medium">Gagal memuat data peran</p>
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
                      <TableHead className="w-[50px] font-semibold text-gray-700 py-4">ID</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("name")}>
                        <div className="flex items-center">
                          Nama Peran
                          <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("description")}>
                        <div className="flex items-center">
                          Deskripsi
                          <SortIcon field="description" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("createdAt")}>
                        <div className="flex items-center">
                          Tgl. Dibuat
                          <SortIcon field="createdAt" />
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("updatedAt")}>
                        <div className="flex items-center">
                          Tgl. Diperbarui
                          <SortIcon field="updatedAt" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                            <Search className="h-10 w-10 mb-2 text-gray-300" />
                            <p className="text-gray-500">Tidak ada data peran yang ditemukan.</p>
                            <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      roles.map((role, idx) => (
                        <TableRow key={role.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                          <TableCell className="font-medium text-center">{idx + 1 + (pagination.page - 1) * pagination.limit}</TableCell>
                          <TableCell className="font-medium text-blue-600">{role.name}</TableCell>
                          <TableCell className="text-gray-600">{role.description}</TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500">{formatDate(role.createdAt)}</TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500">{formatDate(role.updatedAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Link to={`/peran/${role.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/peran/${role.id}/edit`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" title="Hapus" onClick={() => handleDeleteRole(role.id, role.name)} disabled={deleteRole.isPending}>
                                <Trash2 className="h-4 w-4" />
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
              {roles.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
                  <Search className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-gray-500">Tidak ada data peran yang ditemukan.</p>
                  <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                </div>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-blue-600">{role.name}</h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{role.description}</p>

                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        <p>
                          Dibuat: <span className="font-medium">{formatDateShort(role.createdAt)}</span>
                        </p>
                        <p>
                          Diperbarui: <span className="font-medium">{formatDateShort(role.updatedAt)}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                        <Link to={`/peran/${role.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/peran/${role.id}/edit`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" title="Hapus" onClick={() => handleDeleteRole(role.id, role.name)} disabled={deleteRole.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t border-gray-200 mt-4 gap-4">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                Menampilkan <strong className="text-gray-700">{roles.length}</strong> dari <strong className="text-gray-700">{pagination.total}</strong> peran
              </div>

              <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={!pagination.hasPrev} className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </Button>

                <div className="flex items-center gap-1 overflow-x-auto py-1 px-1 max-w-[200px] sm:max-w-none">
                  {getPageRange(pagination.page, pagination.totalPages).map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`page-${page}`}
                        variant={pagination.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => typeof page === "number" && handlePageChange(page)}
                        className={cn("h-8 w-8 p-0 sm:h-8 sm:w-8", pagination.page === page ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button variant="outline" size="sm" onClick={() => handlePageChange(pagination.page + 1)} disabled={!pagination.hasNext} className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-2 sm:px-3">
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <ArrowRight className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
