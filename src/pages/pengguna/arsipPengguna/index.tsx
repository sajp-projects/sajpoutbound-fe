import { useArchivedUsers, useRestoreUser } from "@/hooks/user";
import { ArrowLeft, Search, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { getRoleBadgeColor, getRoleBadgeVariant } from "@/utils/roles";
import { UserWithRole } from "@/types/user";

export default function ArsipPengguna() {
  // Local states untuk searching (client-side)
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: archivedUsers = [],
    isLoading: loading,
    isError,
    refetch,
  } = useArchivedUsers({
    staleTime: 5000,
    refetchOnMount: "always",
  });

  const restoreUser = useRestoreUser({
    onSuccess: () => {
      Swal.fire({
        title: "Berhasil!",
        text: "Pengguna berhasil dipulihkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      refetch();
    },
    onError: (error) => {
      Swal.fire({
        title: "Gagal!",
        text: `Gagal memulihkan pengguna: ${error.message || "Terjadi kesalahan saat memulihkan pengguna."}`,
        icon: "error",
        confirmButtonText: "Tutup",
      });
    },
  });

  const handleRestore = (id: string) => {
    Swal.fire({
      title: "Konfirmasi Pemulihan",
      text: "Apakah Anda yakin ingin memulihkan pengguna ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Pulihkan!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        restoreUser.mutate({ id });
      }
    });
  };

  // Filter berdasarkan search term
  const filteredUsers = archivedUsers.filter(
    (user: UserWithRole) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/pengguna">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Arsip Pengguna</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pengguna Terarsip</h2>
            <p className="text-sm text-gray-500">Daftar pengguna yang telah diarsipkan dari sistem</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari pengguna terarsip..."
              className="w-full pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-blue-600 font-medium">Memuat data pengguna terarsip...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="mt-4 text-red-600 font-medium">Gagal memuat data pengguna terarsip</p>
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
                      <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4">Tgl. Diarsipkan</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                            <Search className="h-10 w-10 mb-2 text-gray-300" />
                            <p className="text-gray-500">Tidak ada data pengguna terarsip yang ditemukan.</p>
                            <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user, idx) => (
                        <TableRow key={user.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                          <TableCell className="font-medium text-center">{idx + 1}</TableCell>
                          <TableCell className="font-medium text-blue-600">{user.name}</TableCell>
                          <TableCell className="truncate max-w-[150px] sm:max-w-none">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role.name)} className={cn("px-2 py-0.5 rounded-md font-medium", getRoleBadgeColor(user.role.name))}>
                              {user.role.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500">{formatDate(user.createdAt)}</TableCell>
                          <TableCell className="hidden md:table-cell text-gray-500">{user.deletedAt ? formatDate(user.deletedAt) : "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Pulihkan"
                                onClick={() => handleRestore(user.id)}
                                disabled={restoreUser.isPending && restoreUser.variables?.id === user.id}
                              >
                                {restoreUser.isPending && restoreUser.variables?.id === user.id ? <div className="h-4 w-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div> : <RefreshCw className="h-4 w-4" />}
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
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
                  <Search className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-gray-500">Tidak ada data pengguna terarsip yang ditemukan.</p>
                  <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                </div>
              ) : (
                filteredUsers.map((user) => (
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
                          Diarsipkan: <span className="font-medium">{user.deletedAt ? formatDateShort(user.deletedAt) : "-"}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Pulihkan"
                          onClick={() => handleRestore(user.id)}
                          disabled={restoreUser.isPending && restoreUser.variables?.id === user.id}
                        >
                          {restoreUser.isPending && restoreUser.variables?.id === user.id ? <div className="h-4 w-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin"></div> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t border-gray-200 mt-4 gap-4">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                Menampilkan <strong className="text-gray-700">{filteredUsers.length}</strong> dari <strong className="text-gray-700">{archivedUsers.length}</strong> pengguna terarsip
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
