import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWarehouse, useUpdateWarehouse } from "@/hooks/gudang";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { cn } from "@/lib/utils";
import { showSuccessAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { FormErrors } from "@/utils/errorHandler";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

// Type untuk form edit warehouse
interface WarehouseFormData {
  name: string;
  description: string;
}

type WarehouseFormErrors = FormErrors<WarehouseFormData> & {
  general?: string;
};

export default function EditGudang() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: "",
    description: "",
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<WarehouseFormErrors>({});

  // Fetch detail gudang
  const {
    data: gudang,
    isLoading,
    isError,
    error,
    refetch,
  } = useWarehouse(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  // Set form data dari gudang yang diterima
  useEffect(() => {
    if (gudang) {
      setFormData({
        name: gudang.name || "",
        description: gudang.description || "",
      });
    }
  }, [gudang]);

  // Mutation untuk update gudang
  const updateWarehouseMutation = useUpdateWarehouse({
    onSuccess: (data) => {
      showSuccessAlert("Sukses!", "Gudang berhasil diperbarui").then(() => {
        navigate(`/gudang/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message);

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          const newErrors: WarehouseFormErrors = {};

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
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: "Terjadi kesalahan saat memperbarui gudang" });
      }
    },
  });

  // Handler untuk perubahan form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof WarehouseFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler untuk submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Tampilkan konfirmasi sebelum mengubah gudang
    showConfirmationAlert("Konfirmasi", "Apakah Anda yakin ingin menyimpan perubahan data gudang ini?", "Ya, Simpan!", "Batal").then((result) => {
      if (isConfirmed(result)) {
        updateWarehouseMutation.mutate({
          id: id || "",
          ...formData,
        });
      }
    });
  };

  const isSubmitting = updateWarehouseMutation.isPending;

  // Helper function untuk class input
  const inputClassName = (fieldName: keyof WarehouseFormData) => cn("mt-1 w-full border-gray-300", errors[fieldName] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500");

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to={`/gudang/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Gudang</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Gudang</CardTitle>
          <CardDescription>Perbarui informasi gudang yang ada</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Memuat data gudang..." />
          ) : isError ? (
            <ErrorState title="Gagal memuat data" message={error instanceof Error ? error.message : "Terjadi kesalahan pada server"} onRetry={refetch} retryButtonText="Coba lagi" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general}</div>}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Gudang
                </label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama gudang" className={inputClassName("name")} />
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
                <Button variant="outline" onClick={() => navigate(`/gudang/${id}`)} disabled={isSubmitting} type="button">
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
