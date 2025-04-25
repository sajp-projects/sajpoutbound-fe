import { useCreateRole } from "@/hooks/role";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

export default function TambahPeran() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const createRoleMutation = useCreateRole({
    onSuccess: (data) => {
      Swal.fire({
        title: "Berhasil!",
        text: `Peran ${data.name} berhasil ditambahkan`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/peran");
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
        setErrors({ general: "Terjadi kesalahan saat menambahkan peran" });
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    createRoleMutation.mutate(formData);
  };

  const isSubmitting = createRoleMutation.isPending;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/peran">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Peran</h1>
        </div>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Peran Baru</CardTitle>
          <CardDescription>Isi data peran yang akan ditambahkan ke sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general}</div>}

            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama Peran
              </Label>
              <div className="mt-1">
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Masukkan nama peran" className={cn("w-full", errors.name && "border-red-300 focus:border-red-500 focus:ring-red-500")} />
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
                  onChange={handleChange}
                  placeholder="Masukkan deskripsi peran"
                  className={cn(
                    "flex min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-blue-500 focus:border-blue-500",
                    errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
              {errors.description ? <p className="mt-1 text-sm text-red-500">{errors.description}</p> : <p className="mt-1 text-sm text-gray-500">Deskripsi menjelaskan fungsi dan hak akses peran</p>}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/peran")} disabled={isSubmitting} type="button">
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
        </CardContent>
      </Card>
    </div>
  );
}
