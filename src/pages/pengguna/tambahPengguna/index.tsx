import { useAllRoles } from '@/hooks/role';
import { useCreateUser } from '@/hooks/user';
import { cn } from '@/lib/utils';
import { Role } from '@/types/role';
import { CreateUserInput } from '@/types/user';
import { AlertTriangle, Loader2, Save } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PERMISSION } from '@/constant/PERMISSION';
import { useAuth } from '@/hooks/auth';
import { useRolePermissions } from '@/hooks/izin';
import { FormErrorData, FormErrors } from '@/utils/errorHandler';
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from '@/utils/sweetAlert';

// Type untuk form tambah user
interface UserFormData {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

// Interface untuk error validation
type UserFormErrors = FormErrors<UserFormData> & {
  general?: string;
};

// Component untuk field form yang digunakan berulang kali
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  helpText?: string;
}

function FormField({ id, label, error, children, helpText }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
}

export default function TambahPengguna() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Get roleId dari localStorage untuk cek permission
  const userData = localStorage.getItem('user');
  const currentUserRoleId = userData ? JSON.parse(userData)?.roleId : null;

  // Fetch permissions untuk memeriksa apakah user memiliki akses ke role:READ
  const { data: permissions } = useRolePermissions(currentUserRoleId, {
    enabled: isAuthenticated && !!currentUserRoleId && currentUserRoleId !== '',
  });

  // Fungsi untuk memeriksa apakah user memiliki izin role:READ
  const hasRoleReadPermission = (): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return permissions.some(
      (permission) =>
        permission.resource === PERMISSION.RESOURCES.ROLE &&
        permission.action === PERMISSION.ACTIONS.READ
    );
  };

  // State untuk form
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    roleId: '',
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<UserFormErrors>({});

  // Query untuk mendapatkan daftar role - menggunakan useAllRoles untuk mendapatkan semua data
  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
  } = useAllRoles({
    enabled: hasRoleReadPermission(), // Hanya fetch jika memiliki izin
  });

  // Pastikan roles selalu array dengan mengakses rolesData.roles jika ada
  const roles = rolesData?.roles || [];

  // Tampilkan peringatan jika tidak punya akses ke roles
  useEffect(() => {
    if (!hasRoleReadPermission()) {
      // Tampilkan peringatan setelah komponen di-render
      showErrorAlert(
        'Akses Terbatas',
        'Anda tidak memiliki izin untuk melihat daftar peran. Anda tidak akan dapat menambahkan pengguna baru tanpa menetapkan peran yang valid.'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions]);

  // Mutation untuk membuat user baru
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      // Tampilkan SweetAlert untuk sukses
      showSuccessAlert('Berhasil!', 'Pengguna baru berhasil ditambahkan').then(
        () => {
          navigate('/pengguna');
        }
      );
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message) as FormErrorData;

        if (
          errorObj.errorType === 'joiValidationError' &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          const newErrors: UserFormErrors = {};

          errorObj.details.forEach((detail) => {
            if (detail.path.includes('name')) {
              newErrors.name = detail.message;
            } else if (detail.path.includes('email')) {
              newErrors.email = detail.message;
            } else if (detail.path.includes('password')) {
              newErrors.password = detail.message;
            } else if (detail.path.includes('roleId')) {
              newErrors.roleId = detail.message;
            } else {
              newErrors.general = detail.message;
            }
          });

          setErrors(newErrors);
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch (e) {
        console.error('Error parsing error message:', e);
        setErrors({ general: 'Terjadi kesalahan saat menambahkan pengguna' });
      }
    },
  });

  // Handler for input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Validasi khusus untuk izin role (ini perlu dipertahankan karena masalah izin tidak bisa dihandle di server)
    if (!hasRoleReadPermission() || !formData.roleId) {
      setErrors({
        roleId: 'Anda harus memilih peran untuk pengguna ini',
        general: 'Tidak dapat menambahkan pengguna tanpa peran',
      });

      showErrorAlert(
        'Tidak Dapat Menambahkan Pengguna',
        'Anda tidak memiliki izin untuk melihat daftar peran. Pengguna baru harus memiliki peran yang valid.'
      );
      return;
    }

    // Persiapkan data untuk API
    const userData: CreateUserInput = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roleId: formData.roleId,
    };

    // Tampilkan konfirmasi sebelum menambahkan pengguna
    showConfirmationAlert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menambahkan pengguna baru ini?',
      'Ya, Tambahkan!',
      'Batal'
    ).then((result) => {
      if (isConfirmed(result)) {
        createUserMutation.mutate(userData);
      }
    });
  };

  const isLoading = isLoadingRoles && hasRoleReadPermission();
  const isError = isErrorRoles && hasRoleReadPermission();
  const isSubmitting = createUserMutation.isPending;

  const inputClassName = (fieldName: keyof UserFormData) =>
    cn(
      'mt-1 w-full border-gray-300',
      errors[fieldName]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'focus:border-blue-500 focus:ring-blue-500'
    );

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Pengguna Baru</CardTitle>
          <CardDescription>
            Isi data pengguna yang akan ditambahkan ke sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Memuat data peran..." />
          ) : isError ? (
            <ErrorState
              title="Gagal memuat data"
              message="Terjadi kesalahan pada server"
              onRetry={() => navigate('/pengguna')}
              retryButtonText="Kembali ke Daftar Pengguna"
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              {!hasRoleReadPermission() && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Akses Terbatas</p>
                    <p className="text-sm">
                      Anda tidak memiliki izin untuk melihat daftar peran. Anda
                      tidak akan dapat menambahkan pengguna baru tanpa
                      menetapkan peran yang valid.
                    </p>
                  </div>
                </div>
              )}

              <FormField
                id="name"
                label="Nama Lengkap"
                error={errors.name}
                helpText="Nama lengkap pengguna yang akan ditampilkan di sistem"
              >
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  className={inputClassName('name')}
                />
              </FormField>

              <FormField
                id="email"
                label="Email"
                error={errors.email}
                helpText="Alamat email yang digunakan untuk login ke sistem"
              >
                <Input
                  id="email"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat email"
                  className={inputClassName('email')}
                />
              </FormField>

              <FormField
                id="password"
                label="Password"
                error={errors.password}
                helpText="Password minimal 8 karakter"
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  className={inputClassName('password')}
                />
              </FormField>

              <FormField
                id="roleId"
                label="Peran"
                error={errors.roleId}
                helpText={
                  !hasRoleReadPermission()
                    ? 'Anda tidak memiliki izin untuk melihat dan memilih peran'
                    : 'Peran menentukan akses dan hak istimewa pengguna di sistem'
                }
              >
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className={cn(
                    'mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                    errors.roleId &&
                      'border-red-300 focus:border-red-500 focus:ring-red-500',
                    !hasRoleReadPermission() && 'bg-gray-100 cursor-not-allowed'
                  )}
                  disabled={!hasRoleReadPermission()}
                >
                  <option value="">Pilih peran pengguna</option>
                  {hasRoleReadPermission() && roles && roles.length > 0 ? (
                    roles.map((role: Role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Tidak ada peran tersedia</option>
                  )}
                </select>
              </FormField>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/pengguna')}
                  disabled={isSubmitting}
                  type="button"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !hasRoleReadPermission()}
                  className={cn(
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    !hasRoleReadPermission() && 'opacity-50 cursor-not-allowed'
                  )}
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
        {!hasRoleReadPermission() && (
          <CardFooter className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <p className="text-sm">
                Untuk menambahkan pengguna, Anda memerlukan izin untuk melihat
                peran. Silakan hubungi administrator sistem.
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
