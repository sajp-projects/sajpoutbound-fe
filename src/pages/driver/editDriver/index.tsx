import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDriver, useUpdateDriver } from "@/hooks/driver";
import { cn } from "@/lib/utils";
import { FormErrors } from "@/utils/errorHandler";
import {
  isConfirmed,
  showConfirmationAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

interface DriverFormData {
  name: string;
}

type DriverFormErrors = FormErrors<DriverFormData> & {
  general?: string;
};

export default function EditSupir() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<DriverFormData>({
    name: "",
  });
  const [errors, setErrors] = useState<DriverFormErrors>({});

  const { data: driver, isLoading: loadingDriver, error: driverError } = useDriver(
    { id: id! },
    {
      enabled: !!id,
    }
  );

  const updateDriverMutation = useUpdateDriver({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Supir berhasil diperbarui").then(() => {
        navigate("/supir");
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
          const newErrors: DriverFormErrors = {};

          errorObj.details.forEach(
            (detail: { path: string; message: string }) => {
              if (detail.path.includes("name")) {
                newErrors.name = detail.message;
              } else {
                newErrors.general = detail.message;
              }
            }
          );

          setErrors(newErrors);
        } else {
          setErrors({
            general: errorObj.message || "Terjadi kesalahan pada server",
          });
        }
      } catch {
        setErrors({
          general: "Terjadi kesalahan pada server",
        });
      }
    },
  });

  // Load driver data when component mounts
  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name,
      });
    }
  }, [driver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validasi nama supir
    if (!formData.name.trim()) {
      setErrors({
        name: "Nama supir harus diisi",
      });
      return;
    }

    if (formData.name.trim().length < 2) {
      setErrors({
        name: "Nama supir minimal 2 karakter",
      });
      return;
    }

    const submitData = {
      id: id!,
      ...formData,
    };

    showConfirmationAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin memperbarui supir ini?"
    ).then((result) => {
      if (isConfirmed(result)) {
        updateDriverMutation.mutate(submitData);
      }
    });
  };

  const handleInputChange = (field: keyof DriverFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (loadingDriver) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Memuat data supir...</p>
        </div>
      </div>
    );
  }

  if (driverError || !driver) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {driverError?.message || "Gagal memuat data supir"}
          </p>
          <Button onClick={() => navigate("/supir")} variant="outline">
            Kembali ke Daftar Supir
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Supir</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Supir</CardTitle>
          <CardDescription>
            Perbarui informasi supir yang sudah ada
          </CardDescription>
        </CardHeader>

        <CardContent>
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
                  Nama Supir <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama supir"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={cn(
                    "mt-1 block w-full",
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  )}
                  autoComplete="name"
                  maxLength={100}
                />
                {errors.name ? (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Nama untuk mengidentifikasi supir
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/supir")}
                disabled={updateDriverMutation.isPending}
                type="button"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateDriverMutation.isPending}
                className="text-white bg-blue-600 hover:bg-blue-700"
              >
                {updateDriverMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
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