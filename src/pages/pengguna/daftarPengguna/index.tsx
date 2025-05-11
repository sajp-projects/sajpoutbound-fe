import { useDeleteUser, useUsers } from "@/hooks/user";
import { Download, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Pagination } from "@/components/Pagination";
import { RoleFilter } from "@/components/RoleFilter";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { cn } from "@/lib/utils";
import { getRoleBadgeColor, getRoleBadgeVariant } from "@/utils/badges";
import { formatDate, formatDateShort } from "@/utils/date";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";

interface User {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
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

export default function Pengguna() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { data, isLoading, isError, refetch } = useUsers({
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

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengguna berhasil diarsipkan");
      refetch();
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Mengarsipkan Pengguna",
        error.message || "Terjadi kesalahan saat mengarsipkan pengguna."
      );
    },
  });

  const handleArsipkan = async (id: string) => {
    const result = await showConfirmationAlert(
      "Konfirmasi Arsip",
      "Apakah Anda yakin ingin mengarsipkan pengguna ini? Tindakan ini tidak dapat dibatalkan.",
      "Ya, Arsipkan!",
      "Batal"
    );

    if (isConfirmed(result)) {
      deleteUser.mutate({ id });
    }
  };

  const hasRoleReadAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.ROLE,
    PERMISSION.ACTIONS.READ
  );

  const hasUserCreateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.USER,
    PERMISSION.ACTIONS.CREATE
  );

  const hasUserUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.USER,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasUserDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.USER,
    PERMISSION.ACTIONS.DELETE
  );

  const getUserActions = (user: User) => {
    const actions: ActionConfig[] = [{ type: ActionType.VIEW }];

    if (hasUserUpdateAccess) {
      actions.push({ type: ActionType.EDIT });
    }

    actions.push({ type: ActionType.LOG });

    if (hasUserDeleteAccess) {
      actions.push({
        type: ActionType.ARCHIVE,
        onClick: () => handleArsipkan(user.id),
        isLoading: deleteUser.isPending && deleteUser.variables?.id === user.id,
        disabled: deleteUser.isPending,
      });
    }

    return actions;
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-col items-start justify-between w-full gap-2 sm:flex-row sm:items-center sm:gap-3">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Daftar Pengguna
        </h1>
        {hasUserCreateAccess && (
          <Link to="/pengguna/tambah">
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              size="sm"
              className="w-full sm:w-auto"
            >
              Tambah Pengguna
            </Button>
          </Link>
        )}
      </div>

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Pengguna
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Manajemen data pengguna sistem
            </p>
          </div>
          <div className="flex flex-wrap items-center w-full gap-2 sm:gap-3 sm:w-auto">
            {hasRoleReadAccess && <RoleFilter />}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3 h-3 sm:h-4 sm:w-4" />}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="w-full mb-4 sm:mb-6">
          <SearchInput
            placeholder="Cari pengguna..."
            className="w-full sm:max-w-md"
          />
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pengguna..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data pengguna"
            message="Terjadi kesalahan pada server"
            onRetry={() => refetch()}
          />
        ) : (
          <div className="w-full">
            {}
            <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="w-full min-w-[650px] border-collapse">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="w-[60px] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        No.
                      </th>
                      <th className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Nama
                      </th>
                      <th className="w-[30%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Email
                      </th>
                      <th className="w-[13%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Peran
                      </th>
                      <th className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Dibuat
                      </th>
                      <th className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Diperbarui
                      </th>
                      <th className="w-[130px] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center">
                          <EmptyState title="Tidak ada data pengguna yang ditemukan" />
                        </td>
                      </tr>
                    ) : (
                      users.map((user, idx) => (
                        <tr
                          key={user.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <td className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                            <div className="wrap-text" title={user.name}>
                              {user.name}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 text-sm">
                            <div className="wrap-text" title={user.email}>
                              {user.email}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge
                              variant={getRoleBadgeVariant(user.role.name)}
                              className={cn(
                                "px-2 py-0.5 rounded-md font-medium text-xs",
                                getRoleBadgeColor(user.role.name)
                              )}
                            >
                              {user.role.name}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(user.updatedAt)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
                              <ActionButtons
                                actions={getUserActions(user)}
                                entityId={user.id}
                                basePath="/pengguna"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {}
            <div className="w-full space-y-3 sm:hidden">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data pengguna yang ditemukan" />
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-full p-3">
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="max-w-[65%]">
                          <h3 className="text-sm font-medium text-blue-600 break-words">
                            {user.name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-600 break-all">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          variant={getRoleBadgeVariant(user.role.name)}
                          className={cn(
                            "px-2 py-0.5 rounded-md font-medium text-xs shrink-0",
                            getRoleBadgeColor(user.role.name)
                          )}
                        >
                          {user.role.name}
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(user.createdAt)}
                          </span>
                        </p>
                        <p>
                          Diperbarui:{" "}
                          <span className="font-medium">
                            {formatDateShort(user.updatedAt)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
                        <ActionButtons
                          actions={getUserActions(user)}
                          entityId={user.id}
                          basePath="/pengguna"
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
