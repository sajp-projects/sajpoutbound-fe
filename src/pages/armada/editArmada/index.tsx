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
import { UpdateArmadaInput } from "@/types/armada";
import { FormErrors } from "@/utils/errorHandler";
import {
  isConfirmed,
  showConfirmationAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

// Validasi plat nomor Indonesia
const plateNumberRegex = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/;

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

  const [formData, setFormData] = useState<ArmadaFormData>({
    model: "",
    id_sl: "",
    plateNumber: "",
    description: "",
  });

  const [errors, setErrors] = useState<ArmadaFormErrors>({});

  // Validasi realtime untuk plat nomor
  useEffect(() => {
    if (formData.plateNumber) {
      if (!plateNumberRegex.test(formData.plateNumber)) {
        setErrors((prev) => ({
          ...prev,
          plateNumber: "Format plat nomor tidak valid (contoh: B 1234 ABC)",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          plateNumber: undefined,
        }));
      }
    } else {
      // Hapus error jika field kosong
      setErrors((prev) => ({
        ...prev,
        plateNumber: undefined,
      }));
    }
  }, [formData.plateNumber]);

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Konversi plat nomor ke uppercase untuk plateNumber
    if (name === "plateNumber") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Hapus error untuk field yang sedang diubah, kecuali plateNumber yang divalidasi realtime
    if (name !== "plateNumber" && errors[name as keyof ArmadaFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: ArmadaFormErrors = {};
    let isValid = true;

    if (!formData.model.trim()) {
      newErrors.model = "Model armada harus diisi";
      isValid = false;
    }

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = "Plat nomor harus diisi";
      isValid = false;
    } else if (!plateNumberRegex.test(formData.plateNumber)) {
      newErrors.plateNumber =
        "Format plat nomor tidak valid (contoh: B 1234 ABC)";
      isValid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, general: undefined }));

    if (!validateForm()) {
      return;
    }

    showConfirmationAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menyimpan perubahan data armada ini?",
      "Ya, Simpan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        const updateData: UpdateArmadaInput & { id: string } = {
          id: id || "",
          model: formData.model,
          plateNumber: formData.plateNumber,
          description: formData.description,
        };

        if (formData.id_sl.trim()) {
          updateData.id_sl = formData.id_sl;
        }

        updateArmadaMutation.mutate(updateData);
      }
    });
  };

  const isSubmitting = updateArmadaMutation.isPending;

  const inputClassName = (fieldName: keyof ArmadaFormData) =>
    cn(
      "mt-1 w-full border-gray-300",
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "focus:border-blue-500 focus:ring-blue-500"
    );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/armada/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
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
                <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                  {errors.general}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    ID
                  </label>
                  <Input
                    id="id_sl"
                    name="id_sl"
                    value={formData.id_sl}
                    onChange={handleInputChange}
                    placeholder="Masukkan ID Armada"
                    className={inputClassName("id_sl")}
                  />
                  {errors.id_sl ? (
                    <p className="mt-1 text-sm text-red-500">{errors.id_sl}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      ID untuk identifikasi armada (opsional)
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
                    placeholder="Contoh: B 1234 ABC"
                    className={inputClassName("plateNumber")}
                  />
                  {errors.plateNumber ? (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.plateNumber}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Nomor plat kendaraan (format: B 1234 ABC)
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
