import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateArmada } from "@/hooks/armada";
import { CreateArmadaInput } from "@/types/armada";
import {
  showErrorAlert,
  showSuccessAlert
} from "@/utils/sweetAlert";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

interface ArmadaFormData {
  model: string;
  id_sl: string;
  plateNumber: string;
  description: string;
}

export default function TambahArmada() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ArmadaFormData>({
    model: "",
    id_sl: "",
    plateNumber: "",
    description: "",
  });

  const createArmadaMutation = useCreateArmada({
    onSuccess: (data) => {
      showSuccessAlert("Sukses!", "Armada berhasil ditambahkan").then(() => {
        navigate(`/armada/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        console.log(error, 'error adding armada')
        const errorObj = JSON.parse(error.message);

        if (
          errorObj.errorType === "joiValidationError" &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          // Show validation errors in SweetAlert
          const errorMessages = errorObj.details.map((detail: { path: string; message: string }) => {
            const fieldName = detail.path.includes("model") ? "Model" :
                             detail.path.includes("id_sl") ? "ID SL" :
                             detail.path.includes("plateNumber") ? "Plat Nomor" :
                             detail.path.includes("description") ? "Deskripsi" : "Field";
            return `${fieldName}: ${detail.message}`;
          }).join('\n');

          showErrorAlert("Validasi Error", errorMessages);
        } else {
          showErrorAlert("Error", errorObj.message || "Terjadi kesalahan saat menambahkan armada");
        }
      } catch {
        showErrorAlert("Error", "Terjadi kesalahan saat menambahkan armada");
      }
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Convert plate number to uppercase
    if (name === "plateNumber") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format data for API
    const armadaData: CreateArmadaInput = {
      model: formData.model.trim(),
      plateNumber: formData.plateNumber.trim(),
      description: formData.description.trim(),
    };

    // Only include id_sl if it's not empty
    if (formData.id_sl.trim()) {
      armadaData.id_sl = formData.id_sl.trim();
    }

    createArmadaMutation.mutate(armadaData);
  };

  const isSubmitting = createArmadaMutation.isPending;

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Armada</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Armada Baru</CardTitle>
          <CardDescription>
            Isi data armada yang akan ditambahkan ke sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">


            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1">
                <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                  Model Armada
                </Label>
                <Input
                  id="model"
                  name="model"
                  type="text"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Masukkan model armada"
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Model kendaraan (contoh: Truk Fuso, Pickup L300)
                </p>
              </div>

              <div className="col-span-1">
                <Label htmlFor="id_sl" className="text-sm font-medium text-gray-700">
                  ID SL
                </Label>
                <Input
                  id="id_sl"
                  name="id_sl"
                  type="text"
                  value={formData.id_sl}
                  onChange={handleInputChange}
                  placeholder="Masukkan ID SL armada"
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  ID SL armada (opsional)
                </p>
              </div>

              <div className="col-span-1">
                <Label htmlFor="plateNumber" className="text-sm font-medium text-gray-700">
                  Plat Nomor
                </Label>
                <Input
                  id="plateNumber"
                  name="plateNumber"
                  type="text"
                  value={formData.plateNumber}
                  onChange={handleInputChange}
                  placeholder="Masukkan plat nomor armada"
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Plat nomor kendaraan (contoh: B 1234 ABC)
                </p>
              </div>

              <div className="col-span-1 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Deskripsi
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Masukkan deskripsi armada"
                  rows={3}
                  className="mt-1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Deskripsi tambahan armada (opsional)
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/armada")}
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
        </CardContent>
      </Card>
    </div>
  );
}
