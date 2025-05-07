import { useDeleteRole, useRoles } from "@/hooks/role";
import { Plus, Lock } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { useAuth } from "@/hooks/auth";
import { PERMISSION } from "@/constant/PERMISSION";
import { useRolePermissions } from "@/hooks/izin";
import {
  showSuccessAlert,
  showErrorAlert,
  showForbiddenAlert,
  showDeleteConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { getRoleId } from "@/utils/storage";
import { hasPermission } from "@/utils/permission";
import { formatDate, formatDateShort } from "@/utils/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function Role() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const { data, isLoading, isError, refetch } = useRoles({
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

  const hasPermissionAccess = () =>
    hasPermission(
      permissions,
      PERMISSION.RESOURCES.PERMISSION,
      PERMISSION.ACTIONS.READ
    );

  const deleteRole = useDeleteRole({
    onError: (error) => {
      if (error.message && error.message.includes("Forbidden")) {
        showForbiddenAlert(
          "Akses Ditolak",
          "Anda tidak memiliki akses untuk menghapus peran ini."
        );
      } else {
        showErrorAlert(
          "Gagal Menghapus Peran",
          error.message || "Terjadi kesalahan saat menghapus peran"
        );
      }
    },
    onSuccess: (data) => {
      showSuccessAlert(
        "Peran Berhasil Dihapus",
        `Peran "${data.name}" telah berhasil dihapus`
      );
      refetch();
    },
  });

  const handleDeleteRole = (id: string, name: string) => {
    showDeleteConfirmationAlert(
      "Peran",
      `Apakah Anda yakin ingin menghapus peran "${name}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteRole.mutate({ id });
      }
    });
  };

  const getRoleActions = (role: Role) => [
    { type: ActionType.VIEW },
    {
      type: ActionType.CONFIG,
      path: `/peran/${role.id}/izin`,
      disabled: !hasPermissionAccess(),
      icon: <Lock className="h-4 w-4" />,
      title: "Kelola Izin Peran",
      className: "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
    },
    { type: ActionType.EDIT },
    {
      type: ActionType.DELETE,
      onClick: () => handleDeleteRole(role.id, role.name),
      isLoading: deleteRole.isPending && deleteRole.variables?.id === role.id,
      disabled: deleteRole.isPending,
    },
  ];

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Daftar Peran
        </h1>
        <Link to="/peran/tambah">
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Peran
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 w-full">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Peran
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Manajemen data peran dalam sistem
            </p>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 w-full">
          <SearchInput
            placeholder="Cari peran..."
            className="w-full sm:max-w-md"
          />
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data peran..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data peran"
            message="Terjadi kesalahan pada server"
            onRetry={() => refetch()}
          />
        ) : (
          <div className="w-full">
            {}
            <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden w-full">
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-[60px] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        ID
                      </TableHead>
                      <TableHead className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Nama Peran
                      </TableHead>
                      <TableHead className="w-[30%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Deskripsi
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Dibuat
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Diperbarui
                      </TableHead>
                      <TableHead className="w-[130px] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <EmptyState title="Tidak ada data peran yang ditemukan" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      roles.map((role, idx) => (
                        <TableRow
                          key={role.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <TableCell className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                            <div className="wrap-text" title={role.name}>
                              {role.name}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-sm">
                            <div className="wrap-text" title={role.description}>
                              {role.description}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(role.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(role.updatedAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex justify-center items-center">
                              <ActionButtons
                                actions={getRoleActions(role)}
                                entityId={role.id}
                                basePath="/peran"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {}
            <div className="sm:hidden space-y-3 w-full">
              {roles.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg border-gray-200 bg-white w-full">
                  <EmptyState title="Tidak ada data peran yang ditemukan" />
                </div>
              ) : (
                roles.map((role) => (
                  <div
                    key={role.id}
                    className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm w-full"
                  >
                    <div className="p-3 w-full">
                      <div className="flex justify-between items-start mb-2 w-full">
                        <div className="max-w-[65%]">
                          <h3 className="font-medium text-blue-600 break-words text-sm">
                            {role.name}
                          </h3>
                          <p className="text-xs text-gray-600 break-all mt-1">
                            {role.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(role.createdAt)}
                          </span>
                        </p>
                        <p>
                          Diperbarui:{" "}
                          <span className="font-medium">
                            {formatDateShort(role.updatedAt)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                        <ActionButtons
                          actions={getRoleActions(role)}
                          entityId={role.id}
                          basePath="/peran"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {}
            <div className="w-full mt-4">
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
