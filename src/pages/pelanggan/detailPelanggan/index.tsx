import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { useDeleteCustomer, useCustomer } from "@/hooks/pelanggan";
import { formatDate } from "@/utils/date";
import {
  showSuccessAlert,
  showErrorAlert,
  showForbiddenAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { ArrowLeft, FileText, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { PERMISSION } from "@/constant/PERMISSION";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";

export default function DetailPelanggan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const hasCustomerUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.CUSTOMER,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasCustomerDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.CUSTOMER,
    PERMISSION.ACTIONS.DELETE
  );

  const {
    data: customer,
    isLoading,
    isError,
    refetch,
  } = useCustomer(
    { id: id || "" },
    { staleTime: 5000, refetchOnMount: "always" }
  );

  const deleteCustomer = useDeleteCustomer({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pelanggan berhasil dihapus").then(() => {
        navigate("/pelanggan");
      });
    },
    onError: (error) => {
      if (error.message.includes("Forbidden")) {
        showForbiddenAlert(
          "Akses Ditolak",
          "Anda tidak memiliki akses untuk menghapus pelanggan ini."
        );
      } else {
        showErrorAlert(
          "Gagal!",
          `Gagal menghapus pelanggan: ${
            error.message || "Terjadi kesalahan saat menghapus pelanggan."
          }`
        );
      }
    },
  });

  const handleHapus = () => {
    showConfirmationAlert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.",
      "Ya, Hapus!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteCustomer.mutate({ id: id || "" });
      }
    });
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/pelanggan">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pelanggan</h1>
        </div>
        <div className="flex gap-2">
          {hasCustomerUpdateAccess && (
            <Link to={`/pelanggan/${id}/edit`}>
              <Button className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-amber-600 hover:bg-amber-700">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Pelanggan
              </Button>
            </Link>
          )}
          {hasCustomerDeleteAccess && (
            <Button
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              onClick={handleHapus}
              disabled={deleteCustomer.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteCustomer.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Pelanggan
            </h2>
            <p className="text-sm text-gray-500">
              Detail informasi pelanggan sistem
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pelanggan..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data pelanggan"
            message="Terjadi kesalahan pada server"
            onRetry={refetch}
            retryButtonText="Coba lagi"
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Data Pelanggan
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p
                        className="p-1 font-mono font-medium text-gray-900 rounded bg-gray-50 wrap-text"
                        title={customer?.id_sl}
                      >
                        {customer?.id_sl}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Pelanggan</p>
                      <p
                        className="font-medium text-blue-600 wrap-text"
                        title={customer?.name}
                      >
                        {customer?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p
                        className="font-medium text-gray-900 wrap-text"
                        title={customer?.address}
                      >
                        {customer?.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Statistik Delivery Order
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <p className="text-sm text-gray-500">Total DO</p>
                      <p className="text-xl font-medium text-blue-600">0</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <p className="text-sm text-gray-500">
                        Total Barang Keluar
                      </p>
                      <p className="text-xl font-medium text-green-600">0</p>
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
                        {customer?.createdAt
                          ? formatDate(customer.createdAt)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diperbarui
                      </p>
                      <p className="font-medium text-gray-900">
                        {customer?.updatedAt
                          ? formatDate(customer.updatedAt)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Tindakan
                  </h3>
                  <div className="space-y-3">
                    <Link to={`/pelanggan/${id}/log`} className="w-full">
                      <Button
                        variant="outline"
                        className="justify-start w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Lihat Log Aktivitas
                      </Button>
                    </Link>
                    {hasCustomerUpdateAccess && (
                      <Link to={`/pelanggan/${id}/edit`} className="w-full">
                        <Button
                          variant="outline"
                          className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit Pelanggan
                        </Button>
                      </Link>
                    )}
                    {hasCustomerDeleteAccess && (
                      <Button
                        variant="outline"
                        className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={handleHapus}
                        disabled={deleteCustomer.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleteCustomer.isPending
                          ? "Menghapus..."
                          : "Hapus Pelanggan"}
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
