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
import { useProduct, useUpdateProduct } from "@/hooks/barang";
import { useWarehouses } from "@/hooks/gudang";
import { cn } from "@/lib/utils";
import { SATUAN_OPTIONS } from "@/utils/satuan";
import { FormErrors } from "@/utils/errorHandler";
import {
  isConfirmed,
  showConfirmationAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { UpdateProductInput } from "@/types/barang";

interface ProductFormData {
  name: string;
  id_sl: string;
  description: string;
  satuan: string;
  warehouseId: string;
}

type ProductFormErrors = FormErrors<ProductFormData> & {
  general?: string;
};

export default function EditBarang() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    id_sl: "",
    description: "",
    satuan: "",
    warehouseId: "",
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const {
    data: barang,
    isLoading,
    isError,
    error,
    refetch,
  } = useProduct(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  const { data: warehousesData } = useWarehouses({
    staleTime: 300000,
  });
  const warehouses = warehousesData?.warehouses || [];

  useEffect(() => {
    if (barang) {
      setFormData({
        name: barang.name || "",
        id_sl: barang.id_sl || "",
        description: barang.description || "",
        satuan: barang.satuan || "",
        warehouseId: barang.warehouseId || "",
      });
    }
  }, [barang]);

  const updateProductMutation = useUpdateProduct({
    onSuccess: (data) => {
      showSuccessAlert("Sukses!", "Barang berhasil diperbarui").then(() => {
        navigate(`/barang/${data.id}`);
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
          const newErrors: ProductFormErrors = {};

          errorObj.details.forEach(
            (detail: { message: string; path: string[] }) => {
              if (detail.path.includes("name")) {
                newErrors.name = detail.message;
              } else if (detail.path.includes("id_sl")) {
                newErrors.id_sl = detail.message;
              } else if (detail.path.includes("description")) {
                newErrors.description = detail.message;
              } else if (detail.path.includes("warehouseId")) {
                newErrors.warehouseId = detail.message;
              } else if (detail.path.includes("satuan")) {
                newErrors.satuan = detail.message;
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
        setErrors({ general: "Terjadi kesalahan saat memperbarui barang" });
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

    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors: ProductFormErrors = {};
    if (!formData.name.trim()) {
      validationErrors.name = "Nama barang harus diisi";
    }
    if (!formData.satuan.trim()) {
      validationErrors.satuan = "Satuan harus dipilih";
    }
    if (!formData.warehouseId.trim()) {
      validationErrors.warehouseId = "Gudang harus dipilih";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    showConfirmationAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin menyimpan perubahan data barang ini?",
      "Ya, Simpan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        const updateData: UpdateProductInput & { id: string } = {
          id: id || "",
          name: formData.name,
          description: formData.description,
          satuan: formData.satuan,
          warehouseId: formData.warehouseId,
        };

        if (formData.id_sl.trim()) {
          updateData.id_sl = formData.id_sl;
        }

        updateProductMutation.mutate(updateData);
      }
    });
  };

  const isSubmitting = updateProductMutation.isPending;

  const inputClassName = (fieldName: keyof ProductFormData) =>
    cn(
      "mt-1 w-full border-gray-300",
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "focus:border-blue-500 focus:ring-blue-500"
    );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/barang/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Barang</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Barang</CardTitle>
          <CardDescription>Perbarui informasi barang yang ada</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState text="Memuat data barang..." />
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
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nama Barang
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama barang"
                    className={inputClassName("name")}
                  />
                  {errors.name ? (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Nama untuk mengidentifikasi barang
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
                    placeholder="Masukkan ID Barang (opsional)"
                    className={inputClassName("id_sl")}
                  />
                  {errors.id_sl ? (
                    <p className="mt-1 text-sm text-red-500">{errors.id_sl}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Kode identifikasi unik untuk barang (opsional)
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="satuan"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Satuan
                  </label>
                  <select
                    id="satuan"
                    name="satuan"
                    value={formData.satuan}
                    onChange={handleInputChange}
                    className={cn(
                      "mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      errors.satuan &&
                        "border-red-300 focus:border-red-500 focus:ring-red-500"
                    )}
                  >
                    <option value="" disabled>
                      Pilih satuan
                    </option>
                    {SATUAN_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.satuan ? (
                    <p className="mt-1 text-sm text-red-500">{errors.satuan}</p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Satuan ukuran barang
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="warehouseId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Gudang
                  </label>
                  <select
                    id="warehouseId"
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleInputChange}
                    className={cn(
                      "mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      errors.warehouseId &&
                        "border-red-300 focus:border-red-500 focus:ring-red-500"
                    )}
                  >
                    <option value="" disabled>
                      Pilih gudang
                    </option>
                    {warehouses && warehouses.length > 0 ? (
                      warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Tidak ada gudang tersedia
                      </option>
                    )}
                  </select>
                  {errors.warehouseId ? (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.warehouseId}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">
                      Pilih gudang tempat penyimpanan barang
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
                    placeholder="Deskripsikan barang secara detail"
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
                      Deskripsi detail tentang barang
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/barang/${id}`)}
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
