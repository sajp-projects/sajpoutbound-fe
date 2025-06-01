import { useDeleteRole, useRoles } from "@/hooks/role";
import { Lock, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";

interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface ActionConfig {
  type: ActionType;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  path?: string;
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
    refetchOnWindowFocus: true,
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

  const hasRoleCreateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.ROLE,
    PERMISSION.ACTIONS.CREATE
  );

  const hasRoleUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.ROLE,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasRoleDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.ROLE,
    PERMISSION.ACTIONS.DELETE
  );

  const deleteRole = useDeleteRole({
    onError: (error) => {
      showErrorAlert(
        "Gagal Menghapus Peran",
        error.message || "Terjadi kesalahan saat menghapus peran"
      );
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

  const getRoleActions = (role: Role) => {
    const actions: ActionConfig[] = [{ type: ActionType.VIEW }];

    if (hasPermissionAccess()) {
      actions.push({
        type: ActionType.CONFIG,
        path: `/peran/${role.id}/izin`,
        icon: <Lock className="w-4 h-4" />,
        title: "Kelola Izin Peran",
        className: "text-purple-600 hover:text-purple-700 hover:bg-purple-50",
      });
    }

    if (hasRoleUpdateAccess) {
      actions.push({ type: ActionType.EDIT });
    }

    if (hasRoleDeleteAccess) {
      actions.push({
        type: ActionType.DELETE,
        onClick: () => handleDeleteRole(role.id, role.name),
        isLoading: deleteRole.isPending && deleteRole.variables?.id === role.id,
        disabled: deleteRole.isPending,
      });
    }

    return actions;
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
          Daftar Peran
        </h1>
        {hasRoleCreateAccess && (
          <Link to="/peran/tambah">
            <Button
              leftIcon={<Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Tambah
            </Button>
          </Link>
        )}
      </div>

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Peran
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Manajemen data peran dalam sistem
            </p>
          </div>
        </div>

        <div className="w-full mb-4 sm:mb-6">
          <SearchInput
            placeholder="Cari peran..."
            className="w-full sm:max-w-md"
            debounceMs={300}
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
            <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-auto overflow-x-auto ">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="w-[5%] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        No.
                      </TableHead>
                      <TableHead className="w-[40%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Nama Peran
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
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(role.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(role.updatedAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
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

            <div className="w-full space-y-3 sm:hidden">
              {roles.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data peran yang ditemukan" />
                </div>
              ) : (
                roles.map((role) => (
                  <div
                    key={role.id}
                    className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-full p-3">
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="max-w-[65%]">
                          <h3 className="text-sm font-medium text-blue-600 break-words">
                            {role.name}
                          </h3>
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

                      <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
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
