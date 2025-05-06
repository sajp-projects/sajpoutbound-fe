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

export default function DetailPelanggan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/pelanggan">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pelanggan</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/pelanggan/${id}/edit`}>
            <Button className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm text-sm font-medium text-white">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Pelanggan
            </Button>
          </Link>
          <Button
            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md shadow-sm text-sm font-medium text-white"
            onClick={handleHapus}
            disabled={deleteCustomer.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteCustomer.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Data Pelanggan
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Pelanggan</p>
                      <p className="font-medium text-gray-900">
                        {customer?.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Pelanggan</p>
                      <p className="font-medium text-blue-600">
                        {customer?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID SL</p>
                      <p className="font-medium text-gray-900">
                        {customer?.id_sl}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p className="font-medium text-gray-900">
                        {customer?.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Statistik Delivery Order
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Total DO</p>
                      <p className="font-medium text-blue-600 text-xl">0</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">
                        Total Barang Keluar
                      </p>
                      <p className="font-medium text-green-600 text-xl">0</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
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

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tindakan
                  </h3>
                  <div className="space-y-3">
                    <Link to={`/pelanggan/${id}/log`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Lihat Log Aktivitas
                      </Button>
                    </Link>
                    <Link to={`/pelanggan/${id}/edit`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Pelanggan
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={handleHapus}
                      disabled={deleteCustomer.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteCustomer.isPending
                        ? "Menghapus..."
                        : "Hapus Pelanggan"}
                    </Button>
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
