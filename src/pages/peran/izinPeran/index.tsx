import {
  usePermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from '@/hooks/izin';
import { useRole } from '@/hooks/role';
import { Check, Info, Search, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import Swal from 'sweetalert2';

import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Permission } from '@/types/izin';
import { formatDate, formatDateShort } from '@/utils/date';

// Helper untuk menentukan warna badge berdasarkan action
function getActionBadgeClass(action: string): string {
  switch (action.toUpperCase()) {
    case 'CREATE':
      return 'bg-green-100 text-green-800';
    case 'READ':
      return 'bg-blue-100 text-blue-800';
    case 'UPDATE':
      return 'bg-amber-100 text-amber-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Komponen untuk tampilan loading
const LoadingState = () => (
  <div className="flex justify-center items-center h-60">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
      <p className="mt-4 text-blue-600 font-medium">Memuat data izin...</p>
    </div>
  </div>
);

// Komponen untuk tampilan error
const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex justify-center items-center h-60">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
      <p className="mt-4 text-red-600 font-medium">Gagal memuat data izin</p>
      <p className="text-sm text-gray-400">Terjadi kesalahan pada server</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
        Coba lagi
      </Button>
    </div>
  </div>
);

// Komponen untuk tampilan kosong
const EmptyState = () => (
  <div className="bg-white border border-gray-200 rounded-lg py-8">
    <div className="flex flex-col items-center justify-center text-muted-foreground">
      <Search className="h-10 w-10 mb-2 text-gray-300" />
      <p className="text-gray-500">Tidak ada data izin yang ditemukan.</p>
      <p className="text-sm text-gray-400">
        Coba gunakan kata kunci pencarian yang berbeda.
      </p>
    </div>
  </div>
);

// Komponen untuk kartu izin (tampilan mobile)
const PermissionCard = ({
  permission,
  isSelected,
  onToggle,
  isChanged,
}: {
  permission: Permission;
  isSelected: boolean;
  onToggle: (id: string) => void;
  isChanged: boolean;
}) => {
  return (
    <div
      className={`border-b border-gray-100 last:border-0 p-4 ${
        isChanged ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              isChanged ? 'ring-2 ring-blue-400' : ''
            }`}
            checked={isSelected}
            onChange={() => onToggle(permission.id)}
            id={`mobile-permission-${permission.id}`}
          />
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              getActionBadgeClass(permission.action)
            )}
          >
            {permission.action}
          </span>
        </div>

        {isSelected && (
          <span className="text-green-600 bg-green-50 p-1 rounded-full">
            <Check className="h-4 w-4" />
          </span>
        )}

        {isChanged && (
          <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full ml-1">
            Diubah
          </span>
        )}
      </div>

      <h4 className="font-medium text-blue-600 mb-1">{permission.name}</h4>
      <p className="text-sm text-gray-600 mb-2">{permission.description}</p>

      <div className="text-xs text-gray-500">
        Dibuat:{' '}
        <span className="font-medium">
          {formatDateShort(permission.createdAt)}
        </span>
      </div>
    </div>
  );
};

// Komponen untuk tabel izin (desktop)
const PermissionsTable = ({
  permissions,
  isPermissionSelected,
  togglePermission,
  isPermissionChanged,
}: {
  permissions: Permission[];
  isPermissionSelected: (id: string) => boolean;
  togglePermission: (id: string) => void;
  isPermissionChanged: (id: string) => boolean;
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200">
            <TableHead className="w-[50px] font-semibold text-gray-700 py-3">
              Pilih
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">
              Aksi
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">
              Nama Izin
            </TableHead>
            <TableHead className="font-semibold text-gray-700 py-3">
              Deskripsi
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-3">
              Dibuat
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-3 w-[100px]">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission, idx) => {
            const wasChanged = isPermissionChanged(permission.id);
            return (
              <TableRow
                key={permission.id}
                className={cn(
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                  wasChanged && 'bg-blue-50/70'
                )}
              >
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      className={cn(
                        'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500',
                        wasChanged && 'ring-2 ring-blue-400'
                      )}
                      checked={isPermissionSelected(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      id={`permission-${permission.id}`}
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      getActionBadgeClass(permission.action)
                    )}
                  >
                    {permission.action}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-blue-600">
                  {permission.name}
                </TableCell>
                <TableCell className="text-gray-600">
                  {permission.description}
                </TableCell>
                <TableCell className="hidden md:table-cell text-gray-500">
                  {formatDate(permission.createdAt)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {wasChanged && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                      Diubah
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

// Komponen untuk grup izin berdasarkan resource
const ResourceGroup = ({
  resource,
  permissions,
  isPermissionSelected,
  togglePermission,
  isPermissionChanged,
}: {
  resource: string;
  permissions: Permission[];
  isPermissionSelected: (id: string) => boolean;
  togglePermission: (id: string) => void;
  isPermissionChanged: (id: string) => boolean;
}) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <h3 className="font-medium text-gray-700 flex items-center">
        <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
        <span className="capitalize">{resource}</span>
      </h3>
    </div>

    {/* Table untuk tampilan desktop & tablet */}
    <div className="hidden sm:block">
      <PermissionsTable
        permissions={permissions}
        isPermissionSelected={isPermissionSelected}
        togglePermission={togglePermission}
        isPermissionChanged={isPermissionChanged}
      />
    </div>

    {/* Card untuk tampilan mobile */}
    <div className="sm:hidden space-y-4">
      {permissions.map((permission) => (
        <PermissionCard
          key={permission.id}
          permission={permission}
          isSelected={isPermissionSelected(permission.id)}
          onToggle={togglePermission}
          isChanged={isPermissionChanged(permission.id)}
        />
      ))}
    </div>
  </div>
);

export default function IzinPeran() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [initialPermissions, setInitialPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data peran dari API
  const {
    data: roleData,
    isLoading: roleLoading,
    isError: roleError,
  } = useRole({
    id: id || '',
  });

  // Fetch data izin dari API
  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    isError: permissionsError,
    refetch: refetchPermissions,
  } = usePermissions();

  // Fetch izin yang dimiliki oleh peran ini
  const {
    data: rolePermissions,
    isLoading: rolePermissionsLoading,
    isError: rolePermissionsError,
    refetch: refetchRolePermissions,
  } = useRolePermissions(id || '');

  // Update rolePermissions mutation
  const updateRolePermissions = useUpdateRolePermissions({
    onSuccess: () => {
      refetchRolePermissions();
      Swal.fire({
        icon: 'success',
        title: 'Izin Peran Berhasil Diperbarui',
        text: 'Perubahan izin peran berhasil disimpan',
        timer: 1500,
        showConfirmButton: false,
      });
      setIsSubmitting(false);
      // Update initialPermissions to current selection after successful update
      setInitialPermissions([...selectedPermissions]);
    },
    onError: (error) => {
      setIsSubmitting(false);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memperbarui Izin Peran',
        text: error.message || 'Terjadi kesalahan saat memperbarui izin peran',
        confirmButtonText: 'Tutup',
      });
    },
  });

  // Initialize selected permissions when role permissions are loaded
  useEffect(() => {
    if (rolePermissions && !rolePermissionsLoading) {
      const permissionIds = rolePermissions.map((permission) => permission.id);
      setSelectedPermissions(permissionIds);
      setInitialPermissions(permissionIds);
    }
  }, [rolePermissions, rolePermissionsLoading]);

  // Calculate changed permissions
  const getChangedPermissions = () => {
    const added = selectedPermissions.filter(
      (id) => !initialPermissions.includes(id)
    );
    const removed = initialPermissions.filter(
      (id) => !selectedPermissions.includes(id)
    );

    return {
      added,
      removed,
    };
  };

  // Check if there are any changes to save
  const hasChanges = useMemo(() => {
    const { added, removed } = getChangedPermissions();
    return added.length > 0 || removed.length > 0;
  }, [selectedPermissions, initialPermissions]);

  // Check if permission is selected
  const isPermissionSelected = (permissionId: string) => {
    return selectedPermissions.includes(permissionId);
  };

  // Handle save permissions
  const handleSavePermissions = () => {
    if (!id || !hasChanges) return;

    Swal.fire({
      title: 'Konfirmasi Simpan Izin',
      text: 'Apakah Anda yakin ingin menyimpan perubahan izin peran ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        setIsSubmitting(true);

        // Get all permissions that have changed (both newly checked and newly unchecked)
        const { added, removed } = getChangedPermissions();

        const changedPermissionIds = [...added, ...removed];

        console.log(
          'Sending changed permissions to toggle:',
          changedPermissionIds
        );

        updateRolePermissions.mutate({
          roleId: id,
          permissionIds: changedPermissionIds,
        });
      }
    });
  };

  // Persiapkan data pagination dari API atau gunakan nilai default jika tidak ada
  const permissions = permissionsData?.permissions || [];
  const totalItems = permissionsData?.total || 0;

  // Siapkan nilai untuk pagination berdasarkan pencarian
  const useClientSidePagination = searchTerm.length > 0;

  // Persiapkan data untuk tampilan dengan useMemo untuk optimasi performa
  const { currentPageItems, paginationData } = useMemo(() => {
    let filteredPermissions = permissions;
    let currentPageItems = permissions;
    let paginationData = {
      total: totalItems,
      page: page,
      limit: 10,
      totalPages: Math.ceil(totalItems / 10),
      hasNext: page < Math.ceil(totalItems / 10),
      hasPrev: page > 1,
    };

    // Jika ada pencarian lokal, filter data dan gunakan pagination client-side
    if (useClientSidePagination) {
      filteredPermissions = permissions.filter((permission) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          permission.name.toLowerCase().includes(searchLower) ||
          permission.description.toLowerCase().includes(searchLower) ||
          permission.resource.toLowerCase().includes(searchLower) ||
          permission.action.toLowerCase().includes(searchLower)
        );
      });

      const itemsPerPage = 10;
      const totalFilteredPages = Math.ceil(
        filteredPermissions.length / itemsPerPage
      );
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      // Perbarui data pagination berdasarkan hasil filter
      paginationData = {
        total: filteredPermissions.length,
        page: page,
        limit: itemsPerPage,
        totalPages: totalFilteredPages,
        hasNext: page < totalFilteredPages,
        hasPrev: page > 1,
      };

      // Ambil data untuk halaman saat ini
      currentPageItems = filteredPermissions.slice(startIndex, endIndex);
    }

    return {
      currentPageItems,
      paginationData,
    };
  }, [permissions, totalItems, page, searchTerm, useClientSidePagination]);

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    return currentPageItems.reduce((acc, permission) => {
      const resource = permission.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [currentPageItems]);

  // Handle toggle permission
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Check if permission has been changed from its initial state
  const isPermissionChanged = (permissionId: string) => {
    const wasInitiallySelected = initialPermissions.includes(permissionId);
    const isCurrentlySelected = selectedPermissions.includes(permissionId);
    return wasInitiallySelected !== isCurrentlySelected;
  };

  // Loading state
  const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;
  const isError = roleError || permissionsError || rolePermissionsError;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Izin Peran</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola izin akses untuk peran:{' '}
            <span className="font-medium text-blue-600">
              {roleData?.name || '...'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/peran/${id}`}>
            <Button variant="outline" className="border-gray-300 text-gray-700">
              Kembali
            </Button>
          </Link>
          <Button
            onClick={handleSavePermissions}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting || isLoading || !hasChanges}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            {hasChanges && !isSubmitting && (
              <span className="ml-1.5 flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/80 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Daftar Izin</h2>
            <p className="text-sm text-gray-500">
              Pilih izin yang akan diberikan pada peran ini
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total:{' '}
            <span className="font-medium text-gray-700">{totalItems}</span> izin
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Cari izin..."
              className="w-full pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Alert banner untuk petunjuk penggunaan */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Petunjuk Penggunaan
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Centang kotak di sebelah kiri untuk memberikan izin kepada
                  peran ini. Perubahan tidak akan disimpan hingga Anda menekan
                  tombol "Simpan Perubahan".
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={refetchPermissions} />
        ) : (
          <div>
            {Object.keys(groupedPermissions).length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(
                  ([resource, permissions]) => (
                    <ResourceGroup
                      key={resource}
                      resource={resource}
                      permissions={permissions}
                      isPermissionSelected={isPermissionSelected}
                      togglePermission={togglePermission}
                      isPermissionChanged={isPermissionChanged}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Pagination - selalu tampil */}
        {!isLoading && !isError && (
          <Pagination
            totalItems={paginationData.total}
            itemsPerPage={paginationData.limit}
            currentPage={paginationData.page}
            totalPages={paginationData.totalPages}
            hasNext={paginationData.hasNext}
            hasPrev={paginationData.hasPrev}
          />
        )}
      </div>
    </div>
  );
}
