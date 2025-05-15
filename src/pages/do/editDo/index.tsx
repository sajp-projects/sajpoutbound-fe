import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";

import { useDeliveryOrder, useUpdateDeliveryOrder } from "@/hooks/do";
import { useCustomers } from "@/hooks/pelanggan";
import { useProducts } from "@/hooks/barang";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateDeliveryOrderProduct,
  UpdateDeliveryOrderInput,
} from "@/types/do";
import { showSuccessAlert, showErrorAlert } from "@/utils/sweetAlert";
import { LoadingState } from "@/components/LoadingState";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  helpText?: string;
  required?: boolean;
}

function FormField({
  id,
  label,
  error,
  children,
  helpText,
  required,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
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

export default function EditDo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deliveryOrderId = id || "";

  // State untuk form data
  const [formData, setFormData] = useState<
    Omit<UpdateDeliveryOrderInput, "items">
  >({
    customerId: "",
    address: "",
    internalNote: "",
  });

  const [items, setItems] = useState<CreateDeliveryOrderProduct[]>([
    { productId: "", quantity: 1 },
  ]);

  // Menggunakan hooks untuk mengambil data dari API
  const { data: customersData, isLoading: loadingCustomers } = useCustomers({
    staleTime: 300000, // 5 menit cache
    refetchOnWindowFocus: false,
  });

  const { data: productsData, isLoading: loadingProducts } = useProducts({
    staleTime: 300000, // 5 menit cache
    refetchOnWindowFocus: false,
  });

  // Ekstrak data dari response API
  const customers = customersData?.customers || [];
  const products = productsData?.products || [];

  // Ambil data DO yang akan diedit
  const {
    data: deliveryOrder,
    isLoading: isLoadingDeliveryOrder,
    error: deliveryOrderError,
  } = useDeliveryOrder(
    { id: deliveryOrderId },
    {
      enabled: !!deliveryOrderId,
      refetchOnWindowFocus: false,
    }
  );

  // Isi form dengan data DO yang ada setelah diambil dari API
  useEffect(() => {
    if (deliveryOrder) {
      setFormData({
        customerId: deliveryOrder.customerId,
        address: deliveryOrder.address,
        internalNote: deliveryOrder.internalNote,
      });

      // Isi data item produk
      if (deliveryOrder.items && deliveryOrder.items.length > 0) {
        const mappedItems = deliveryOrder.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }));
        setItems(mappedItems);
      }
    }
  }, [deliveryOrder]);

  // Handle saat pelanggan dipilih, otomatis isi alamat jika tersedia
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const customer = customers.find((c) => c.id === value);
    setFormData({
      ...formData,
      customerId: value,
      address: customer?.address || formData.address,
    });
  };

  // Handle perubahan input form
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle perubahan pada item produk
  const handleItemChange = (
    index: number,
    field: keyof CreateDeliveryOrderProduct,
    value: string | number
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "quantity" ? Number(value) : value,
    };
    setItems(updatedItems);
  };

  // Tambah item baru
  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  // Hapus item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  // Gunakan hook untuk mengupdate DO
  const updateDeliveryOrder = useUpdateDeliveryOrder({
    onSuccess: (data) => {
      showSuccessAlert(
        "Berhasil!",
        "Delivery Order telah berhasil diperbarui."
      );
      navigate(`/do/${data.id}`);
    },
    onError: (error) => {
      let errorMessage = "Terjadi kesalahan saat memperbarui Delivery Order.";

      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.message || errorMessage;
      } catch (error: unknown) {
        errorMessage = error instanceof Error ? error.message : errorMessage;
      }

      showErrorAlert("Gagal Memperbarui DO", errorMessage);
    },
  });

  // Validasi form sebelum submit
  const validateForm = () => {
    if (!formData.customerId) {
      showErrorAlert(
        "Validasi Gagal",
        "Silakan pilih pelanggan terlebih dahulu."
      );
      return false;
    }

    if (!formData.address) {
      showErrorAlert("Validasi Gagal", "Alamat pengiriman tidak boleh kosong.");
      return false;
    }

    if (items.length === 0) {
      showErrorAlert("Validasi Gagal", "Tambahkan minimal satu item barang.");
      return false;
    }

    const invalidItems = items.filter(
      (item) => !item.productId || item.quantity <= 0
    );
    if (invalidItems.length > 0) {
      showErrorAlert(
        "Validasi Gagal",
        "Semua item harus memiliki produk yang dipilih dan kuantitas lebih dari 0."
      );
      return false;
    }

    return true;
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Siapkan data untuk dikirim
    const updateData: UpdateDeliveryOrderInput & { id: string } = {
      id: deliveryOrderId,
      ...formData,
      items,
    };

    // Panggil API untuk mengupdate DO
    updateDeliveryOrder.mutate(updateData);
  };

  // Untuk styling yang konsisten
  const selectClassName = cn(
    "mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
  );

  const inputClassName = cn(
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
  );

  if (isLoadingDeliveryOrder) {
    return <LoadingState text="Memuat data delivery order..." />;
  }

  if (deliveryOrderError || !deliveryOrder) {
    return (
      <div className="p-8 rounded-lg bg-red-50">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-700">
            Delivery Order tidak ditemukan
          </h2>
          <p className="mb-4 text-red-600">
            Data delivery order dengan ID yang diberikan tidak ditemukan atau
            telah dihapus.
          </p>
          <Link to="/do">
            <Button>Kembali ke Daftar DO</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/do/${deliveryOrderId}`}>
          <Button variant="ghost" size="sm" className="mr-4 text-gray-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Delivery Order
          </h1>
          <p className="text-sm text-gray-500">
            Perbarui data delivery order untuk {deliveryOrder.customer.name}
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Delivery Order</CardTitle>
          <CardDescription>
            Perbarui informasi untuk delivery order ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informasi Dasar
                </h3>
                <div className="space-y-4">
                  <FormField
                    id="customerId"
                    label="Pelanggan"
                    required
                    helpText="Pilih pelanggan yang akan menerima barang"
                  >
                    <select
                      id="customerId"
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleCustomerChange}
                      className={selectClassName}
                    >
                      <option value="">Pilih pelanggan</option>
                      {loadingCustomers ? (
                        <option value="" disabled>
                          Memuat pelanggan...
                        </option>
                      ) : customers.length === 0 ? (
                        <option value="" disabled>
                          Tidak ada data pelanggan
                        </option>
                      ) : (
                        customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))
                      )}
                    </select>
                  </FormField>

                  <FormField
                    id="address"
                    label="Alamat Pengiriman"
                    required
                    helpText="Alamat lengkap pengiriman barang"
                  >
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Masukkan alamat pengiriman"
                      className={inputClassName}
                    />
                  </FormField>

                  <FormField
                    id="internalNote"
                    label="Catatan Internal"
                    helpText="Catatan tambahan untuk internal (opsional)"
                  >
                    <Textarea
                      id="internalNote"
                      name="internalNote"
                      value={formData.internalNote || ""}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Tambahkan catatan internal jika diperlukan"
                      className={inputClassName}
                    />
                  </FormField>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Daftar Barang
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                    className="text-blue-600 bg-white border border-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Barang
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-700">
                          Item #{index + 1}
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          id={`product-${index}`}
                          label="Barang"
                          required
                        >
                          <select
                            id={`product-${index}`}
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "productId",
                                e.target.value
                              )
                            }
                            className={selectClassName}
                          >
                            <option value="">Pilih barang</option>
                            {loadingProducts ? (
                              <option value="" disabled>
                                Memuat barang...
                              </option>
                            ) : products.length === 0 ? (
                              <option value="" disabled>
                                Tidak ada data barang
                              </option>
                            ) : (
                              products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} ({product.satuan})
                                </option>
                              ))
                            )}
                          </select>
                        </FormField>

                        <FormField
                          id={`quantity-${index}`}
                          label="Kuantitas"
                          required
                        >
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className={inputClassName}
                          />
                        </FormField>
                      </div>

                      {item.productId && (
                        <div className="mt-2 text-sm text-gray-500">
                          {products.find((p) => p.id === item.productId)?.name}{" "}
                          ({item.quantity}{" "}
                          {
                            products.find((p) => p.id === item.productId)
                              ?.satuan
                          }
                          )
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link to={`/do/${deliveryOrderId}`}>
                <Button
                  type="button"
                  variant="outline"
                  className="text-gray-700"
                >
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                className="text-white bg-blue-600 hover:bg-blue-700"
                disabled={updateDeliveryOrder.isPending}
              >
                {updateDeliveryOrder.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Perbarui
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
