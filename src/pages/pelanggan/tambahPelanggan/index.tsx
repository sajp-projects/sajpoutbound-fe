import { useCreateCustomer } from "@/hooks/pelanggan";
import { cn } from "@/lib/utils";
import { CustomerInput } from "@/types/pelanggan";
import { Loader2, Save } from "lucide-react";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormErrors } from "@/utils/errorHandler";
import {
  isConfirmed,
  showConfirmationAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";

interface CustomerFormData {
  name: string;
  id_sl: string;
  address: string;
}

type CustomerFormErrors = FormErrors<CustomerFormData> & {
  general?: string;
};

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  helpText?: string;
}

function FormField({ id, label, error, children, helpText }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : helpText ? (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      ) : null}
    </div>
  );
}

export default function TambahPelanggan() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    id_sl: "",
    address: "",
  });
  
  const [errors, setErrors] = useState<CustomerFormErrors>({});

  const createCustomerMutation = useCreateCustomer({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pelanggan baru berhasil ditambahkan").then(
        () => {
          navigate("/pelanggan");
        }
      );
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message);

        if (
          errorObj.errorType === "joiValidationError" &&
          errorObj.details &&
          errorObj.details.length > 0
        ) {
          const newErrors: CustomerFormErrors = {};

          errorObj.details.forEach(
            (detail: { message: string; path: string[] }) => {
              if (detail.path.includes("name")) {
                newErrors.name = detail.message;
              } else if (detail.path.includes("id_sl")) {
                newErrors.id_sl = detail.message;
              } else if (detail.path.includes("address")) {
                newErrors.address = detail.message;
              } else {
                newErrors.general = detail.message;
              }
            }
          );

          setErrors(newErrors);
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
        setErrors({ general: "Terjadi kesalahan saat menambahkan pelanggan" });
      }
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof CustomerFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const validationErrors: CustomerFormErrors = {};
    if (!formData.name.trim()) {
      validationErrors.name = "Nama pelanggan harus diisi";
    }
    if (!formData.address.trim()) {
      validationErrors.address = "Alamat harus diisi";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const customerData: CustomerInput = {
      name: formData.name,
      address: formData.address,
    };
    
    if (formData.id_sl.trim()) {
      customerData.id_sl = formData.id_sl;
    }

    showConfirmationAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menambahkan pelanggan baru ini?",
      "Ya, Tambahkan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        createCustomerMutation.mutate(customerData);
      }
    });
  };

  const isSubmitting = createCustomerMutation.isPending;

  const inputClassName = (fieldName: keyof CustomerFormData) =>
    cn(
      "mt-1 w-full border-gray-300",
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "focus:border-blue-500 focus:ring-blue-500"
    );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Pelanggan</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Pelanggan Baru</CardTitle>
          <CardDescription>
            Isi data pelanggan yang akan ditambahkan ke sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 mb-4 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
                {errors.general}
              </div>
            )}

            <FormField
              id="name"
              label="Nama Pelanggan"
              error={errors.name}
              helpText="Nama lengkap pelanggan yang akan ditampilkan di sistem"
            >
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama pelanggan"
                className={inputClassName("name")}
              />
            </FormField>

            <FormField
              id="id_sl"
              label="ID SL"
              error={errors.id_sl}
              helpText="ID SL adalah kode pelanggan (opsional)"
            >
              <Input
                id="id_sl"
                name="id_sl"
                value={formData.id_sl}
                onChange={handleInputChange}
                placeholder="Masukkan ID SL"
                className={inputClassName("id_sl")}
              />
            </FormField>

            <FormField
              id="address"
              label="Alamat"
              error={errors.address}
              helpText="Alamat lengkap pelanggan"
            >
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Masukkan alamat"
                rows={3}
                className={cn(
                  "mt-1 block w-full rounded-md shadow-sm sm:text-sm",
                  inputClassName("address")
                )}
              />
            </FormField>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/pelanggan")}
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
