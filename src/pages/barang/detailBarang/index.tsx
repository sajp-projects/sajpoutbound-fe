import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { useDeleteProduct, useProduct } from "@/hooks/barang";
import { formatDate } from "@/utils/date";
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { ArrowLeft, Edit, History, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { PERMISSION } from "@/constant/PERMISSION";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";

export default function DetailBarang() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const hasProductUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PRODUCT,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasProductDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PRODUCT,
    PERMISSION.ACTIONS.DELETE
  );

  const {
    data: barang,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  const deleteProductMutation = useDeleteProduct({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Barang berhasil dihapus").then(() => {
        navigate("/barang");
      });
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Menghapus Barang",
        error.message || "Terjadi kesalahan saat menghapus barang"
      );
    },
  });

  const handleDeleteProduct = () => {
    if (!barang) return;

    showDeleteConfirmationAlert(
      "Barang",
      `Apakah Anda yakin ingin menghapus barang "${barang.name}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteProductMutation.mutate({ id: id || "" });
      }
    });
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/barang">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Barang</h1>
        </div>
        <div className="flex gap-2">
          {hasProductUpdateAccess && (
            <Link to={`/barang/${id}/edit`}>
              <Button className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-amber-600 hover:bg-amber-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Barang
              </Button>
            </Link>
          )}
          {hasProductDeleteAccess && (
            <Button
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              onClick={handleDeleteProduct}
              disabled={deleteProductMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteProductMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Barang
            </h2>
            <p className="text-sm text-gray-500">
              Detail lengkap informasi barang
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data barang..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data barang"
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
                    Data Barang
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p
                        className="p-1 font-mono font-medium text-gray-900 rounded bg-gray-50 wrap-text"
                        title={barang?.id_sl}
                      >
                        {barang?.id_sl}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Barang</p>
                      <p
                        className="font-medium text-blue-600 wrap-text"
                        title={barang?.name}
                      >
                        {barang?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Satuan</p>
                      <p
                        className="font-medium text-gray-900 wrap-text"
                        title={barang?.satuan || "-"}
                      >
                        {barang?.satuan || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deskripsi</p>
                      <p
                        className="font-medium text-gray-900 wrap-text"
                        title={barang?.description || "-"}
                      >
                        {barang?.description || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gudang</p>
                      <div className="mt-1">
                        {barang?.warehouse ? (
                          <Link
                            to={`/gudang/${barang.warehouse.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {barang.warehouse.name}
                          </Link>
                        ) : (
                          <p className="italic text-gray-500">
                            Tidak ada gudang
                          </p>
                        )}
                      </div>
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
                        {barang?.createdAt ? formatDate(barang.createdAt) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diperbarui
                      </p>
                      <p className="font-medium text-gray-900">
                        {barang?.updatedAt ? formatDate(barang.updatedAt) : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Tindakan
                  </h3>
                  <div className="space-y-3">
                    <Link to={`/barang/${id}/log`} className="w-full">
                      <Button
                        variant="outline"
                        className="justify-start w-full"
                      >
                        <History className="w-4 h-4 mr-2" />
                        Lihat Log Barang
                      </Button>
                    </Link>
                    {hasProductUpdateAccess && (
                      <Link to={`/barang/${id}/edit`} className="w-full">
                        <Button
                          variant="outline"
                          className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Barang
                        </Button>
                      </Link>
                    )}
                    {hasProductDeleteAccess && (
                      <Button
                        variant="outline"
                        className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={handleDeleteProduct}
                        disabled={deleteProductMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deleteProductMutation.isPending
                          ? "Menghapus..."
                          : "Hapus Barang"}
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
