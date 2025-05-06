import { useArchivedUsers, useRestoreUser } from "@/hooks/user";
import { Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { UserWithRole } from "@/types/user";
import { getRoleBadgeColor, getRoleBadgeVariant } from "@/utils/badges";
import { formatDate, formatDateShort } from "@/utils/date";
import { showSuccessAlert, showErrorAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";

export default function ArsipPengguna() {
  const {
    data: archivedUsers = [],
    isLoading,
    refetch,
  } = useArchivedUsers({
    staleTime: 5000,
    refetchOnMount: "always",
  });

  const restoreUser = useRestoreUser({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengguna berhasil dipulihkan");
      refetch();
    },
    onError: (error) => {
      showErrorAlert("Gagal!", `Gagal memulihkan pengguna: ${error.message || "Terjadi kesalahan saat memulihkan pengguna."}`);
    },
  });

  const handleRestore = (id: string) => {
    showConfirmationAlert("Konfirmasi Pemulihan", "Apakah Anda yakin ingin memulihkan pengguna ini?", "Ya, Pulihkan!", "Batal").then((result) => {
      if (isConfirmed(result)) {
        restoreUser.mutate({ id });
      }
    });
  };

  
  const renderTable = () => (
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
            {archivedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <EmptyState title="Tidak ada data pengguna terarsip yang ditemukan." message="" />
                </TableCell>
              </TableRow>
            ) : (
              archivedUsers.map((user: UserWithRole, idx: number) => (
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
                      <Link to={`/pengguna/${user.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
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
  );

  
  const renderCards = () => (
    <div className="sm:hidden space-y-4 w-full">
      {archivedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-gray-200 bg-white w-full">
          <EmptyState title="Tidak ada data pengguna terarsip yang ditemukan." message="" />
        </div>
      ) : (
        archivedUsers.map((user: UserWithRole) => (
          <div key={user.id} className="border border-gray-200 rounded-lg bg-white shadow-sm w-full">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="max-w-[60%]">
                  <h3 className="font-medium text-blue-600 truncate">{user.name}</h3>
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
                <Link to={`/pengguna/${user.id}`}>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
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
  );

  return (
    <div className="space-y-6 px-4 sm:px-0 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arsip Pengguna</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Pengguna Terarsip</h2>
            <p className="text-sm text-gray-500">Daftar pengguna yang telah diarsipkan dari sistem</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pengguna terarsip..." />
        ) : (
          <div className="w-full">
            {renderTable()}
            {renderCards()}

            <div className="flex p-4 border-t border-gray-200 mt-4">
              <div className="text-sm text-gray-500 text-center w-full">
                Menampilkan <strong className="text-gray-700">{archivedUsers.length}</strong> pengguna terarsip
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
