import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUpdateWarehouse, useWarehouse } from "@/hooks/gudang";
import { cn } from "@/lib/utils";
import { FormErrors } from "@/utils/errorHandler";
import {
  isConfirmed,
  showConfirmationAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

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

  const [formData, setFormData] = useState<WarehouseFormData>({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<WarehouseFormErrors>({});

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

  useEffect(() => {
    if (gudang) {
      setFormData({
        name: gudang.name || "",
        description: gudang.description || "",
      });
    }
  }, [gudang]);

  const updateWarehouseMutation = useUpdateWarehouse({
    onSuccess: (data) => {
      showSuccessAlert("Sukses!", "Gudang berhasil diperbarui").then(() => {
        navigate(`/gudang/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message);

        if (
          errorObj.errorType === "joiValidationError" &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          const newErrors: WarehouseFormErrors = {};

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
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: "Terjadi kesalahan saat memperbarui gudang" });
      }
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof WarehouseFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    showConfirmationAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menyimpan perubahan data gudang ini?",
      "Ya, Simpan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        updateWarehouseMutation.mutate({
          id: id || "",
          ...formData,
        });
      }
    });
  };

  const isSubmitting = updateWarehouseMutation.isPending;

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/gudang/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
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
            <ErrorState
              title="Gagal memuat data"
              message={
                error instanceof Error
                  ? error.message
                  : "Terjadi kesalahan pada server"
              }
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

              <div className="grid grid-cols-1 gap-6">
                <div className="col-span-1">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nama Gudang
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama gudang"
                    className={cn(
                      "mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : ""
                    )}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Nama untuk mengidentifikasi gudang
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
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
                      Deskripsikan fungsi dan lokasi gudang
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/gudang/${id}`)}
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
