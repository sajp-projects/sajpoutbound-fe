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

export default function EditPeran() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<RoleFormData>({
    name: "",
    description: "",
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<FormErrors>({});

  // Query untuk mendapatkan data peran
  const {
    data: role,
    isLoading: isLoadingRole,
    isError: isErrorRole,
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
      try {
        // Parse error yang sudah di-stringify di hook
        const errorObj = JSON.parse(error.message);

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          // Petakan error validasi ke field yang sesuai
          const newErrors: FormErrors = {};

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof FormErrors]) {
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

    updateRoleMutation.mutate({
      id: id || "",
      name: formData.name,
      description: formData.description,
    });
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
              {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general}</div>}

              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Peran
                </Label>
                <div className="mt-1">
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama peran" className={cn("w-full", errors.name && "border-red-300 focus:border-red-500 focus:ring-red-500")} />
                </div>
                {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama peran yang akan ditampilkan di sistem</p>}
              </div>

              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </Label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Masukkan deskripsi peran"
                    className={cn(
                      "flex min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-blue-500 focus:border-blue-500",
                      errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                </div>
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
