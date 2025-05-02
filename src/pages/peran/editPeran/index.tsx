import { useRole, useUpdateRole } from "@/hooks/role";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Import utilitas SweetAlert
import { showSuccessAlert, showForbiddenAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { FormErrors } from "@/utils/errorHandler";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

// Type untuk form edit role
interface RoleFormData {
  name: string;
  description: string;
}

// Type untuk error validasi dengan memanfaatkan FormErrors utility type
type RoleFormErrors = FormErrors<RoleFormData> & {
  general?: string;
};

export default function EditPeran() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<RoleFormErrors>({});

  // Query untuk mendapatkan data peran
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

  // Mutation untuk update peran
  const updateRoleMutation = useUpdateRole({
    onSuccess: (data) => {
      // Tampilkan SweetAlert untuk sukses
      showSuccessAlert("Berhasil!", `Peran ${data.name} berhasil diperbarui`).then(() => {
        navigate(`/peran/${id}`);
      });
    },
    onError: (error: Error) => {
      // Cek jika pesan error adalah Forbidden
      if (error.message && error.message.includes("Forbidden")) {
        showForbiddenAlert("Akses Ditolak", "Anda tidak memiliki akses untuk mengubah peran ini.");
        return;
      }

      try {
        // Parse error yang sudah di-stringify di hook
        const errorObj = JSON.parse(error.message);

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          // Petakan error validasi ke field yang sesuai
          const newErrors: RoleFormErrors = {};

          errorObj.details.forEach((detail: { message: string; path: string[] }) => {
            if (detail.path.includes("name")) {
              newErrors.name = detail.message;
            } else if (detail.path.includes("description")) {
              newErrors.description = detail.message;
            } else {
              newErrors.general = detail.message;
            }
          });

          setErrors(newErrors);
        } else if (errorObj.errorType === "ROLE_NAME_DUPLICATE") {
          // Error khusus untuk nama peran duplikat
          setErrors({ name: errorObj.message });
        } else {
          // Error umum non-validasi
          setErrors({ general: errorObj.message });
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
        setErrors({ general: "Terjadi kesalahan saat memperbarui peran" });
      }
    },
  });

  // Isi form dengan data peran ketika data sudah tersedia
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
      });
    }
  }, [role]);

  // Handler untuk perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof RoleFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Cek apakah ada perubahan data
    if (role && role.name === formData.name && role.description === formData.description) {
      setErrors({ general: "Tidak ada perubahan data" });
      return;
    }

    // Tampilkan konfirmasi sebelum menyimpan
    showConfirmationAlert("Konfirmasi", `Apakah Anda yakin ingin memperbarui peran "${formData.name}"?`, "Ya, Perbarui", "Batal").then((result) => {
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

  // Helper function untuk class input
  const inputClassName = (fieldName: keyof RoleFormData) => cn("mt-1 w-full border-gray-300", errors[fieldName] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500");

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to={`/peran/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Peran</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Peran</CardTitle>
          <CardDescription>Perbarui informasi peran dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Memuat data peran..." />
          ) : isError ? (
            <ErrorState title="Gagal memuat data" message="Terjadi kesalahan pada server" onRetry={refetch} retryButtonText="Coba lagi" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general}</div>}

              <div>
                <Label htmlFor="name">Nama Peran</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama peran" className={inputClassName("name")} />
                {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama peran yang akan ditampilkan di sistem</p>}
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
                    errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                />
                {errors.description ? <p className="mt-1 text-sm text-red-500">{errors.description}</p> : <p className="mt-1 text-sm text-gray-500">Deskripsi mengenai hak akses dan fungsi peran dalam sistem</p>}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(`/peran/${id}`)} disabled={isSubmitting} type="button">
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
