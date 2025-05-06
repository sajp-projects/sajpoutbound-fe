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
import { Input } from "@/components/ui/input";
import { useUpdateArmada, useArmada } from "@/hooks/armada";
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

interface ArmadaFormData {
  model: string;
  id_sl: string;
  plateNumber: string;
  description: string;
}

type ArmadaFormErrors = FormErrors<ArmadaFormData> & {
  general?: string;
};

export default function EditArmada() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form data
  const [formData, setFormData] = useState<ArmadaFormData>({
    model: "",
    id_sl: "",
    plateNumber: "",
    description: "",
  });

  // State untuk error
  const [errors, setErrors] = useState<ArmadaFormErrors>({});

  // Fetch data armada
  const {
    data: armada,
    isLoading,
    isError,
    error,
    refetch,
  } = useArmada(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  // Mutation untuk update armada
  const updateArmadaMutation = useUpdateArmada({
    onSuccess: (data) => {
      showSuccessAlert("Sukses!", "Armada berhasil diperbarui").then(() => {
        navigate(`/armada/${data.id}`);
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
          const newErrors: ArmadaFormErrors = {};

          errorObj.details.forEach(
            (detail: { message: string; path: string[] }) => {
              if (detail.path.includes("model")) {
                newErrors.model = detail.message;
              } else if (detail.path.includes("id_sl")) {
                newErrors.id_sl = detail.message;
              } else if (detail.path.includes("plateNumber")) {
                newErrors.plateNumber = detail.message;
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
        setErrors({ general: "Terjadi kesalahan saat memperbarui armada" });
      }
    },
  });

  // Mengisi form dengan data armada yang ada
  useEffect(() => {
    if (armada) {
      setFormData({
        model: armada.model || "",
        id_sl: armada.id_sl || "",
        plateNumber: armada.plateNumber || "",
        description: armada.description || "",
      });
    }
  }, [armada]);

  // Handler untuk perubahan input
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error jika field diisi
    if (errors[name as keyof ArmadaFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler untuk submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validasi sederhana
    const validationErrors: ArmadaFormErrors = {};
    if (!formData.model.trim()) {
      validationErrors.model = "Model armada harus diisi";
    }
    if (!formData.id_sl.trim()) {
      validationErrors.id_sl = "ID SL harus diisi";
    }
    if (!formData.plateNumber.trim()) {
      validationErrors.plateNumber = "Plat nomor harus diisi";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Konfirmasi sebelum update
    showConfirmationAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menyimpan perubahan data armada ini?",
      "Ya, Simpan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        updateArmadaMutation.mutate({
          id: id || "",
          ...formData,
        });
      }
    });
  };

  const isSubmitting = updateArmadaMutation.isPending;

  // Styling untuk input berdasarkan error
  const inputClassName = (fieldName: keyof ArmadaFormData) =>
    cn(
      "mt-1 w-full border-gray-300",
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "focus:border-blue-500 focus:ring-blue-500"
    );

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to={`/armada/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Armada</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Armada</CardTitle>
          <CardDescription>Perbarui informasi armada yang ada</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Memuat data armada..." />
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
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Model Armada
                  </label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Masukkan model armada"
                    className={inputClassName("model")}
                  />
                  {errors.model ? (
                    <p className="mt-1 text-sm text-red-500">{errors.model}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Model/tipe kendaraan armada
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="id_sl"
                    className="block text-sm font-medium text-gray-700"
                  >
                    ID SL
                  </label>
                  <Input
                    id="id_sl"
                    name="id_sl"
                    value={formData.id_sl}
                    onChange={handleInputChange}
                    placeholder="Masukkan ID SL"
                    className={inputClassName("id_sl")}
                  />
                  {errors.id_sl ? (
                    <p className="mt-1 text-sm text-red-500">{errors.id_sl}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      ID SL untuk identifikasi armada
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="plateNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Plat Nomor
                  </label>
                  <Input
                    id="plateNumber"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleInputChange}
                    placeholder="Masukkan plat nomor kendaraan"
                    className={inputClassName("plateNumber")}
                  />
                  {errors.plateNumber ? (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.plateNumber}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Nomor plat kendaraan
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
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
                    placeholder="Deskripsikan armada ini"
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
                      Deskripsikan kegunaan dan informasi tambahan tentang
                      armada
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/armada/${id}`)}
                  disabled={isSubmitting}
                  type="button"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
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
