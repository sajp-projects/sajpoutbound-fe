import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Pagination } from "@/components/Pagination";
import { usePermissions, useRolePermissions } from "@/hooks/izin";
import { useRole } from "@/hooks/role";
import { Permission } from "@/types/izin";
import { groupPermissionsByResource } from "@/utils/permission";
import { useMemo } from "react";
import { useParams } from "react-router";
import { InfoBanner, PageHeader, ResourceGroup } from "./_components";

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
  } = useRolePermissions(id || "", {
    enabled: !!id,
    refetchOnMount: true,
  });

  const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;
  const isError = roleError || permissionsError || rolePermissionsError;

  const groupedPermissions = useMemo(() => {
    return groupPermissionsByResource<Permission>(
      permissionsData?.permissions || []
    );
  }, [permissionsData?.permissions]);

  const isPermissionSelected = (permissionId: string) => {
    return (
      rolePermissions?.some((permission) => permission.id === permissionId) ||
      false
    );
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <PageHeader roleName={roleData?.name || ""} roleId={id || ""} />

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Daftar Izin
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Lihat izin yang dimiliki oleh peran ini
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
          title="Informasi"
          message="Halaman ini menampilkan daftar izin yang dimiliki oleh peran ini dalam mode baca saja. Untuk mengelola izin peran, silakan gunakan halaman Peran."
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
