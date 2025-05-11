import { useRole } from "@/hooks/role";
import {
  ArrowLeft,
  Edit,
  Users,
  Info,
  Mail,
  Calendar,
  User,
  Eye,
  Lock,
  Trash2,
  History,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { PERMISSION } from "@/constant/PERMISSION";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { useDeleteRole } from "@/hooks/role";

export default function DetailPeran() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"info" | "users">("info");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== "",
  });

  const hasPermissionAccess = (): boolean => {
    return hasPermission(
      permissions,
      PERMISSION.RESOURCES.PERMISSION,
      PERMISSION.ACTIONS.READ
    );
  };

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

  const {
    data: role,
    isLoading,
    isError,
    error,
  } = useRole(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
      retry: 1,
    }
  );

  const deleteRoleMutation = useDeleteRole({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Peran berhasil dihapus").then(() => {
        navigate("/peran");
      });
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Menghapus Peran",
        error.message || "Terjadi kesalahan saat menghapus peran"
      );
    },
  });

  const handleDeleteRole = () => {
    if (!role) return;

    showDeleteConfirmationAlert(
      "Peran",
      `Apakah Anda yakin ingin menghapus peran "${role.name}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteRoleMutation.mutate({ id: id || "" });
      }
    });
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/peran">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Peran</h1>
        </div>
        <div className="flex gap-2">
          {hasRoleUpdateAccess && (
            <Link to={`/peran/${id}/edit`}>
              <Button className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-amber-600 hover:bg-amber-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Peran
              </Button>
            </Link>
          )}
          {hasPermissionAccess() && (
            <Link to={`/peran/${id}/izin`}>
              <Button className="flex items-center px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700">
                <Lock className="w-4 h-4 mr-2" />
                Kelola Izin
              </Button>
            </Link>
          )}
          {hasRoleDeleteAccess && (
            <Button
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              onClick={handleDeleteRole}
              disabled={deleteRoleMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteRoleMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Peran
            </h2>
            <p className="text-sm text-gray-500">Detail peran dalam sistem</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data peran..." />
        ) : isError ? (
          <ErrorState
            title="Gagal Memuat Data Peran"
            message={error?.message || "Terjadi kesalahan pada server"}
            onRetry={() => navigate("/peran")}
            retryButtonText="Kembali ke Daftar Peran"
          />
        ) : (
          <div className="space-y-6">
            {}
            <div className="flex border-b border-gray-200">
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center",
                  activeTab === "info"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => setActiveTab("info")}
              >
                <Info className="w-4 h-4 mr-2" />
                Informasi Peran
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center",
                  activeTab === "users"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => setActiveTab("users")}
              >
                <Users className="w-4 h-4 mr-2" />
                Pengguna Terkait{" "}
                {role?.users && role.users.length > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {role.users.length}
                  </span>
                )}
              </button>
            </div>

            {}
            {activeTab === "info" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Data Peran
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Nama Peran</p>
                        <p
                          className="font-medium text-blue-600 wrap-text"
                          title={role?.name}
                        >
                          {role?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Deskripsi</p>
                        <p
                          className="font-medium text-gray-900 wrap-text"
                          title={role?.description}
                        >
                          {role?.description}
                        </p>
                      </div>
                    </div>
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
                          {role?.createdAt ? formatDate(role.createdAt) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tanggal Diperbarui
                        </p>
                        <p className="font-medium text-gray-900">
                          {role?.updatedAt ? formatDate(role.updatedAt) : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900">
                          {role?.deletedAt ? "Tidak Aktif" : "Aktif"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Tindakan
                    </h3>
                    <div className="space-y-3">
                      <Link to={`/peran/${id}/log`} className="w-full">
                        <Button
                          variant="outline"
                          className="justify-start w-full"
                        >
                          <History className="w-4 h-4 mr-2" />
                          Lihat Log Peran
                        </Button>
                      </Link>
                      {hasRoleUpdateAccess && (
                        <Link to={`/peran/${id}/edit`} className="w-full">
                          <Button
                            variant="outline"
                            className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Peran
                          </Button>
                        </Link>
                      )}
                      {hasPermissionAccess() && (
                        <Link to={`/peran/${id}/izin`} className="w-full">
                          <Button
                            variant="outline"
                            className="justify-start w-full text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Kelola Izin Peran
                          </Button>
                        </Link>
                      )}
                      {hasRoleDeleteAccess && (
                        <Button
                          variant="outline"
                          className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={handleDeleteRole}
                          disabled={deleteRoleMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleteRoleMutation.isPending
                            ? "Menghapus..."
                            : "Hapus Peran"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Pengguna dengan Peran {role?.name}
                    </h3>
                    {role?.users && (
                      <span className="text-sm text-gray-500">
                        Total:{" "}
                        <span className="font-medium text-gray-700">
                          {role.users.length}
                        </span>{" "}
                        pengguna
                      </span>
                    )}
                  </div>

                  {}
                  {!role?.users || role.users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-gray-300 border-dashed rounded-lg">
                      <Users className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="font-medium text-gray-600">
                        Tidak ada pengguna yang memiliki peran ini
                      </p>
                      <p className="max-w-md mt-2 text-sm text-gray-500">
                        Belum ada pengguna yang ditetapkan dengan peran{" "}
                        {role?.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {}
                      <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-gray-200 bg-gray-50">
                                <TableHead className="w-[50px] font-semibold text-gray-700 py-4">
                                  ID
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">
                                  Nama
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">
                                  Email
                                </TableHead>
                                <TableHead className="hidden py-4 font-semibold text-gray-700 md:table-cell">
                                  Tgl. Bergabung
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-center text-gray-700">
                                  Status
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-center text-gray-700">
                                  Aksi
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {role.users.map((user, idx) => (
                                <TableRow
                                  key={user.id}
                                  className={cn(
                                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  )}
                                >
                                  <TableCell className="font-medium text-center">
                                    {idx + 1}
                                  </TableCell>
                                  <TableCell className="font-medium text-blue-600">
                                    {user.name}
                                  </TableCell>
                                  <TableCell className="text-gray-600">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                      <span
                                        className="truncate-text"
                                        title={user.email}
                                      >
                                        {user.email}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="hidden text-gray-500 md:table-cell">
                                    {formatDate(user.createdAt)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span
                                      className={cn(
                                        "px-2 py-1 text-xs rounded-full",
                                        user.deletedAt
                                          ? "bg-red-100 text-red-700"
                                          : "bg-green-100 text-green-700"
                                      )}
                                    >
                                      {user.deletedAt ? "Tidak Aktif" : "Aktif"}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                      <Link to={`/pengguna/${user.id}`}>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          title="Lihat Detail"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </Link>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {}
                      <div className="space-y-4 sm:hidden">
                        {role.users.map((user) => (
                          <div
                            key={user.id}
                            className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                          >
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-medium text-blue-600">
                                  {user.name}
                                </h3>
                                <span
                                  className={cn(
                                    "px-2 py-1 text-xs rounded-full",
                                    user.deletedAt
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  )}
                                >
                                  {user.deletedAt ? "Tidak Aktif" : "Aktif"}
                                </span>
                              </div>

                              <div className="mt-3 space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                  <span
                                    className="truncate-text"
                                    title={user.email}
                                  >
                                    {user.email}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                  <span
                                    className="truncate-text"
                                    title={`Bergabung: ${formatDate(
                                      user.createdAt
                                    )}`}
                                  >
                                    Bergabung: {formatDate(user.createdAt)}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <User className="w-4 h-4 mr-2 text-gray-400" />
                                  <span
                                    className="truncate-text"
                                    title={`ID: ${user.id}`}
                                  >
                                    ID: {user.id}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
                                <Link to={`/pengguna/${user.id}`}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="Lihat Detail"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
