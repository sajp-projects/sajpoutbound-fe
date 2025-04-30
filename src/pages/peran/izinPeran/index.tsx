import { Pagination } from '@/components/Pagination';
import {
  usePermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from '@/hooks/izin';
import { useRole } from '@/hooks/role';
import { Permission } from '@/types/izin';
import {
  getChangedPermissions,
  groupPermissionsByResource,
  hasPermissionChanges,
} from '@/utils/permission';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import Swal from 'sweetalert2';
import {
  EmptyState,
  ErrorState,
  InfoBanner,
  LoadingState,
  PageHeader,
  ResourceGroup,
} from './_components';

export default function IzinPeran() {
  // URL parameters
  const { id } = useParams<{ id: string }>();

  // ===== DATA FETCHING =====

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

  // ===== STATE MANAGEMENT =====

  // Component state
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [initialPermissions, setInitialPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI state
  const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;
  const isError = roleError || permissionsError || rolePermissionsError;

  // ===== PERMISSIONS MANAGEMENT =====

  // Initialize selected permissions when role permissions are loaded
  useEffect(() => {
    if (rolePermissions && !rolePermissionsLoading) {
      const permissionIds = rolePermissions.map((permission) => permission.id);
      setSelectedPermissions(permissionIds);
      setInitialPermissions(permissionIds);
    }
  }, [rolePermissions, rolePermissionsLoading]);

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    return groupPermissionsByResource<Permission>(
      permissionsData?.permissions || []
    );
  }, [permissionsData?.permissions]);

  // Check if permission is selected
  const isPermissionSelected = (permissionId: string) => {
    return selectedPermissions.includes(permissionId);
  };

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

  // Check if there are any changes to save
  const hasChanges = useMemo(() => {
    return hasPermissionChanges(initialPermissions, selectedPermissions);
  }, [selectedPermissions, initialPermissions]);

  // ===== SAVE PERMISSIONS =====

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
        const { added, removed } = getChangedPermissions(
          initialPermissions,
          selectedPermissions
        );

        updateRolePermissions.mutate({
          roleId: id,
          permissionIds: [...added, ...removed],
        });
      }
    });
  };

  // ===== RENDER =====
  return (
    <div className="space-y-6 px-4 sm:px-0">
      <PageHeader
        roleName={roleData?.name || ''}
        roleId={id || ''}
        onSave={handleSavePermissions}
        isSubmitting={isSubmitting}
        hasChanges={hasChanges}
      />

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
            <span className="font-medium text-gray-700">
              {permissionsData?.pagination?.total || 0}
            </span>{' '}
            izin
          </div>
        </div>

        {/* Alert banner untuk petunjuk penggunaan */}
        <InfoBanner
          title="Petunjuk Penggunaan"
          message="Centang kotak di sebelah kiri untuk memberikan izin kepada peran ini. Perubahan tidak akan disimpan hingga Anda menekan tombol 'Simpan Perubahan'."
        />

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
                  ([resource, resourcePermissions]) => (
                    <ResourceGroup
                      key={resource}
                      resource={resource}
                      permissions={resourcePermissions}
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
            totalItems={permissionsData?.pagination?.total || 0}
            itemsPerPage={permissionsData?.pagination?.limit || 10}
            currentPage={permissionsData?.pagination?.page || 1}
            totalPages={permissionsData?.pagination?.totalPages || 1}
            hasNext={permissionsData?.pagination?.hasNext || false}
            hasPrev={permissionsData?.pagination?.hasPrev || false}
          />
        )}
      </div>
    </div>
  );
}
