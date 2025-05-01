import { useDeleteRole, useRoles } from "@/hooks/role";
import { Search, Plus, Eye, Pencil, Trash2, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { Pagination } from "@/components/Pagination";
import { useRolePermissions } from "@/hooks/izin";
import { useAuth } from "@/hooks/auth";
import { PERMISSION } from "@/constant/PERMISSION";

export default function Role() {
  // State untuk input pencarian client-side
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();

  // Get roleId dari localStorage
  const userData = localStorage.getItem("user");
  const roleId = userData ? JSON.parse(userData)?.roleId : null;

  // Fetch permissions untuk memeriksa apakah user memiliki akses ke permission:READ
  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== "",
  });

  // Fungsi untuk memeriksa apakah user memiliki izin permission:READ
  const hasPermissionAccess = (): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return permissions.some((permission) => permission.resource === PERMISSION.RESOURCES.PERMISSION && permission.action === PERMISSION.ACTIONS.READ);
  };

  // Fetch peran dari API
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
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  // Filter berdasarkan search term (client-side)
  const filteredRoles = roles.filter((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
        </div>

        <div className="mb-6">
          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input type="search" placeholder="Cari peran..." className="w-full pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                      <TableHead className="font-semibold text-gray-700 py-4">Nama Peran</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Deskripsi</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4">Tgl. Dibuat</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4">Tgl. Diperbarui</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 ? (
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
                      filteredRoles.map((role, idx) => (
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
                              {hasPermissionAccess() && (
                                <Link to={`/peran/${role.id}/izin`}>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50" title="Kelola Izin Peran">
                                    <Lock className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
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
              {filteredRoles.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
                  <Search className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-gray-500">Tidak ada data peran yang ditemukan.</p>
                  <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                </div>
              ) : (
                filteredRoles.map((role) => (
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
                        {hasPermissionAccess() && (
                          <Link to={`/peran/${role.id}/izin`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50" title="Kelola Izin Peran">
                              <Lock className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
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

            {/* Menggunakan komponen Pagination yang sudah dibuat */}
            <Pagination totalItems={pagination.total} itemsPerPage={pagination.limit} currentPage={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} />
          </div>
        )}
      </div>
    </div>
  );
}
