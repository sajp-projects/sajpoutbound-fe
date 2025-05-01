import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateWarehouse } from "@/hooks/gudang";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

interface WarehouseFormData {
  name: string;
  description: string;
}

export default function TambahGudang() {
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: "",
    description: "",
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    general?: string;
  }>({});

  // Mutation untuk menambah gudang
  const createWarehouseMutation = useCreateWarehouse({
    onSuccess: (data) => {
      Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: "Gudang berhasil ditambahkan",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate(`/gudang/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message);

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          // Petakan error validasi ke field yang sesuai
          const newErrors: {
            name?: string;
            description?: string;
            general?: string;
          } = {};

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
          // Error umum non-validasi
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: "Terjadi kesalahan saat menambahkan gudang" });
      }
    },
  });

  // Handler untuk perubahan input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler untuk submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validasi form sederhana
    const validationErrors: {
      name?: string;
      description?: string;
      general?: string;
    } = {};

    if (!formData.name.trim()) {
      validationErrors.name = "Nama gudang harus diisi";
    } else if (formData.name.trim().length < 3) {
      validationErrors.name = "Nama gudang minimal 3 karakter";
    }

    if (!formData.description.trim()) {
      validationErrors.description = "Deskripsi gudang harus diisi";
    } else if (formData.description.trim().length < 10) {
      validationErrors.description = "Deskripsi gudang minimal 10 karakter";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Tampilkan konfirmasi sebelum menambahkan gudang
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menambahkan gudang baru ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Tambahkan!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        createWarehouseMutation.mutate(formData);
      }
    });
  };

  const isSubmitting = createWarehouseMutation.isPending;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/gudang">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Gudang</h1>
        </div>
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
              <div className="mt-1">
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama gudang" className={cn("w-full", errors.name && "border-red-300 focus:border-red-500 focus:ring-red-500")} />
              </div>
              {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama untuk mengidentifikasi gudang</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Deskripsikan fungsi dan lokasi gudang"
                  className={cn(
                    "block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                />
              </div>
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
