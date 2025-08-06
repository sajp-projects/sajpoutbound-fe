import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { Permission } from "@/types/izin";
import { groupPermissionsByResource } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import { InfoBanner, ResourceGroup } from "./_components";

export default function DaftarIzin() {
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const {
    data: rolePermissions,
    isLoading: rolePermissionsLoading,
    isError: rolePermissionsError,
  } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId,
    refetchOnMount: true,
  });

  const isLoading = rolePermissionsLoading;
  const isError = rolePermissionsError;

  const isPermissionSelected = (permissionId: string) => {
    return (
      rolePermissions?.some((permission) => permission.id === permissionId) ||
      false
    );
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Izin</h1>
          <p className="text-sm text-gray-500">
            Izin yang Anda miliki dalam sistem
          </p>
        </div>
      </div>

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Izin Anda
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Izin yang Anda miliki dalam sistem
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total:{" "}
            <span className="font-medium text-gray-700">
              {rolePermissions?.length || 0}
            </span>{" "}
            izin
          </div>
        </div>

        <InfoBanner
          title="Informasi"
          message="Halaman ini menampilkan daftar izin yang Anda miliki berdasarkan peran Anda dalam sistem. Izin ini bersifat read-only."
        />

        {isLoading ? (
          <LoadingState text="Memuat data izin..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data izin"
            message="Terjadi kesalahan pada server"
          />
        ) : (
          <div className="w-full">
            {!rolePermissions || rolePermissions.length === 0 ? (
              <EmptyState title="Tidak ada izin yang ditemukan untuk peran Anda" />
            ) : (
              <div className="space-y-6">
                {Object.entries(
                  groupPermissionsByResource<Permission>(rolePermissions)
                ).map(([resource, resourcePermissions]) => (
                  <ResourceGroup
                    key={resource}
                    resource={resource}
                    permissions={resourcePermissions}
                    isPermissionSelected={isPermissionSelected}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
