import { useUser, useUpdateUser } from "@/hooks/user";
import { useAllRoles } from "@/hooks/role";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Role } from "@/types/role";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { FormErrors } from "@/utils/errorHandler";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

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

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    roleId: "",
  });

  const [errors, setErrors] = useState<UserFormErrors>({});

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

  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
    refetch: refetchRoles,
  } = useAllRoles();

  const roles = rolesData?.roles || [];

  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Data pengguna berhasil diperbarui").then(
        () => {
          navigate(`/pengguna/${id}`);
        }
      );
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message);

        if (
          errorObj.errorType === "joiValidationError" &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          const newErrors: UserFormErrors = {};

          errorObj.details.forEach(
            (detail: { message: string; path: string[] }) => {
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
            }
          );

          setErrors(newErrors);
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: "Terjadi kesalahan saat memperbarui pengguna" });
      }
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        roleId: user.role.id,
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof UserFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    showConfirmationAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menyimpan perubahan data pengguna ini?",
      "Ya, Simpan!",
      "Batal"
    ).then((result) => {
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

  const handleRetry = () => {
    refetchUser();
    refetchRoles();
  };

  const inputClassName = (fieldName: keyof UserFormData) =>
    cn(
      "mt-1 w-full border-gray-300",
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "focus:border-blue-500 focus:ring-blue-500"
    );

  useEffect(() => {
    if (isErrorUser) {
      showErrorAlert(
        "Gagal!",
        `Gagal memuat data pengguna: ${
          userError?.message || "Terjadi kesalahan"
        }`
      ).then(() => {
        navigate("/pengguna");
      });
    }
  }, [isErrorUser, userError, navigate]);

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/pengguna/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
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
            <ErrorState
              title="Gagal memuat data"
              message="Terjadi kesalahan pada server"
              onRetry={handleRetry}
              retryButtonText="Coba lagi"
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {(errors.general || errors.id) && (
                <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                  {errors.general || errors.id}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nama Lengkap
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  className={inputClassName("name")}
                />
                {errors.name ? (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Nama lengkap pengguna yang akan ditampilkan di sistem
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan alamat email"
                  className={inputClassName("email")}
                />
                {errors.email ? (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Alamat email yang digunakan untuk login ke sistem
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="roleId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Peran
                </label>
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.roleId &&
                      "border-red-300 focus:border-red-500 focus:ring-red-500"
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
                {errors.roleId ? (
                  <p className="mt-1 text-sm text-red-500">{errors.roleId}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Peran menentukan akses dan hak istimewa pengguna di sistem
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/pengguna/${id}`)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
