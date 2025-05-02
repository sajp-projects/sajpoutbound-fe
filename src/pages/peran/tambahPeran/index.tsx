import { useCreateRole } from "@/hooks/role";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccessAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { FormErrors, FormErrorData } from "@/utils/errorHandler";

interface FormData {
  name: string;
  description: string;
}

type RoleFormErrors = FormErrors<FormData> & {
  general?: string;
};

export default function TambahPeran() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<RoleFormErrors>({});

  const createRoleMutation = useCreateRole({
    onSuccess: (data) => {
      showSuccessAlert("Berhasil!", `Peran ${data.name} berhasil ditambahkan`).then(() => {
        navigate("/peran");
      });
    },
    onError: (error: Error) => {
      try {
        const errorObj = JSON.parse(error.message) as FormErrorData;

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          const newErrors: RoleFormErrors = {};

          errorObj.details.forEach((detail) => {
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
          setErrors({ name: errorObj.message });
        } else {
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

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    showConfirmationAlert("Konfirmasi", `Apakah Anda yakin ingin menambahkan peran "${formData.name}"?`, "Ya, Tambahkan", "Batal").then((result) => {
      if (isConfirmed(result)) {
        createRoleMutation.mutate(formData);
      }
    });
  };

  const isSubmitting = createRoleMutation.isPending;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to="/peran">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Peran</h1>
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
              <Label htmlFor="name">Nama Peran</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Masukkan nama peran"
                className={cn("mt-1 w-full border-gray-300", errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500")}
              />
              {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama peran yang akan ditampilkan di sistem</p>}
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Masukkan deskripsi peran"
                className={cn(
                  "mt-1 min-h-[120px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-blue-500 focus:border-blue-500",
                  errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              />
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
