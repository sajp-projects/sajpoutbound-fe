import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUpdateWarehouse, useWarehouse } from '@/hooks/gudang';
import { useUsers } from '@/hooks/user';
import { cn } from '@/lib/utils';
import { FormErrors } from '@/utils/errorHandler';
import {
  isConfirmed,
  showConfirmationAlert,
  showSuccessAlert,
} from '@/utils/sweetAlert';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

// Type untuk form edit warehouse
interface WarehouseFormData {
  name: string;
  description: string;
  userId?: string;
}

type WarehouseFormErrors = FormErrors<WarehouseFormData> & {
  general?: string;
};

export default function EditGudang() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    description: '',
    userId: '',
  });

  // State untuk melacak apakah user sedang mengubah penanggung jawab
  const [isChangingUser, setIsChangingUser] = useState(false);

  // State untuk error validasi
  const [errors, setErrors] = useState<WarehouseFormErrors>({});

  // Fetch detail gudang
  const {
    data: gudang,
    isLoading,
    isError,
    error,
    refetch,
  } = useWarehouse(
    { id: id || '' },
    {
      staleTime: 5000,
      refetchOnMount: 'always',
    }
  );

  // Fetch daftar pengguna untuk dropdown hanya jika sedang mengubah user
  const { data: usersData } = useUsers({
    staleTime: 300000, // 5 menit
    enabled: isChangingUser, // Hanya fetch jika sedang mengubah user
  });
  const users = usersData?.users || [];

  // Set form data dari gudang yang diterima
  useEffect(() => {
    if (gudang) {
      setFormData({
        name: gudang.name || '',
        description: gudang.description || '',
        userId: gudang.user?.id || '',
      });
    }
  }, [gudang]);

  // Mutation untuk update gudang
  const updateWarehouseMutation = useUpdateWarehouse({
    onSuccess: (data) => {
      showSuccessAlert('Sukses!', 'Gudang berhasil diperbarui').then(() => {
        navigate(`/gudang/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message);

        if (
          errorObj.errorType === 'joiValidationError' &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          const newErrors: WarehouseFormErrors = {};

          errorObj.details.forEach(
            (detail: { message: string; path: string[] }) => {
              if (detail.path.includes('name')) {
                newErrors.name = detail.message;
              } else if (detail.path.includes('description')) {
                newErrors.description = detail.message;
              } else if (detail.path.includes('userId')) {
                newErrors.userId = detail.message;
              } else {
                newErrors.general = detail.message;
              }
            }
          );

          setErrors(newErrors);
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: 'Terjadi kesalahan saat memperbarui gudang' });
      }
    },
  });

  // Handler untuk perubahan form
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof WarehouseFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler untuk mulai mengubah user
  const handleChangeUser = () => {
    setIsChangingUser(true);
  };

  // Handler untuk batalkan mengubah user
  const handleCancelChangeUser = () => {
    if (gudang?.user) {
      setFormData((prev) => ({ ...prev, userId: gudang.user?.id || '' }));
    }
    setIsChangingUser(false);
  };

  // Handler untuk submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Jika userId adalah string kosong, kirim undefined
    const submissionData = {
      ...formData,
      userId: formData.userId === '' ? null : formData.userId,
    };

    // Tampilkan konfirmasi sebelum mengubah gudang
    showConfirmationAlert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menyimpan perubahan data gudang ini?',
      'Ya, Simpan!',
      'Batal'
    ).then((result) => {
      if (isConfirmed(result)) {
        updateWarehouseMutation.mutate({
          id: id || '',
          ...submissionData,
        });
      }
    });
  };

  const isSubmitting = updateWarehouseMutation.isPending;

  // Helper function untuk class input
  const inputClassName = (fieldName: keyof WarehouseFormData) =>
    cn(
      'mt-1 w-full border-gray-300',
      errors[fieldName]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'focus:border-blue-500 focus:ring-blue-500'
    );

  // Periksa apakah gudang memiliki user yang terkait dan user belum memilih untuk mengubahnya
  const hasAssignedUser = gudang?.user?.id && !isChangingUser;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to={`/gudang/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Gudang</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Gudang</CardTitle>
          <CardDescription>Perbarui informasi gudang yang ada</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Memuat data gudang..." />
          ) : isError ? (
            <ErrorState
              title="Gagal memuat data"
              message={
                error instanceof Error
                  ? error.message
                  : 'Terjadi kesalahan pada server'
              }
              onRetry={refetch}
              retryButtonText="Coba lagi"
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nama Gudang
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama gudang"
                    className={inputClassName('name')}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Nama untuk mengidentifikasi gudang
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Penanggung Jawab
                  </label>
                  {hasAssignedUser ? (
                    <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center">
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 sm:w-auto break-words">
                        {gudang.user?.name} ({gudang.user?.email})
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 sm:mt-0 ml-0 sm:ml-2 text-blue-600 hover:text-blue-800 w-full sm:w-auto justify-center"
                        onClick={handleChangeUser}
                      >
                        Ubah
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col sm:flex-row">
                        <select
                          id="userId"
                          name="userId"
                          value={formData.userId}
                          onChange={handleInputChange}
                          className={cn(
                            'w-full block py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm max-w-full overflow-hidden text-ellipsis',
                            errors.userId &&
                              'border-red-300 focus:border-red-500 focus:ring-red-500'
                          )}
                        >
                          <option value="">
                            -- Pilih Penanggung Jawab (Opsional) --
                          </option>
                          {users && users.length > 0 ? (
                            users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              Tidak ada pengguna tersedia
                            </option>
                          )}
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 sm:mt-0 sm:ml-2 text-red-600 hover:text-red-800 border-red-200 hover:border-red-300 hover:bg-red-50 w-full sm:w-auto"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, userId: '' }))
                          }
                          title="Hapus penanggung jawab"
                        >
                          Hapus
                        </Button>
                      </div>
                      {isChangingUser && gudang?.user && (
                        <div className="mt-1 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            onClick={handleCancelChangeUser}
                          >
                            Batalkan Perubahan
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  {errors.userId ? (
                    <p className="mt-1 text-sm text-red-500">{errors.userId}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Pilih pengguna yang bertanggung jawab untuk gudang ini
                      (opsional)
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Deskripsikan fungsi dan lokasi gudang"
                    className={cn(
                      'mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                      errors.description &&
                        'border-red-300 focus:border-red-500 focus:ring-red-500'
                    )}
                  />
                  {errors.description ? (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Deskripsikan fungsi dan lokasi gudang
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/gudang/${id}`)}
                  disabled={isSubmitting}
                  type="button"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
