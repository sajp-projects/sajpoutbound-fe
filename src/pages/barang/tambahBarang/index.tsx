import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateProduct } from "@/hooks/barang";
import { useWarehouses } from "@/hooks/gudang";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { showSuccessAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { cn } from "@/lib/utils";
import { FormErrors, FormErrorData } from "@/utils/errorHandler";

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

export default function TambahBarang() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    description: "",
    price: "",
    quantity: "",
    warehouseId: "",
  });
  const [errors, setErrors] = useState<ProductFormErrors>({});

  // Fetch daftar gudang untuk dropdown
  const { data: warehousesData } = useWarehouses({
    staleTime: 300000, // 5 menit
  });
  const warehouses = warehousesData?.warehouses || [];

  const createProductMutation = useCreateProduct({
    onSuccess: (data) => {
      showSuccessAlert("Sukses!", "Barang berhasil ditambahkan").then(() => {
        navigate(`/barang/${data.id}`);
      });
    },
    onError: (error) => {
      try {
        const errorObj = JSON.parse(error.message) as FormErrorData;

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          const newErrors: ProductFormErrors = {};

          errorObj.details.forEach((detail) => {
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
        setErrors({ general: "Terjadi kesalahan saat menambahkan barang" });
      }
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validasi form
    const newErrors: ProductFormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama barang harus diisi";
    if (!formData.sku.trim()) newErrors.sku = "SKU harus diisi";
    if (!formData.price.trim()) newErrors.price = "Harga harus diisi";
    if (!formData.quantity.trim()) newErrors.quantity = "Jumlah stok harus diisi";
    if (!formData.warehouseId.trim()) newErrors.warehouseId = "Gudang harus dipilih";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Parse numeric values
    const productData = {
      ...formData,
      price: parseFloat(formData.price.replace(/[^\d.-]/g, "")),
      quantity: parseInt(formData.quantity, 10),
    };

    showConfirmationAlert("Konfirmasi", "Apakah Anda yakin ingin menambahkan barang baru ini?", "Ya, Tambahkan!", "Batal").then((result) => {
      if (isConfirmed(result)) {
        createProductMutation.mutate(productData);
      }
    });
  };

  const isSubmitting = createProductMutation.isPending;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex items-center">
        <Link to="/barang">
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Barang</h1>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Barang Baru</CardTitle>
          <CardDescription>Isi data barang yang akan ditambahkan ke sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Barang
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama barang"
                  className={cn("mt-1 w-full border-gray-300", errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500")}
                />
                {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama untuk mengidentifikasi barang</p>}
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Masukkan SKU barang"
                  className={cn("mt-1 w-full border-gray-300", errors.sku ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500")}
                />
                {errors.sku ? <p className="mt-1 text-sm text-red-500">{errors.sku}</p> : <p className="mt-1 text-sm text-gray-500">Kode identifikasi unik untuk barang</p>}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Harga
                </label>
                <Input
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Masukkan harga barang"
                  className={cn("mt-1 w-full border-gray-300", errors.price ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500")}
                />
                {errors.price ? <p className="mt-1 text-sm text-red-500">{errors.price}</p> : <p className="mt-1 text-sm text-gray-500">Harga barang dalam Rupiah</p>}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Jumlah Stok
                </label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Masukkan jumlah stok"
                  className={cn("mt-1 w-full border-gray-300", errors.quantity ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "focus:border-blue-500 focus:ring-blue-500")}
                />
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
                  onChange={(e) => handleInputChange(e)}
                  className={cn(
                    "mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    errors.warehouseId && "border-red-300 focus:border-red-500 focus:ring-red-500"
                  )}
                >
                  <option value="">Pilih gudang</option>
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
              <Button variant="outline" onClick={() => navigate("/barang")} disabled={isSubmitting} type="button">
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
