import { useUsers, useDeleteUser } from "@/hooks/user";
import { Archive, ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Download, Eye, FileText, Filter, Pencil, Plus, RefreshCcw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { getPageRange } from "@/utils/pagination";
import { getRoleBadgeColor, getRoleBadgeVariant } from "@/utils/roles";

type SortField = "name" | "email" | "role" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

export default function Pengguna() {
  const { data: users = [], isLoading: loading, isError, refetch } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const itemsPerPage = 5; // Jumlah item per halaman

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

  const handleArsipkan = (id: number) => {
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

  // Fungsi untuk mengubah sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter users berdasarkan search term
  const filteredUsers = (() => {
    if (!debouncedSearchTerm) return users;

    const term = debouncedSearchTerm.toLowerCase();
    return users.filter((user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term) || user.role.name.toLowerCase().includes(term));
  })();

  // Mengurutkan data
  const sortedUsers = (() => {
    return [...filteredUsers].sort((a, b) => {
      let valueA, valueB;

      if (sortField === "role") {
        valueA = a.role.name;
        valueB = b.role.name;
      } else if (sortField === "name" || sortField === "email") {
        valueA = a[sortField];
        valueB = b[sortField];
      } else {
        valueA = new Date(a[sortField]).getTime();
        valueB = new Date(b[sortField]).getTime();
      }

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  })();

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  // Komponen untuk ikon sort
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    }
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm]);

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
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm" onClick={() => (refetch as () => Promise<unknown>)()}>
              <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input type="search" placeholder="Cari pengguna..." className="w-full pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
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
              <Button variant="outline" size="sm" onClick={() => (refetch as () => Promise<unknown>)()} className="mt-4">
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
                          Nama
                          <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("email")}>
                        <div className="flex items-center">
                          Email
                          <SortIcon field="email" />
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("role")}>
                        <div className="flex items-center">
                          Peran
                          <SortIcon field="role" />
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
                    {paginatedUsers.length === 0 ? (
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
                      paginatedUsers.map((user, idx) => (
                        <TableRow key={user.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                          <TableCell className="font-medium text-center">{startIndex + idx + 1}</TableCell>
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
              {paginatedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white">
                  <Search className="h-10 w-10 mb-2 text-gray-300" />
                  <p className="text-gray-500">Tidak ada data pengguna yang ditemukan.</p>
                  <p className="text-sm text-gray-400">Coba gunakan kata kunci pencarian yang berbeda.</p>
                </div>
              ) : (
                paginatedUsers.map((user) => (
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

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-t border-gray-200 mt-4 gap-4">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                Menampilkan <strong className="text-gray-700">{paginatedUsers.length}</strong> dari <strong className="text-gray-700">{filteredUsers.length}</strong> pengguna
              </div>

              <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </Button>

                <div className="flex items-center gap-1 overflow-x-auto py-1 px-1 max-w-[200px] sm:max-w-none">
                  {getPageRange(currentPage, totalPages).map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`page-${page}`}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => typeof page === "number" && setCurrentPage(page)}
                        className={cn("h-8 w-8 p-0 sm:h-8 sm:w-8", currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700" : "border-gray-300 text-gray-700 hover:bg-gray-50")}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="border-gray-300 text-gray-700 hover:bg-gray-50 h-8 px-2 sm:px-3">
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
