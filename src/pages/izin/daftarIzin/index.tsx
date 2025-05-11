import { Pagination } from "@/components/Pagination";
import {
  usePermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from "@/hooks/izin";
import { useRole } from "@/hooks/role";
import { Permission } from "@/types/izin";
import {
  getChangedPermissions,
  groupPermissionsByResource,
  hasPermissionChanges,
} from "@/utils/permission";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { InfoBanner, PageHeader, ResourceGroup } from "./_components";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export default function IzinPeran() {
  const { id } = useParams<{ id: string }>();

  const {
    data: roleData,
    isLoading: roleLoading,
    isError: roleError,
  } = useRole({
    id: id || "",
  });

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    isError: permissionsError,
    refetch: refetchPermissions,
  } = usePermissions();

  const {
    data: rolePermissions,
    isLoading: rolePermissionsLoading,
    isError: rolePermissionsError,
    refetch: refetchRolePermissions,
  } = useRolePermissions(id || "", {
    enabled: !!id,
    refetchOnMount: true,
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [initialPermissions, setInitialPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;
  const isError = roleError || permissionsError || rolePermissionsError;

  useEffect(() => {
    if (!rolePermissionsLoading) {
      const permissionIds =
        rolePermissions?.map((permission) => permission.id) || [];
      setSelectedPermissions(permissionIds);
      setInitialPermissions(permissionIds);
    }
  }, [rolePermissions, rolePermissionsLoading, id]);

  const groupedPermissions = useMemo(() => {
    return groupPermissionsByResource<Permission>(
      permissionsData?.permissions || []
    );
  }, [permissionsData?.permissions]);

  const isPermissionSelected = (permissionId: string) => {
    return selectedPermissions.includes(permissionId);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const isPermissionChanged = (permissionId: string) => {
    const wasInitiallySelected = initialPermissions.includes(permissionId);
    const isCurrentlySelected = selectedPermissions.includes(permissionId);
    return wasInitiallySelected !== isCurrentlySelected;
  };

  const hasChanges = useMemo(() => {
    return hasPermissionChanges(initialPermissions, selectedPermissions);
  }, [selectedPermissions, initialPermissions]);

  const updateRolePermissions = useUpdateRolePermissions({
    onSuccess: () => {
      refetchRolePermissions();
      showSuccessAlert(
        "Izin Peran Berhasil Diperbarui",
        "Perubahan izin peran berhasil disimpan"
      );
      setIsSubmitting(false);
      setInitialPermissions([...selectedPermissions]);
    },
    onError: (error) => {
      setIsSubmitting(false);
      showErrorAlert(
        "Gagal Memperbarui Izin Peran",
        error.message || "Terjadi kesalahan saat memperbarui izin peran"
      );
    },
  });

  const handleSavePermissions = () => {
    if (!id || !hasChanges) return;

    showConfirmationAlert(
      "Konfirmasi Simpan Izin",
      "Apakah Anda yakin ingin menyimpan perubahan izin peran ini?",
      "Ya, Simpan",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        setIsSubmitting(true);

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

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <PageHeader
        roleName={roleData?.name || ""}
        roleId={id || ""}
        onSave={handleSavePermissions}
        isSubmitting={isSubmitting}
        hasChanges={hasChanges}
      />

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Daftar Izin
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Pilih izin yang akan diberikan pada peran ini
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total:{" "}
            <span className="font-medium text-gray-700">
              {permissionsData?.pagination?.total || 0}
            </span>{" "}
            izin
          </div>
        </div>

        {}
        <InfoBanner
          title="Petunjuk Penggunaan"
          message="Centang kotak di sebelah kiri untuk memberikan izin kepada peran ini. Perubahan tidak akan disimpan hingga Anda menekan tombol 'Simpan Perubahan'."
        />

        {isLoading ? (
          <LoadingState text="Memuat data izin..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data izin"
            message="Terjadi kesalahan pada server"
            onRetry={refetchPermissions}
          />
        ) : (
          <div className="w-full">
            {Object.keys(groupedPermissions).length === 0 ? (
              <EmptyState title="Tidak ada data izin yang ditemukan" />
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

        {}
        {!isLoading && !isError && (
          <div className="w-full mt-4">
            <Pagination
              totalItems={permissionsData?.pagination?.total || 0}
              itemsPerPage={permissionsData?.pagination?.limit || 10}
              currentPage={permissionsData?.pagination?.page || 1}
              totalPages={permissionsData?.pagination?.totalPages || 1}
              hasNext={permissionsData?.pagination?.hasNext || false}
              hasPrev={permissionsData?.pagination?.hasPrev || false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
