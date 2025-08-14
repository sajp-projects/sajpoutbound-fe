import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import {
  usePermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from "@/hooks/permission";
import { useRole } from "@/hooks/role";
import {
  InfoBanner,
  PageHeader,
} from "@/pages/permission/permissionList/_components";
import { Permission } from "@/types/permission";
import { groupPermissionsByResource } from "@/utils/permission";
import { showErrorAlert, showSuccessAlert } from "@/utils/sweetAlert";
import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { EditableResourceGroup } from "./_components/EditableResourceGroup";

export default function IzinPeran() {
  const { id } = useParams<{ id: string }>();
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [hasChanges, setHasChanges] = useState(false);

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

  const updateRolePermissionsMutation = useUpdateRolePermissions({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Izin peran berhasil diperbarui");
      setHasChanges(false);
      refetchRolePermissions();
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Memperbarui Izin",
        error.message || "Terjadi kesalahan saat memperbarui izin peran"
      );
    },
  });

  const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;
  const isError = roleError || permissionsError || rolePermissionsError;

  // Initialize selected permissions when role permissions are loaded
  useMemo(() => {
    if (rolePermissions) {
      const initialSelected = new Set(rolePermissions.map((p) => p.id));
      setSelectedPermissions(initialSelected);
      setHasChanges(false);
    }
  }, [rolePermissions]);

  const groupedPermissions = useMemo(() => {
    return groupPermissionsByResource<Permission>(
      permissionsData?.permissions || []
    );
  }, [permissionsData?.permissions]);

  console.log(groupedPermissions);

  const isPermissionSelected = (permissionId: string) => {
    return selectedPermissions.has(permissionId);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }

      // Check if there are changes compared to original role permissions
      const originalIds = new Set(rolePermissions?.map((p) => p.id) || []);
      const hasChanges =
        newSet.size !== originalIds.size ||
        [...newSet].some((id) => !originalIds.has(id)) ||
        [...originalIds].some((id) => !newSet.has(id));

      setHasChanges(hasChanges);
      return newSet;
    });
  };

  const handleSave = () => {
    if (!id || !rolePermissions) return;

    // Get original permission IDs
    const originalIds = new Set(rolePermissions.map((p) => p.id));

    // Find permissions that were toggled (added or removed)
    const changedPermissions: string[] = [];

    // Check permissions that were added (in selected but not in original)
    selectedPermissions.forEach((permissionId) => {
      if (!originalIds.has(permissionId)) {
        changedPermissions.push(permissionId);
      }
    });

    // Check permissions that were removed (in original but not in selected)
    originalIds.forEach((permissionId) => {
      if (!selectedPermissions.has(permissionId)) {
        changedPermissions.push(permissionId);
      }
    });

    // Only send the changed permissions to be toggled
    if (changedPermissions.length > 0) {
      updateRolePermissionsMutation.mutate({
        roleId: id,
        permissionIds: changedPermissions,
      });
    } else {
      showSuccessAlert(
        "Tidak Ada Perubahan",
        "Tidak ada perubahan yang perlu disimpan"
      );
      setHasChanges(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <PageHeader roleName={roleData?.name || ""} roleId={id || ""} />

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Kelola Izin Peran
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Pilih izin yang akan diberikan kepada peran ini
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Total:{" "}
              <span className="font-medium text-gray-700">
                {permissionsData?.permissions?.length || 0}
              </span>{" "}
              izin
            </div>
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={updateRolePermissionsMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateRolePermissionsMutation.isPending
                  ? "Menyimpan..."
                  : "Simpan"}
              </Button>
            )}
          </div>
        </div>

        <InfoBanner
          title="Informasi"
          message="Centang kotak di sebelah kiri untuk memberikan izin kepada peran ini. Klik 'Simpan' untuk menyimpan perubahan."
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
                    <EditableResourceGroup
                      key={resource}
                      resource={resource}
                      permissions={resourcePermissions}
                      isPermissionSelected={isPermissionSelected}
                      onPermissionToggle={handlePermissionToggle}
                    />
                  )
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
