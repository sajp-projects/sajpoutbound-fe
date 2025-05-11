import { useArchivedUsers, useRestoreUser } from "@/hooks/user";
import { Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { UserWithRole } from "@/types/user";
import { getRoleBadgeColor, getRoleBadgeVariant } from "@/utils/badges";
import { formatDate, formatDateShort } from "@/utils/date";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { PERMISSION } from "@/constant/PERMISSION";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";

export default function ArsipPengguna() {
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const hasUserUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.USER,
    PERMISSION.ACTIONS.UPDATE
  );

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
      showErrorAlert(
        "Gagal!",
        `Gagal memulihkan pengguna: ${
          error.message || "Terjadi kesalahan saat memulihkan pengguna."
        }`
      );
    },
  });

  const handleRestore = (id: string) => {
    showConfirmationAlert(
      "Konfirmasi Pemulihan",
      "Apakah Anda yakin ingin memulihkan pengguna ini?",
      "Ya, Pulihkan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        restoreUser.mutate({ id });
      }
    });
  };

  const renderTable = () => (
    <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50">
              <TableHead className="w-[50px] font-semibold text-gray-700 py-4">
                ID
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Nama
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Email
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Peran
              </TableHead>
              <TableHead className="hidden py-4 font-semibold text-gray-700 md:table-cell">
                Tgl. Dibuat
              </TableHead>
              <TableHead className="hidden py-4 font-semibold text-gray-700 md:table-cell">
                Tgl. Diarsipkan
              </TableHead>
              <TableHead className="py-4 font-semibold text-center text-gray-700">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <EmptyState
                    title="Tidak ada data pengguna terarsip yang ditemukan."
                    message=""
                  />
                </TableCell>
              </TableRow>
            ) : (
              archivedUsers.map((user: UserWithRole, idx: number) => (
                <TableRow
                  key={user.id}
                  className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}
                >
                  <TableCell className="font-medium text-center">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {user.name}
                  </TableCell>
                  <TableCell className="truncate max-w-[150px] sm:max-w-none">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getRoleBadgeVariant(user.role.name)}
                      className={cn(
                        "px-2 py-0.5 rounded-md font-medium",
                        getRoleBadgeColor(user.role.name)
                      )}
                    >
                      {user.role.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-gray-500 md:table-cell">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="hidden text-gray-500 md:table-cell">
                    {user.deletedAt ? formatDate(user.deletedAt) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link to={`/pengguna/${user.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {hasUserUpdateAccess && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Pulihkan"
                          onClick={() => handleRestore(user.id)}
                          disabled={
                            restoreUser.isPending &&
                            restoreUser.variables?.id === user.id
                          }
                        >
                          {restoreUser.isPending &&
                          restoreUser.variables?.id === user.id ? (
                            <div className="w-4 h-4 border-2 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
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

  const renderCards = () => (
    <div className="w-full space-y-4 sm:hidden">
      {archivedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full p-8 bg-white border border-gray-200 rounded-lg">
          <EmptyState
            title="Tidak ada data pengguna terarsip yang ditemukan."
            message=""
          />
        </div>
      ) : (
        archivedUsers.map((user: UserWithRole) => (
          <div
            key={user.id}
            className="w-full bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="max-w-[60%]">
                  <h3 className="font-medium text-blue-600 truncate">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
                <Badge
                  variant={getRoleBadgeVariant(user.role.name)}
                  className={cn(
                    "px-2 py-0.5 rounded-md font-medium",
                    getRoleBadgeColor(user.role.name)
                  )}
                >
                  {user.role.name}
                </Badge>
              </div>

              <div className="mb-3 space-y-1 text-xs text-gray-500">
                <p>
                  Dibuat:{" "}
                  <span className="font-medium">
                    {formatDateShort(user.createdAt)}
                  </span>
                </p>
                <p>
                  Diarsipkan:{" "}
                  <span className="font-medium">
                    {user.deletedAt ? formatDateShort(user.deletedAt) : "-"}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
                <Link to={`/pengguna/${user.id}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                {hasUserUpdateAccess && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Pulihkan"
                    onClick={() => handleRestore(user.id)}
                    disabled={
                      restoreUser.isPending &&
                      restoreUser.variables?.id === user.id
                    }
                  >
                    {restoreUser.isPending &&
                    restoreUser.variables?.id === user.id ? (
                      <div className="w-4 h-4 border-2 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="w-full px-4 space-y-6 overflow-x-hidden sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arsip Pengguna</h1>
        </div>
      </div>

      <div className="w-full p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pengguna Terarsip
            </h2>
            <p className="text-sm text-gray-500">
              Daftar pengguna yang telah diarsipkan dari sistem
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pengguna terarsip..." />
        ) : (
          <div className="w-full">
            {renderTable()}
            {renderCards()}

            <div className="flex p-4 mt-4 border-t border-gray-200">
              <div className="w-full text-sm text-center text-gray-500">
                Menampilkan{" "}
                <strong className="text-gray-700">
                  {archivedUsers.length}
                </strong>{" "}
                pengguna terarsip
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
