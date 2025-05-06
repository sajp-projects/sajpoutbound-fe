import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { useDeleteArmada, useArmada } from "@/hooks/armada";
import { formatDate } from "@/utils/date";
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showForbiddenAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { ArrowLeft, Edit, FileText, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

export default function DetailArmada() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch data armada
  const {
    data: armada,
    isLoading,
    isError,
    error,
    refetch,
  } = useArmada(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  // Mutation untuk menghapus armada
  const deleteArmadaMutation = useDeleteArmada({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Armada berhasil dihapus").then(() => {
        navigate("/armada");
      });
    },
    onError: (error) => {
      try {
        // Check for forbidden error
        if (error.message && error.message.includes("Forbidden")) {
          showForbiddenAlert(
            "Akses Ditolak",
            "Anda tidak memiliki akses untuk menghapus armada ini."
          );
        } else {
          const errorObj = JSON.parse(error.message);
          showErrorAlert(
            "Gagal Menghapus Armada",
            errorObj.message || "Terjadi kesalahan saat menghapus armada"
          );
        }
      } catch {
        showErrorAlert(
          "Gagal Menghapus Armada",
          error.message || "Terjadi kesalahan saat menghapus armada"
        );
      }
    },
  });

  // Handler untuk menghapus armada
  const handleDeleteArmada = () => {
    if (!armada) return;

    showDeleteConfirmationAlert(
      "Armada",
      `Apakah Anda yakin ingin menghapus armada "${armada.model}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteArmadaMutation.mutate({ id: id || "" });
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/armada">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Armada</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/armada/${id}/edit`}>
            <Button className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm text-sm font-medium text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit Armada
            </Button>
          </Link>
          <Button
            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md shadow-sm text-sm font-medium text-white"
            onClick={handleDeleteArmada}
            disabled={deleteArmadaMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteArmadaMutation.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Armada
            </h2>
            <p className="text-sm text-gray-500">
              Detail informasi armada kendaraan
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data armada..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data armada"
            message={
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan pada server"
            }
            onRetry={refetch}
            retryButtonText="Coba lagi"
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Data Armada
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Armada</p>
                      <p className="font-medium text-gray-900 font-mono bg-gray-50 p-1 rounded">
                        {armada?.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-medium text-blue-600">
                        {armada?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID SL</p>
                      <p className="font-medium text-gray-900">
                        {armada?.id_sl}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Plat Nomor</p>
                      <p className="font-medium text-gray-900">
                        {armada?.plateNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deskripsi</p>
                      <p className="font-medium text-gray-900">
                        {armada?.description || "-"}
                      </p>
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
                        {armada?.createdAt ? formatDate(armada.createdAt) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diperbarui
                      </p>
                      <p className="font-medium text-gray-900">
                        {armada?.updatedAt ? formatDate(armada.updatedAt) : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tindakan
                  </h3>
                  <div className="space-y-3">
                    <Link to={`/armada/${id}/log`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Lihat Log Armada
                      </Button>
                    </Link>
                    <Link to={`/armada/${id}/edit`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Armada
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={handleDeleteArmada}
                      disabled={deleteArmadaMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteArmadaMutation.isPending
                        ? "Menghapus..."
                        : "Hapus Armada"}
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
