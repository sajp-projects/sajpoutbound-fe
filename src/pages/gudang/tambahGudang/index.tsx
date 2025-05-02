import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateWarehouse } from "@/hooks/gudang";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { showSuccessAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { cn } from "@/lib/utils";
import { FormErrors, FormErrorData } from "@/utils/errorHandler";

interface WarehouseFormData {
  name: string;
  description: string;
}

type WarehouseFormErrors = FormErrors<WarehouseFormData> & {
  general?: string;
};

export default function TambahGudang() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<WarehouseFormErrors>({});

  const createWarehouseMutation = useCreateWarehouse({
    onSuccess: (data) => {
      showSuccessAlert("Sukses!", "Gudang berhasil ditambahkan").then(() => {
        navigate(`/gudang/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message) as FormErrorData;

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          const newErrors: WarehouseFormErrors = {};

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
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: "Terjadi kesalahan saat menambahkan gudang" });
      }
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    showConfirmationAlert("Konfirmasi", "Apakah Anda yakin ingin menambahkan gudang baru ini?", "Ya, Tambahkan!", "Batal").then((result) => {
      if (isConfirmed(result)) {
        createWarehouseMutation.mutate(formData);
      }
    });
  };

  const isSubmitting = createWarehouseMutation.isPending;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to="/gudang">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Gudang</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Gudang Baru</CardTitle>
          <CardDescription>Isi data gudang yang akan ditambahkan ke sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general}</div>}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama Gudang
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama gudang"
                className={cn("mt-1 w-full border-gray-300", errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500")}
              />
              {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama untuk mengidentifikasi gudang</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Deskripsikan fungsi dan lokasi gudang"
                className={cn(
                  "mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                  errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              />
              {errors.description ? <p className="mt-1 text-sm text-red-500">{errors.description}</p> : <p className="mt-1 text-sm text-gray-500">Deskripsikan fungsi dan lokasi gudang</p>}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => navigate("/gudang")} disabled={isSubmitting} type="button">
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
