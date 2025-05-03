import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { useDeleteProduct, useProduct } from '@/hooks/barang';
import { formatDate } from '@/utils/date';
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showForbiddenAlert,
  showSuccessAlert,
} from '@/utils/sweetAlert';
import { ArrowLeft, Edit, History, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

export default function DetailBarang() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch detail barang
  const {
    data: barang,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(
    { id: id || '' },
    {
      staleTime: 5000,
      refetchOnMount: 'always',
    }
  );

  // Mutation untuk menghapus barang
  const deleteProductMutation = useDeleteProduct({
    onSuccess: () => {
      showSuccessAlert('Sukses!', 'Barang berhasil dihapus').then(() => {
        navigate('/barang');
      });
    },
    onError: (error) => {
      try {
        // Cek jika pesan error adalah Forbidden
        if (error.message && error.message.includes('Forbidden')) {
          showForbiddenAlert(
            'Akses Ditolak',
            'Anda tidak memiliki akses untuk menghapus barang ini.'
          );
        } else {
          const errorObj = JSON.parse(error.message);
          showErrorAlert(
            'Gagal Menghapus Barang',
            errorObj.message || 'Terjadi kesalahan saat menghapus barang'
          );
        }
      } catch {
        showErrorAlert(
          'Gagal Menghapus Barang',
          error.message || 'Terjadi kesalahan saat menghapus barang'
        );
      }
    },
  });

  // Fungsi untuk konfirmasi penghapusan
  const handleDeleteProduct = () => {
    if (!barang) return;

    showDeleteConfirmationAlert(
      'Barang',
      `Apakah Anda yakin ingin menghapus barang "${barang.name}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteProductMutation.mutate({ id: id || '' });
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/barang">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Barang</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/barang/${id}/edit`}>
            <Button className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm text-sm font-medium text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit Barang
            </Button>
          </Link>
          <Button
            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md shadow-sm text-sm font-medium text-white"
            onClick={handleDeleteProduct}
            disabled={deleteProductMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteProductMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
                : 'Terjadi kesalahan pada server'
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
                    Data Barang
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Barang</p>
                      <p className="font-medium text-gray-900 font-mono">
                        {barang?.id_sl}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Barang</p>
                      <p className="font-medium text-gray-900">
                        {barang?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Deskripsi</p>
                      <p className="font-medium text-gray-900">
                        {barang?.description || '-'}
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
                          <p className="text-gray-500 italic">
                            Tidak ada gudang
                          </p>
                        )}
                      </div>
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
                        {barang?.createdAt ? formatDate(barang.createdAt) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diperbarui
                      </p>
                      <p className="font-medium text-gray-900">
                        {barang?.updatedAt ? formatDate(barang.updatedAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tindakan
                  </h3>
                  <div className="space-y-3">
                    <Link to={`/barang/${id}/log`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <History className="h-4 w-4 mr-2" />
                        Lihat Log Barang
                      </Button>
                    </Link>
                    <Link to={`/barang/${id}/edit`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Barang
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={handleDeleteProduct}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleteProductMutation.isPending
                        ? 'Menghapus...'
                        : 'Hapus Barang'}
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
