import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCreateWarehouse } from '@/hooks/gudang';
import { useUsers } from '@/hooks/user';
import { cn } from '@/lib/utils';
import { FormErrorData, FormErrors } from '@/utils/errorHandler';
import {
  isConfirmed,
  showConfirmationAlert,
  showSuccessAlert,
} from '@/utils/sweetAlert';
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

interface WarehouseFormData {
  name: string;
  description: string;
  userId?: string;
}

type WarehouseFormErrors = FormErrors<WarehouseFormData> & {
  general?: string;
};

export default function TambahGudang() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    description: '',
    userId: '',
  });
  const [errors, setErrors] = useState<WarehouseFormErrors>({});

  
  const { data: usersData } = useUsers({
    staleTime: 300000, 
  });
  const users = usersData?.users || [];

  const createWarehouseMutation = useCreateWarehouse({
    onSuccess: (data) => {
      showSuccessAlert('Sukses!', 'Gudang berhasil ditambahkan').then(() => {
        navigate(`/gudang/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message) as FormErrorData;

        if (
          errorObj.errorType === 'joiValidationError' &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          const newErrors: WarehouseFormErrors = {};

          errorObj.details.forEach((detail) => {
            if (detail.path.includes('name')) {
              newErrors.name = detail.message;
            } else if (detail.path.includes('description')) {
              newErrors.description = detail.message;
            } else if (detail.path.includes('userId')) {
              newErrors.userId = detail.message;
            } else {
              newErrors.general = detail.message;
            }
          });

          setErrors(newErrors);
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: 'Terjadi kesalahan saat menambahkan gudang' });
      }
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    
    const submissionData = {
      ...formData,
      userId: formData.userId === '' ? undefined : formData.userId,
    };

    showConfirmationAlert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menambahkan gudang baru ini?',
      'Ya, Tambahkan!',
      'Batal'
    ).then((result) => {
      if (isConfirmed(result)) {
        createWarehouseMutation.mutate(submissionData);
      }
    });
  };

  const isSubmitting = createWarehouseMutation.isPending;

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Gudang</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Gudang Baru</CardTitle>
          <CardDescription>
            Isi data gudang yang akan ditambahkan ke sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  className={cn(
                    'mt-1 w-full border-gray-300',
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'focus:border-blue-500 focus:ring-blue-500'
                  )}
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
                <div className="flex flex-col items-start mt-1 sm:flex-row sm:items-center">
                  <select
                    id="userId"
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className={cn(
                      'w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm max-w-full overflow-hidden text-ellipsis',
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
                  {formData.userId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-red-600 border-red-200 sm:ml-2 sm:mt-0 hover:text-red-800 hover:border-red-300 hover:bg-red-50 sm:w-auto"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, userId: '' }))
                      }
                      title="Hapus penanggung jawab"
                    >
                      Hapus
                    </Button>
                  )}
                </div>
                {formData.userId && <div className="mt-2 sm:hidden"></div>}
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
                onClick={() => navigate('/gudang')}
                disabled={isSubmitting}
                type="button"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-white bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
