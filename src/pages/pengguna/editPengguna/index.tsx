import { useUser, useUpdateUser } from "@/hooks/user";
import { useAllRoles } from "@/hooks/role";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Role } from "@/types/role";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Import utilitas SweetAlert
import { showSuccessAlert, showErrorAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { FormErrors } from "@/utils/errorHandler";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

// Type untuk form edit user
interface UserFormData {
  name: string;
  email: string;
  roleId: string;
}

type UserFormErrors = FormErrors<UserFormData> & {
  id?: string;
  general?: string;
};

export default function EditPengguna() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    roleId: "",
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<UserFormErrors>({});

  // Query untuk mendapatkan data user
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
    error: userError,
    refetch: refetchUser,
  } = useUser(
    {
      id: id || "",
    },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  // Query untuk mendapatkan daftar role - menggunakan useAllRoles untuk mendapatkan semua data
  const { data: rolesData, isLoading: isLoadingRoles, isError: isErrorRoles, refetch: refetchRoles } = useAllRoles();

  // Pastikan roles selalu array dengan mengakses rolesData.roles jika ada
  const roles = rolesData?.roles || [];

  // Mutation untuk update user
  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      // Tampilkan SweetAlert untuk sukses
      showSuccessAlert("Berhasil!", "Data pengguna berhasil diperbarui").then(() => {
        navigate(`/pengguna/${id}`);
      });
    },
    onError: (error) => {
      // Tangani error dari backend
      try {
        // Parse error yang sudah di-stringify di hook
        const errorObj = JSON.parse(error.message);

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          // Petakan error validasi ke field yang sesuai
          const newErrors: UserFormErrors = {};

          errorObj.details.forEach((detail: { message: string; path: string[] }) => {
            if (detail.path.includes("id")) {
              newErrors.id = detail.message;
            } else if (detail.path.includes("name")) {
              newErrors.name = detail.message;
            } else if (detail.path.includes("email")) {
              newErrors.email = detail.message;
            } else if (detail.path.includes("roleId")) {
              newErrors.roleId = detail.message;
            } else {
              newErrors.general = detail.message;
            }
          });

          setErrors(newErrors);
        } else {
          // Error umum non-validasi
          setErrors({ general: errorObj.message });
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
        setErrors({ general: "Terjadi kesalahan saat memperbarui pengguna" });
      }
    },
  });

  // Isi form dengan data user ketika data sudah tersedia
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        roleId: user.role.id,
      });
    }
  }, [user]);

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Tampilkan konfirmasi sebelum mengubah pengguna
    showConfirmationAlert("Konfirmasi", "Apakah Anda yakin ingin menyimpan perubahan data pengguna ini?", "Ya, Simpan!", "Batal").then((result) => {
      if (isConfirmed(result)) {
        updateUserMutation.mutate({
          id: id || "",
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId,
        });
      }
    });
  };

  const isLoading = isLoadingUser || isLoadingRoles;
  const isError = isErrorUser || isErrorRoles;
  const isSubmitting = updateUserMutation.isPending;

  // Handle refetch
  const handleRetry = () => {
    refetchUser();
    refetchRoles();
  };

  // Fungsi helper untuk class input form
  const inputClassName = (fieldName: keyof UserFormData) => cn("mt-1 w-full border-gray-300", errors[fieldName] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500");

  useEffect(() => {
    if (isErrorUser) {
      // Ganti Swal.fire dengan showErrorAlert
      showErrorAlert("Gagal!", `Gagal memuat data pengguna: ${userError?.message || "Terjadi kesalahan"}`).then(() => {
        navigate("/pengguna");
      });
    }
  }, [isErrorUser, userError, navigate]);

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to={`/pengguna/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Pengguna</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Pengguna</CardTitle>
          <CardDescription>Perbarui informasi pengguna sistem</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Memuat data pengguna..." />
          ) : isError ? (
            <ErrorState title="Gagal memuat data" message="Terjadi kesalahan pada server" onRetry={handleRetry} retryButtonText="Coba lagi" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {(errors.general || errors.id) && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general || errors.id}</div>}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama lengkap" className={inputClassName("name")} />
                {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama lengkap pengguna yang akan ditampilkan di sistem</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input id="email" name="email" type="text" value={formData.email} onChange={handleInputChange} placeholder="Masukkan alamat email" className={inputClassName("email")} />
                {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email}</p> : <p className="mt-1 text-sm text-gray-500">Alamat email yang digunakan untuk login ke sistem</p>}
              </div>

              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                  Peran
                </label>
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.roleId && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                >
                  <option value="" disabled>
                    Pilih peran
                  </option>
                  {roles && roles.length > 0 ? (
                    roles.map((role: Role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Tidak ada peran tersedia
                    </option>
                  )}
                </select>
                {errors.roleId ? <p className="mt-1 text-sm text-red-500">{errors.roleId}</p> : <p className="mt-1 text-sm text-gray-500">Peran menentukan akses dan hak istimewa pengguna di sistem</p>}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(`/pengguna/${id}`)} disabled={isSubmitting} type="button">
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
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
