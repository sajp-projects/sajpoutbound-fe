import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeleteUser, useUser } from '@/hooks/user';
import { cn } from '@/lib/utils';
import { getRoleBadgeColor, getRoleBadgeVariant } from '@/utils/badges';
import { formatDate } from '@/utils/date';
import { Archive, ArrowLeft, FileText, Pencil, RefreshCcw } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import Swal from 'sweetalert2';

export default function DetailPengguna() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useUser({ id: id || '' }, { staleTime: 5000, refetchOnMount: 'always' });

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Pengguna berhasil diarsipkan',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate('/pengguna');
      });
    },
    onError: (error) => {
      Swal.fire({
        title: 'Gagal!',
        text: `Gagal mengarsipkan pengguna: ${
          error.message || 'Terjadi kesalahan saat mengarsipkan pengguna.'
        }`,
        icon: 'error',
        confirmButtonText: 'Tutup',
      });
    },
  });

  const handleArsipkan = () => {
    Swal.fire({
      title: 'Konfirmasi Arsip',
      text: 'Apakah Anda yakin ingin mengarsipkan pengguna ini? Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Arsipkan!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser.mutate({ id: id || '' });
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/pengguna">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pengguna</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/pengguna/${id}/edit`}>
            <Button className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm text-sm font-medium text-white">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Pengguna
            </Button>
          </Link>
          <Button
            className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md shadow-sm text-sm font-medium text-white"
            onClick={handleArsipkan}
            disabled={deleteUser.isPending}
          >
            <Archive className="h-4 w-4 mr-2" />
            {deleteUser.isPending ? 'Mengarsipkan...' : 'Arsipkan'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
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
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-blue-600 font-medium">
                Memuat data pengguna...
              </p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="mt-4 text-red-600 font-medium">
                Gagal memuat data pengguna
              </p>
              <p className="text-sm text-gray-400">
                Terjadi kesalahan pada server
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-4"
              >
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Data Pengguna
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Pengguna</p>
                      <p className="font-medium text-gray-900">{user?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Lengkap</p>
                      <p className="font-medium text-blue-600">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Peran</p>
                      <div className="mt-1">
                        {user?.role && (
                          <Badge
                            variant={getRoleBadgeVariant(user.role.name)}
                            className={cn(
                              'px-2 py-0.5 rounded-md font-medium',
                              getRoleBadgeColor(user.role.name)
                            )}
                          >
                            {user.role.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Deskripsi Peran
                  </h3>
                  <p className="text-gray-700">
                    {user?.role?.description || '-'}
                  </p>
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
                        {user?.createdAt ? formatDate(user.createdAt) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diperbarui
                      </p>
                      <p className="font-medium text-gray-900">
                        {user?.updatedAt ? formatDate(user.updatedAt) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diarsipkan
                      </p>
                      <p className="font-medium text-gray-900">
                        {user?.deletedAt
                          ? formatDate(user.deletedAt)
                          : 'Belum diarsipkan'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Tindakan
                  </h3>
                  <div className="space-y-3">
                    <Link to={`/pengguna/${id}/log`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Lihat Log Aktivitas
                      </Button>
                    </Link>
                    <Link to={`/pengguna/${id}/edit`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Pengguna
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={handleArsipkan}
                      disabled={deleteUser.isPending}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      {deleteUser.isPending
                        ? 'Mengarsipkan...'
                        : 'Arsipkan Pengguna'}
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
