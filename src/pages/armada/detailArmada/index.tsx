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

  const deleteArmadaMutation = useDeleteArmada({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Armada berhasil dihapus").then(() => {
        navigate("/armada");
      });
    },
    onError: (error) => {
      try {
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
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/armada">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Armada</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/armada/${id}/edit`}>
            <Button className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-amber-600 hover:bg-amber-700">
              <Edit className="w-4 h-4 mr-2" />
              Edit Armada
            </Button>
          </Link>
          <Button
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
            onClick={handleDeleteArmada}
            disabled={deleteArmadaMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {deleteArmadaMutation.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Data Armada
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p
                        className="p-1 font-mono font-medium text-gray-900 rounded bg-gray-50 wrap-text"
                        title={armada?.id_sl}
                      >
                        {armada?.id_sl}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p
                        className="font-medium text-blue-600 wrap-text"
                        title={armada?.model}
                      >
                        {armada?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Plat Nomor</p>
                      <p
                        className="font-medium text-gray-900 wrap-text"
                        title={armada?.plateNumber}
                      >
                        {armada?.plateNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deskripsi</p>
                      <p
                        className="font-medium text-gray-900 wrap-text"
                        title={armada?.description || "-"}
                      >
                        {armada?.description || "-"}
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

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Tindakan
                  </h3>
                  <div className="space-y-3">
                    <Link to={`/armada/${id}/log`} className="w-full">
                      <Button
                        variant="outline"
                        className="justify-start w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Lihat Log Armada
                      </Button>
                    </Link>
                    <Link to={`/armada/${id}/edit`} className="w-full">
                      <Button
                        variant="outline"
                        className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Armada
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={handleDeleteArmada}
                      disabled={deleteArmadaMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
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
