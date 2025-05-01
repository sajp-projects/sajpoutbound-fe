import { useDeleteUser, useUsers } from "@/hooks/user";
import { Archive, Download, Eye, FileText, Pencil, Plus, Search } from "lucide-react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import Swal from "sweetalert2";

import { Pagination } from "@/components/Pagination";
import { RoleFilter } from "@/components/RoleFilter";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getRoleBadgeColor, getRoleBadgeVariant } from "@/utils/badges";
import { formatDate, formatDateShort } from "@/utils/date";
import { useAuth } from "@/hooks/auth";
import { PERMISSION } from "@/constant/PERMISSION";
import { useRolePermissions } from "@/hooks/izin";

export default function Pengguna() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // Get roleId dari localStorage
  const userData = localStorage.getItem("user");
  const roleId = userData ? JSON.parse(userData)?.roleId : null;

  // Fetch permissions untuk memeriksa apakah user memiliki akses ke role:READ
  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== "",
  });

  // Fungsi untuk memeriksa apakah user memiliki izin role:READ
  const hasRoleReadPermission = (): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return permissions.some((permission) => permission.resource === PERMISSION.RESOURCES.ROLE && permission.action === PERMISSION.ACTIONS.READ);
  };

  // Mengambil parameter langsung dari URL - ini adalah sumber kebenaran utama
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  // Fetch users dari API
  const {
    data,
    isLoading: loading,
    isError,
    refetch,
  } = useUsers({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const users = data?.users || [];
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

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      Swal.fire({
        title: "Berhasil!",
        text: "Pengguna berhasil diarsipkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      refetch();
    },
    onError: (error) => {
      Swal.fire({
        title: "Gagal!",
        text: `Gagal mengarsipkan pengguna: ${error.message || "Terjadi kesalahan saat mengarsipkan pengguna."}`,
        icon: "error",
        confirmButtonText: "Tutup",
      });
    },
  });

  const handleArsipkan = (id: string) => {
    Swal.fire({
      title: "Konfirmasi Arsip",
      text: "Apakah Anda yakin ingin mengarsipkan pengguna ini? Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Arsipkan!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser.mutate({ id });
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pengguna</h1>
        <Link to="/pengguna/tambah">
          <Button className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm text-sm font-medium text-white w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pengguna
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pengguna</h2>
            <p className="text-sm text-gray-500">Manajemen data pengguna sistem</p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto items-center">
            {hasRoleReadPermission() && <RoleFilter />}
            <Button variant="outline" size="sm" className="h-9 min-w-[100px] bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm flex items-center px-3">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <SearchInput placeholder="Cari pengguna..." className="max-w-full sm:max-w-md" />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-blue-600 font-medium">Memuat data pengguna...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="mt-4 text-red-600 font-medium">Gagal memuat data pengguna</p>
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
                      <TableHead className="font-semibold text-gray-700 py-4">Nama</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">Peran</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4">Tgl. Dibuat</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4">Tgl. Diperbarui</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                            <Search className="h-10 w-10 mb-2 text-gray-300" />
                            <p className="text-gray-500">Tidak ada data pengguna yang ditemukan.</p>
                            <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user, idx) => (
                        <TableRow key={user.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                          <TableCell className="font-medium text-center">{idx + 1 + (pagination.page - 1) * pagination.limit}</TableCell>
                          <TableCell className="font-medium text-blue-600">{user.name}</TableCell>
                          <TableCell className="truncate max-w-[150px] sm:max-w-none">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role.name)} className={cn("px-2 py-0.5 rounded-md font-medium", getRoleBadgeColor(user.role.name))}>
                              {user.role.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500">{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500">{formatDate(user.updatedAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Link to={`/pengguna/${user.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/pengguna/${user.id}/edit`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/pengguna/${user.id}/log`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" title="Log Aktivitas">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Arsipkan"
                                onClick={() => handleArsipkan(user.id)}
                                disabled={deleteUser.isPending && deleteUser.variables?.id === user.id}
                              >
                                {deleteUser.isPending && deleteUser.variables?.id === user.id ? <div className="h-4 w-4 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div> : <Archive className="h-4 w-4" />}
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
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
                  <Search className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-gray-500">Tidak ada data pengguna yang ditemukan.</p>
                  <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                </div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-blue-600">{user.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                        <Badge variant={getRoleBadgeVariant(user.role.name)} className={cn("px-2 py-0.5 rounded-md font-medium", getRoleBadgeColor(user.role.name))}>
                          {user.role.name}
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        <p>
                          Dibuat: <span className="font-medium">{formatDateShort(user.createdAt)}</span>
                        </p>
                        <p>
                          Diperbarui: <span className="font-medium">{formatDateShort(user.updatedAt)}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                        <Link to={`/pengguna/${user.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/pengguna/${user.id}/edit`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/pengguna/${user.id}/log`}>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50" title="Log Aktivitas">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Arsipkan"
                          onClick={() => handleArsipkan(user.id)}
                          disabled={deleteUser.isPending && deleteUser.variables?.id === user.id}
                        >
                          {deleteUser.isPending && deleteUser.variables?.id === user.id ? <div className="h-4 w-4 rounded-full border-2 border-red-200 border-t-red-600 animate-spin"></div> : <Archive className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <Pagination totalItems={pagination.total} itemsPerPage={pagination.limit} currentPage={pagination.page} totalPages={pagination.totalPages} hasNext={pagination.hasNext} hasPrev={pagination.hasPrev} />
          </div>
        )}
      </div>
    </div>
  );
}
