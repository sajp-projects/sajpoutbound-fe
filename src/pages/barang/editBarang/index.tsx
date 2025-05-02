import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useProduct, useUpdateProduct } from "@/hooks/barang";
import { useWarehouses } from "@/hooks/gudang";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { cn } from "@/lib/utils";
import { showSuccessAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { FormErrors } from "@/utils/errorHandler";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

// Type untuk form edit product
interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: string;
  quantity: string;
  warehouseId: string;
}

type ProductFormErrors = FormErrors<ProductFormData> & {
  general?: string;
};

export default function EditBarang() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    description: "",
    price: "",
    quantity: "",
    warehouseId: "",
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<ProductFormErrors>({});

  // Fetch detail barang
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

  // Fetch daftar gudang untuk dropdown
  const { data: warehousesData } = useWarehouses({
    staleTime: 300000, // 5 menit
  });
  const warehouses = warehousesData?.warehouses || [];

  // Set form data dari barang yang diterima
  useEffect(() => {
    if (barang) {
      setFormData({
        name: barang.name || "",
        sku: barang.sku || "",
        description: barang.description || "",
        price: barang.price !== null && barang.price !== undefined ? barang.price.toString() : "",
        quantity: barang.quantity !== null && barang.quantity !== undefined ? barang.quantity.toString() : "0",
        warehouseId: barang.warehouseId || "",
      });
    }
  }, [barang]);

  // Mutation untuk update barang
  const updateProductMutation = useUpdateProduct({
    onSuccess: (data) => {
      showSuccessAlert("Sukses!", "Barang berhasil diperbarui").then(() => {
        navigate(`/barang/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message);

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          const newErrors: ProductFormErrors = {};

          errorObj.details.forEach((detail: { message: string; path: string[] }) => {
            if (detail.path.includes("name")) {
              newErrors.name = detail.message;
            } else if (detail.path.includes("sku")) {
              newErrors.sku = detail.message;
            } else if (detail.path.includes("description")) {
              newErrors.description = detail.message;
            } else if (detail.path.includes("price")) {
              newErrors.price = detail.message;
            } else if (detail.path.includes("quantity")) {
              newErrors.quantity = detail.message;
            } else if (detail.path.includes("warehouseId")) {
              newErrors.warehouseId = detail.message;
            } else {
              newErrors.general = detail.message;
            }
          });

          setErrors(newErrors);
        } else {
          setErrors({ general: errorObj.message });
        }
      } catch {
        setErrors({ general: "Terjadi kesalahan saat memperbarui barang" });
      }
    },
  });

  // Handler untuk perubahan form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof ProductFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler untuk submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Parse numeric values
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
    };

    // Tampilkan konfirmasi sebelum mengubah barang
    showConfirmationAlert("Konfirmasi", "Apakah Anda yakin ingin menyimpan perubahan data barang ini?", "Ya, Simpan!", "Batal").then((result) => {
      if (isConfirmed(result)) {
        updateProductMutation.mutate({
          id: id || "",
          ...productData,
        });
      }
    });
  };

  const isSubmitting = updateProductMutation.isPending;

  // Helper function untuk class input
  const inputClassName = (fieldName: keyof ProductFormData) => cn("mt-1 w-full border-gray-300", errors[fieldName] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500");

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to={`/barang/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
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
            <ErrorState title="Gagal memuat data" message={error instanceof Error ? error.message : "Terjadi kesalahan pada server"} onRetry={refetch} retryButtonText="Coba lagi" />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nama Barang
                  </label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama barang" className={inputClassName("name")} />
                  {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama untuk mengidentifikasi barang</p>}
                </div>

                <div>
                  <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                    SKU
                  </label>
                  <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} disabled placeholder="Masukkan SKU barang" className={inputClassName("sku")} />
                  <p className="mt-1 text-sm text-gray-500">SKU tidak dapat diubah</p>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Harga
                  </label>
                  <Input id="price" name="price" type="number" min="0" step="1" value={formData.price} onChange={handleInputChange} placeholder="Masukkan harga barang" className={inputClassName("price")} />
                  {errors.price ? <p className="mt-1 text-sm text-red-500">{errors.price}</p> : <p className="mt-1 text-sm text-gray-500">Harga barang dalam Rupiah</p>}
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Jumlah Stok
                  </label>
                  <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} placeholder="Masukkan jumlah stok" className={inputClassName("quantity")} />
                  {errors.quantity ? <p className="mt-1 text-sm text-red-500">{errors.quantity}</p> : <p className="mt-1 text-sm text-gray-500">Jumlah stok barang yang tersedia</p>}
                </div>

                <div>
                  <label htmlFor="warehouseId" className="block text-sm font-medium text-gray-700">
                    Gudang
                  </label>
                  <select
                    id="warehouseId"
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleInputChange}
                    className={cn(
                      "mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      errors.warehouseId && "border-red-300 focus:border-red-500 focus:ring-red-500"
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
                  {errors.warehouseId ? <p className="mt-1 text-sm text-red-500">{errors.warehouseId}</p> : <p className="mt-1 text-sm text-gray-500">Pilih gudang tempat penyimpanan barang</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
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
                      errors.description && "border-red-300 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.description ? <p className="mt-1 text-sm text-red-500">{errors.description}</p> : <p className="mt-1 text-sm text-gray-500">Deskripsi detail tentang barang</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(`/barang/${id}`)} disabled={isSubmitting} type="button">
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
