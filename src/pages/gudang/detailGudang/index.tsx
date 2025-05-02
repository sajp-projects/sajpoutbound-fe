import { Button } from "@/components/ui/button";
import { useWarehouse, useDeleteWarehouse } from "@/hooks/gudang";
import { formatDate } from "@/utils/date";
import { ArrowLeft, Edit, History, RefreshCcw, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { showSuccessAlert, showErrorAlert, showDeleteConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";

export default function DetailGudang() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch detail gudang
  const {
    data: gudang,
    isLoading,
    isError,
    error,
    refetch,
  } = useWarehouse(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  // Mutation untuk menghapus gudang
  const deleteWarehouseMutation = useDeleteWarehouse({
    onSuccess: () => {
      // Ganti Swal.fire dengan showSuccessAlert
      showSuccessAlert("Sukses!", "Gudang berhasil dihapus").then(() => {
        navigate("/gudang");
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message);
        // Ganti Swal.fire dengan showErrorAlert
        showErrorAlert("Gagal menghapus gudang", errorObj.message || "Terjadi kesalahan saat menghapus gudang");
      } catch {
        // Ganti Swal.fire dengan showErrorAlert
        showErrorAlert("Gagal menghapus gudang", "Terjadi kesalahan saat menghapus gudang");
      }
    },
  });

  // Fungsi untuk konfirmasi penghapusan
  const handleDeleteWarehouse = () => {
    if (!gudang) return;

    // Ganti Swal.fire dengan showDeleteConfirmationAlert
    showDeleteConfirmationAlert("Gudang", `Apakah Anda yakin ingin menghapus gudang "${gudang.name}"?`).then((result) => {
      if (isConfirmed(result)) {
        deleteWarehouseMutation.mutate({ id: id || "" });
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/gudang">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Gudang</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/gudang/${id}/edit`}>
            <Button className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm text-sm font-medium text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit Gudang
            </Button>
          </Link>
          <Button className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md shadow-sm text-sm font-medium text-white" onClick={handleDeleteWarehouse} disabled={deleteWarehouseMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteWarehouseMutation.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Informasi Gudang</h2>
            <p className="text-sm text-gray-500">Detail lengkap informasi gudang penyimpanan</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-blue-600 font-medium">Memuat data gudang...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="mt-4 text-red-600 font-medium">Gagal memuat data gudang</p>
              <p className="text-sm text-gray-400">{error instanceof Error ? error.message : "Terjadi kesalahan pada server"}</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Coba lagi
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Data Gudang</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Gudang</p>
                      <p className="font-medium text-gray-900 font-mono bg-gray-50 p-1 rounded">{gudang?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Gudang</p>
                      <p className="font-medium text-blue-600">{gudang?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deskripsi</p>
                      <p className="font-medium text-gray-900">{gudang?.description || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pengelola</p>
                      <div className="mt-1">
                        {gudang?.user ? (
                          <Link to={`/pengguna/${gudang.user.id}`} className="text-blue-600 hover:underline">
                            {gudang.user.name}
                          </Link>
                        ) : (
                          <p className="text-gray-500 italic">Tidak ada pengelola</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Waktu</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                      <p className="font-medium text-gray-900">{gudang?.createdAt ? formatDate(gudang.createdAt) : "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Diperbarui</p>
                      <p className="font-medium text-gray-900">{gudang?.updatedAt ? formatDate(gudang.updatedAt) : "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tindakan</h3>
                  <div className="space-y-3">
                    <Link to={`/gudang/${id}/log`} className="w-full">
                      <Button variant="outline" className="w-full justify-start">
                        <History className="h-4 w-4 mr-2" />
                        Lihat Log Gudang
                      </Button>
                    </Link>
                    <Link to={`/gudang/${id}/edit`} className="w-full">
                      <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Gudang
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={handleDeleteWarehouse} disabled={deleteWarehouseMutation.isPending}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteWarehouseMutation.isPending ? "Menghapus..." : "Hapus Gudang"}
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
