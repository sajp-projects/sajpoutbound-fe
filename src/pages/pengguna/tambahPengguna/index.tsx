import { useAllRoles } from "@/hooks/role";
import { useCreateUser } from "@/hooks/user";
import { cn } from "@/lib/utils";
import { Role } from "@/types/role";
import { CreateUserInput } from "@/types/user";
import { AlertTriangle, Loader2, Save } from "lucide-react";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { FormErrorData, FormErrors } from "@/utils/errorHandler";
import {
  isConfirmed,
  showConfirmationAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";

interface UserFormData {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

type UserFormErrors = FormErrors<UserFormData> & {
  general?: string;
};

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

  const userData = localStorage.getItem("user");
  const currentUserRoleId = userData ? JSON.parse(userData)?.roleId : null;

  const { data: permissions } = useRolePermissions(currentUserRoleId, {
    enabled: isAuthenticated && !!currentUserRoleId && currentUserRoleId !== "",
  });

  const hasRoleReadPermission = (): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return permissions.some(
      (permission) =>
        permission.resource === PERMISSION.RESOURCES.ROLE &&
        permission.action === PERMISSION.ACTIONS.READ
    );
  };

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });

  const [errors, setErrors] = useState<UserFormErrors>({});

  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
  } = useAllRoles({
    enabled: hasRoleReadPermission(),
  });

  const roles = rolesData?.roles || [];

  const createUserMutation = useCreateUser({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengguna baru berhasil ditambahkan").then(
        () => {
          navigate("/pengguna");
        }
      );
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message) as FormErrorData;

        if (
          errorObj.errorType === "joiValidationError" &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          const newErrors: UserFormErrors = {};

          errorObj.details.forEach((detail) => {
            if (detail.path.includes("name")) {
              newErrors.name = detail.message;
            } else if (detail.path.includes("email")) {
              newErrors.email = detail.message;
            } else if (detail.path.includes("password")) {
              newErrors.password = detail.message;
            } else if (detail.path.includes("roleId")) {
              newErrors.roleId = detail.message;
            } else {
              newErrors.general = detail.message;
            }
          });

          setErrors(newErrors);
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: "Terjadi kesalahan saat menambahkan pengguna" });
      }
    },
  });

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const userData: CreateUserInput = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roleId: formData.roleId,
    };

    showConfirmationAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menambahkan pengguna baru ini?",
      "Ya, Tambahkan!",
      "Batal"
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
      "mt-1 w-full border-gray-300",
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "focus:border-blue-500 focus:ring-blue-500"
    );

  return (
    <div className="px-4 space-y-6 sm:px-0">
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
              onRetry={() => navigate("/pengguna")}
              retryButtonText="Kembali ke Daftar Pengguna"
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                  {errors.general}
                </div>
              )}

              {!hasRoleReadPermission() && (
                <div className="flex items-start p-4 mb-4 border rounded-md bg-amber-50 border-amber-200 text-amber-800">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Akses Terbatas</p>
                    <p className="text-sm">
                      Anda memerlukan izin untuk melihat daftar peran
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
                  className={inputClassName("name")}
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
                  className={inputClassName("email")}
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
                  className={inputClassName("password")}
                />
              </FormField>

              <FormField
                id="roleId"
                label="Peran"
                error={errors.roleId}
                helpText={
                  !hasRoleReadPermission()
                    ? "Anda memerlukan izin untuk akses ini"
                    : "Peran menentukan akses dan hak istimewa pengguna di sistem"
                }
              >
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.roleId &&
                      "border-red-300 focus:border-red-500 focus:ring-red-500",
                    !hasRoleReadPermission() && "bg-gray-100 cursor-not-allowed"
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
                  onClick={() => navigate("/pengguna")}
                  disabled={isSubmitting}
                  type="button"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !hasRoleReadPermission()}
                  className={cn(
                    "bg-blue-600 hover:bg-blue-700 text-white",
                    !hasRoleReadPermission() && "opacity-50 cursor-not-allowed"
                  )}
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
        {!hasRoleReadPermission() && (
          <CardFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p className="text-sm">
                Hubungi administrator sistem untuk mendapatkan izin yang
                diperlukan
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
