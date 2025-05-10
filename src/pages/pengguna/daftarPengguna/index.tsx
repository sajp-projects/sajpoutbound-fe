import { useDeleteUser, useUsers } from '@/hooks/user';
import { Download, Plus } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { ActionButtons, ActionType } from '@/components/ActionButtons';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Pagination } from '@/components/Pagination';
import { RoleFilter } from '@/components/RoleFilter';
import { SearchInput } from '@/components/SearchInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PERMISSION } from '@/constant/PERMISSION';
import { useAuth } from '@/hooks/auth';
import { useRolePermissions } from '@/hooks/izin';
import { cn } from '@/lib/utils';
import { getRoleBadgeColor, getRoleBadgeVariant } from '@/utils/badges';
import { formatDate, formatDateShort } from '@/utils/date';
import { hasPermission } from '@/utils/permission';
import { getRoleId } from '@/utils/storage';
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showForbiddenAlert,
  showSuccessAlert,
} from '@/utils/sweetAlert';

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

export default function Pengguna() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || '';

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== '',
  });

  const currentPage = parseInt(searchParams.get('page') || '1');
  const itemsPerPage = parseInt(searchParams.get('limit') || '10');

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
      showSuccessAlert('Berhasil!', 'Pengguna berhasil diarsipkan');
      refetch();
    },
    onError: (error) => {
      console.log(error, 'error', error.message);
      if (error.message && error.message.includes('Forbidden')) {
        showForbiddenAlert(
          'Akses Ditolak',
          'Anda tidak memiliki akses untuk mengarsipkan pengguna ini.'
        );
      } else {
        showErrorAlert(
          'Gagal Mengarsipkan Pengguna',
          error.message || 'Terjadi kesalahan saat mengarsipkan pengguna.'
        );
      }
    },
  });

  const handleArsipkan = async (id: string) => {
    const result = await showConfirmationAlert(
      'Konfirmasi Arsip',
      'Apakah Anda yakin ingin mengarsipkan pengguna ini? Tindakan ini tidak dapat dibatalkan.',
      'Ya, Arsipkan!',
      'Batal'
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

  const getUserActions = (user: User) => [
    { type: ActionType.VIEW },
    { type: ActionType.EDIT },
    { type: ActionType.LOG },
    {
      type: ActionType.ARCHIVE,
      onClick: () => handleArsipkan(user.id),
      isLoading: deleteUser.isPending && deleteUser.variables?.id === user.id,
      disabled: deleteUser.isPending,
    },
  ];

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Daftar Pengguna
        </h1>
        <Link to="/pengguna/tambah">
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Pengguna
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 w-full">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Pengguna
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Manajemen data pengguna sistem
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto items-center">
            {hasRoleReadAccess && <RoleFilter />}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-3 w-3 sm:h-4 sm:w-4" />}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 w-full">
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
            <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden w-full">
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="w-full min-w-[650px] border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="w-[60px] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        ID
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
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                            'border-b border-gray-200 last:border-b-0'
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
                                'px-2 py-0.5 rounded-md font-medium text-xs',
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
                            <div className="flex justify-center items-center">
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
            <div className="sm:hidden space-y-3 w-full">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg border-gray-200 bg-white w-full">
                  <EmptyState title="Tidak ada data pengguna yang ditemukan" />
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm w-full"
                  >
                    <div className="p-3 w-full">
                      <div className="flex justify-between items-start mb-2 w-full">
                        <div className="max-w-[65%]">
                          <h3 className="font-medium text-blue-600 break-words text-sm">
                            {user.name}
                          </h3>
                          <p className="text-xs text-gray-600 break-all mt-1">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          variant={getRoleBadgeVariant(user.role.name)}
                          className={cn(
                            'px-2 py-0.5 rounded-md font-medium text-xs shrink-0',
                            getRoleBadgeColor(user.role.name)
                          )}
                        >
                          {user.role.name}
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{' '}
                          <span className="font-medium">
                            {formatDateShort(user.createdAt)}
                          </span>
                        </p>
                        <p>
                          Diperbarui:{' '}
                          <span className="font-medium">
                            {formatDateShort(user.updatedAt)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
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
