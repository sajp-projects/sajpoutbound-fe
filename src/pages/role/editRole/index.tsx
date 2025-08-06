import { useRole, useUpdateRole } from "@/hooks/role";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import {
  showSuccessAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { FormErrors } from "@/utils/errorHandler";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

interface RoleFormData {
  name: string;
  description: string;
}

type RoleFormErrors = FormErrors<RoleFormData> & {
  general?: string;
};

export default function EditPeran() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<RoleFormErrors>({});

  const {
    data: role,
    isLoading: isLoadingRole,
    isError: isErrorRole,
    refetch,
  } = useRole(
    {
      id: id || "",
    },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  const updateRoleMutation = useUpdateRole({
    onSuccess: (data) => {
      showSuccessAlert(
        "Berhasil!",
        `Peran ${data.name} berhasil diperbarui`
      ).then(() => {
        navigate(`/peran/${id}`);
      });
    },
    onError: (error: Error) => {
      try {
        const errorObj = JSON.parse(error.message);

        if (
          errorObj.errorType === "joiValidationError" &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          const newErrors: RoleFormErrors = {};

          errorObj.details.forEach(
            (detail: { message: string; path: string[] }) => {
              if (detail.path.includes("name")) {
                newErrors.name = detail.message;
              } else if (detail.path.includes("description")) {
                newErrors.description = detail.message;
              } else {
                newErrors.general = detail.message;
              }
            }
          );

          setErrors(newErrors);
        } else if (errorObj.errorType === "ROLE_NAME_DUPLICATE") {
          setErrors({ name: errorObj.message });
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
        setErrors({ general: "Terjadi kesalahan saat memperbarui peran" });
      }
    },
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
      });
    }
  }, [role]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof RoleFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    showConfirmationAlert(
      "Konfirmasi",
      `Apakah Anda yakin ingin memperbarui peran "${formData.name}"?`,
      "Ya, Perbarui",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        updateRoleMutation.mutate({
          id: id || "",
          name: formData.name,
          description: formData.description,
        });
      }
    });
  };

  const isLoading = isLoadingRole;
  const isError = isErrorRole;
  const isSubmitting = updateRoleMutation.isPending;

  const inputClassName = (fieldName: keyof RoleFormData) =>
    cn(
      "mt-1 w-full border-gray-300",
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "focus:border-blue-500 focus:ring-blue-500"
    );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/peran/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Peran</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Peran</CardTitle>
          <CardDescription>
            Perbarui informasi peran dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Memuat data peran..." />
          ) : isError ? (
            <ErrorState
              title="Gagal memuat data"
              message="Terjadi kesalahan pada server"
              onRetry={refetch}
              retryButtonText="Coba lagi"
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                  {errors.general}
                </div>
              )}

              <div>
                <Label htmlFor="name">Nama Peran</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama peran"
                  className={inputClassName("name")}
                />
                {errors.name ? (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Nama peran yang akan ditampilkan di sistem
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Masukkan deskripsi peran"
                  className={cn(
                    "mt-1 min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-blue-500 focus:border-blue-500",
                    errors.description &&
                      "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.description ? (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Deskripsi mengenai hak akses dan fungsi peran dalam sistem
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/peran/${id}`)}
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
