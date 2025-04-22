import { useCreateRole } from "@/hooks/role";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  general?: string;
}

interface ValidationErrorDetail {
  message: string;
  path: string[];
  type: string;
}

export default function TambahPeran() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const createRole = useCreateRole({
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
      // Coba parsing error untuk mendapatkan detail validasi
      try {
        const errorObj = JSON.parse(error.message);
        if (errorObj.details) {
          // Format error Joi validation
          const newErrors: FormErrors = {};
          errorObj.details.forEach((detail: ValidationErrorDetail) => {
            if (detail.path && detail.path.length > 0) {
              const field = detail.path[0] as keyof FormErrors;
              newErrors[field] = detail.message;
            }
          });
          setErrors(newErrors);
        } else if (errorObj.errorType === "ROLE_NAME_DUPLICATE") {
          // Error nama duplikat
          setErrors({ name: "Nama peran sudah digunakan" });
        } else {
          // Error umum
          setErrors({ general: errorObj.message || error.message });
        }
      } catch {
        // Fallback untuk error yang tidak bisa di-parse
        setErrors({ general: error.message });

        Swal.fire({
          title: "Gagal!",
          text: `Gagal menambahkan peran: ${error.message}`,
          icon: "error",
          confirmButtonText: "Tutup",
        });
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    validateField(name, value);

    // Mark field as touched
    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }
  };

  const validateField = (fieldName: string, value: string) => {
    const fieldErrors: FormErrors = { ...errors };

    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          fieldErrors.name = "Nama peran harus diisi";
        } else if (value.length < 2) {
          fieldErrors.name = "Nama peran minimal 2 karakter";
        } else {
          delete fieldErrors.name;
        }
        break;
      case "description":
        if (!value.trim()) {
          fieldErrors.description = "Deskripsi peran harus diisi";
        } else {
          delete fieldErrors.description;
        }
        break;
      default:
        break;
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const validateForm = () => {
    const nameValid = validateField("name", formData.name);
    const descriptionValid = validateField("description", formData.description);

    // Mark all fields as touched
    setTouched({
      name: true,
      description: true,
    });

    return nameValid && descriptionValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      createRole.mutate(formData);
    }
  };

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

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Informasi Peran</h2>
          <p className="text-sm text-gray-500">Masukkan informasi untuk peran baru</p>
        </div>

        {errors.general && <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md text-red-600">{errors.general}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Nama Peran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama peran"
                value={formData.name}
                onChange={handleChange}
                className={`w-full ${errors.name && touched.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.name && touched.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="description"
                name="description"
                placeholder="Masukkan deskripsi peran"
                value={formData.description}
                onChange={handleChange}
                className={cn(
                  "flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  errors.description && touched.description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-input bg-background ring-offset-background focus-visible:ring-ring"
                )}
              />
              {errors.description && touched.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Link to="/peran">
              <Button variant="outline" type="button" className="px-4">
                Batal
              </Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4" disabled={createRole.isPending}>
              {createRole.isPending ? (
                <>
                  <div className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                "Simpan Peran"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
