import { useRole, useUpdateRole } from "@/hooks/role";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Type untuk form edit role
interface RoleFormData {
  name: string;
  description: string;
}

// Type untuk error validasi
interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

// Interface untuk detail validasi error dari server
interface ValidationErrorDetail {
  message: string;
  path: string[];
  type: string;
}

export default function EditPeran() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Query untuk mendapatkan data peran
  const {
    data: role,
    isLoading: isLoadingRole,
    isError: isErrorRole,
  } = useRole(
    {
      id: parseInt(id || "0"),
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
      Swal.fire({
        title: "Berhasil!",
        text: `Peran ${data.name} berhasil diperbarui`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate(`/peran/${id}`);
      });
    },
    onError: (error: Error) => {
      // Coba parsing error untuk mendapatkan detail validasi
      try {
        const errorObj = JSON.parse(error.message);
        if (errorObj.details) {
          // Format error Joi validation
          const newErrors: FormErrors = {};
          errorObj.details.forEach((detail: ValidationErrorDetail) => {
            if (detail.path && detail.path.length > 0) {
              const field = detail.path[0] as keyof FormErrors;
              newErrors[field] = detail.message;
            } else if (detail.type === "object.min") {
              newErrors.general = "Setidaknya satu field harus diubah";
            }
          });
          setErrors(newErrors);
        } else if (errorObj.errorType === "ROLE_NAME_DUPLICATE") {
          // Error nama duplikat
          setErrors({ name: "Nama peran sudah digunakan" });
        } else {
          // Error umum
          setErrors({ general: errorObj.message || error.message });
        }

        Swal.fire({
          title: "Gagal!",
          text: `Gagal memperbarui peran: ${errorObj.message || error.message}`,
          icon: "error",
          confirmButtonText: "Tutup",
        });
      } catch {
        // Fallback untuk error yang tidak bisa di-parse
        setErrors({ general: error.message });

        Swal.fire({
          title: "Gagal!",
          text: `Gagal memperbarui peran: ${error.message}`,
          icon: "error",
          confirmButtonText: "Tutup",
        });
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

  // Validasi field
  const validateField = (fieldName: string, value: string) => {
    const fieldErrors: FormErrors = { ...errors };

    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          fieldErrors.name = "Nama peran harus diisi";
        } else if (value.length < 2) {
          fieldErrors.name = "Nama peran minimal 2 karakter";
        } else {
          delete fieldErrors.name;
        }
        break;
      case "description":
        if (!value.trim()) {
          fieldErrors.description = "Deskripsi peran harus diisi";
        } else {
          delete fieldErrors.description;
        }
        break;
      default:
        break;
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  // Handler untuk perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validasi field saat diubah
    validateField(name, value);

    // Tandai field sebagai tersentuh
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  // Handler submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Pastikan semua field tersentuh untuk validasi
    setTouched({
      name: true,
      description: true,
    });

    // Validasi semua field
    const nameValid = validateField("name", formData.name);
    const descriptionValid = validateField("description", formData.description);

    if (nameValid && descriptionValid) {
      // Cek apakah ada perubahan data
      if (role && role.name === formData.name && role.description === formData.description) {
        setErrors({ general: "Tidak ada perubahan data" });
        return;
      }

      updateRoleMutation.mutate({
        id: parseInt(id || "0"),
        name: formData.name,
        description: formData.description,
      });
    }
  };

  const isLoading = isLoadingRole;
  const isError = isErrorRole;
  const isSubmitting = updateRoleMutation.isPending;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to={`/peran/${id}`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Peran</h1>
        </div>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Peran</CardTitle>
          <CardDescription>Perbarui informasi peran dalam sistem</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <p className="mt-4 text-blue-600 font-medium">Memuat data peran...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-60">
              <div className="flex flex-col items-center">
                <p className="text-red-600 font-medium">Gagal memuat data</p>
                <p className="text-sm text-gray-400">Terjadi kesalahan pada server</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/peran")} className="mt-4">
                  Kembali ke Daftar Peran
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-600 mb-4">{errors.general}</div>}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Nama Peran <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama peran"
                  className={cn("w-full", errors.name && touched.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "")}
                />
                {errors.name && touched.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                <p className="text-sm text-gray-500">Nama peran yang akan ditampilkan di sistem</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Masukkan deskripsi peran"
                  className={cn(
                    "flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    errors.description && touched.description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input bg-background ring-offset-background focus-visible:ring-ring"
                  )}
                />
                {errors.description && touched.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                <p className="text-sm text-gray-500">Deskripsi mengenai hak akses dan fungsi peran dalam sistem</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
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
