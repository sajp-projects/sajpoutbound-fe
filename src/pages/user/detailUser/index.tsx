import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/permission";
import { useDeleteUser, useUser } from "@/hooks/user";
import { cn } from "@/lib/utils";
import { UserWithRole } from "@/types/user";
import { getRoleBadgeColor, getRoleBadgeVariant } from "@/utils/badges";
import { formatDate } from "@/utils/date";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { Archive, ArrowLeft, Edit, History, Warehouse } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

// Interface tambahan untuk response user detail yang menyertakan data warehouse
interface UserDetailResponse extends UserWithRole {
  warehouse?: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export default function DetailPengguna() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

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

  const hasWarehouseReadAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.WAREHOUSE,
    PERMISSION.ACTIONS.READ
  );

  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = useUser({ id: id || "" }, { staleTime: 5000, refetchOnMount: "always" });

  // Cast data ke interface yang memiliki warehouse
  const user = userData as UserDetailResponse | undefined;

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengguna berhasil diarsipkan").then(() => {
        navigate("/pengguna");
      });
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal!",
        `Gagal mengarsipkan pengguna: ${
          error.message || "Terjadi kesalahan saat mengarsipkan pengguna."
        }`
      );
    },
  });

  const handleArsipkan = () => {
    showConfirmationAlert(
      "Konfirmasi Arsip",
      "Apakah Anda yakin ingin mengarsipkan pengguna ini? Tindakan ini tidak dapat dibatalkan.",
      "Ya, Arsipkan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteUser.mutate({ id: id || "" });
      }
    });
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/pengguna">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pengguna</h1>
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Pengguna
            </h2>
            <p className="text-sm text-gray-500">
              Detail informasi pengguna sistem
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pengguna..." />
        ) : isError ? (
          <ErrorState
            title="Gagal Memuat Data Pengguna"
            message={error?.message || "Terjadi kesalahan pada server"}
            onRetry={() => navigate("/pengguna")}
            retryButtonText="Kembali ke Daftar Pengguna"
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Data Pengguna
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nama Lengkap</p>
                      <p
                        className="font-medium text-blue-600 wrap-text"
                        title={user?.name}
                      >
                        {user?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p
                        className="font-medium text-gray-900 wrap-text"
                        title={user?.email}
                      >
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Peran</p>
                      <div className="mt-1">
                        {user?.role && (
                          <Badge
                            variant={getRoleBadgeVariant(user.role.name)}
                            className={cn(
                              "px-2 py-0.5 rounded-md font-medium",
                              getRoleBadgeColor(user.role.name)
                            )}
                          >
                            {user.role.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gudang</p>
                      <div className="mt-1">
                        {user?.warehouse ? (
                          hasWarehouseReadAccess ? (
                            <Link to={`/gudang/${user.warehouse.id}`}>
                              <div className="flex items-center text-blue-600 hover:text-blue-800">
                                <Warehouse className="w-4 h-4 mr-1" />
                                <span className="font-medium">
                                  {user.warehouse.name}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <div className="flex items-center text-gray-700">
                              <Warehouse className="w-4 h-4 mr-1" />
                              <span className="font-medium">
                                {user.warehouse.name}
                              </span>
                            </div>
                          )
                        ) : (
                          <span className="text-gray-500">
                            Tidak ada gudang
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Deskripsi Peran
                  </h3>
                  <p className="text-gray-700">
                    {user?.role?.description || "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Informasi Waktu
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                      <p className="font-medium text-gray-900">
                        {user?.createdAt ? formatDate(user.createdAt) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diperbarui
                      </p>
                      <p className="font-medium text-gray-900">
                        {user?.updatedAt ? formatDate(user.updatedAt) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diarsipkan
                      </p>
                      <p className="font-medium text-gray-900">
                        {user?.deletedAt
                          ? formatDate(user.deletedAt)
                          : "Belum diarsipkan"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Tindakan
                  </h3>
                  <div className="space-y-3">
                    <Link to={`/pengguna/${id}/log`} className="w-full">
                      <Button
                        variant="outline"
                        className="justify-start w-full"
                      >
                        <History className="w-4 h-4 mr-2" />
                        Lihat Log Aktivitas
                      </Button>
                    </Link>
                    {hasUserUpdateAccess && (
                      <Link to={`/pengguna/${id}/edit`} className="w-full">
                        <Button
                          variant="outline"
                          className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Pengguna
                        </Button>
                      </Link>
                    )}
                    {hasUserDeleteAccess && user && !user.deletedAt && (
                      <Button
                        variant="outline"
                        className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={handleArsipkan}
                        disabled={deleteUser.isPending}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        {deleteUser.isPending
                          ? "Mengarsipkan..."
                          : "Arsipkan Pengguna"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
