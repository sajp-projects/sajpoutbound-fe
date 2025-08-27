import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { AlertTriangle, Loader2, Plus, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxItem } from "@/components/ui/combobox";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInfiniteCustomers } from "@/hooks/customer";
import { useCreateDeliveryOrder } from "@/hooks/do";
import { useInfiniteProducts } from "@/hooks/product";
import { cn } from "@/lib/utils";
import {
  CreateDeliveryOrderInput,
  CreateDeliveryOrderProduct,
} from "@/types/do";
import { formatInputNumber, handleDecimalInput } from "@/utils/formatNumber";
import { showErrorAlert, showSuccessAlert } from "@/utils/sweetAlert";
import { toZonedTime } from "date-fns-tz";

interface ExtendedProduct extends CreateDeliveryOrderProduct {
  productName?: string;
  productSatuan?: string;
}

const itemSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.empty": "Barang harus dipilih",
    "any.required": "Barang harus dipilih",
  }),
  quantity: Joi.number().positive().required().messages({
    "number.base": "Kuantitas harus berupa angka",
    "number.positive": "Kuantitas harus lebih dari 0",
    "any.required": "Kuantitas harus diisi",
  }),
  productName: Joi.string().allow("").optional(),
  productSatuan: Joi.string().allow("").optional(),
});

const schema = Joi.object({
  customerId: Joi.string().required().messages({
    "string.empty": "Pelanggan harus dipilih",
    "any.required": "Pelanggan harus dipilih",
  }),
  customerName: Joi.string().allow("").optional(),
  address: Joi.string().required().messages({
    "string.empty": "Alamat pengiriman tidak boleh kosong",
    "any.required": "Alamat pengiriman harus diisi",
  }),
  internalNote: Joi.string().allow("").optional(),
  deliverySchedule: Joi.date().optional().allow(null),
  items: Joi.array().min(1).items(itemSchema).required().messages({
    "array.min": "Minimal harus ada 1 barang",
    "any.required": "Daftar barang harus diisi",
  }),
  tempProduct: Joi.string().allow("").optional(),
  tempProductId: Joi.string().allow("").optional(),
  tempQuantity: Joi.number()
    .positive()
    .messages({
      "number.base": "Kuantitas harus berupa angka",
      "number.positive": "Kuantitas harus lebih dari 0",
    })
    .optional(),
});

export default function TambahDo() {
  const navigate = useNavigate();
  const [showItems, setShowItems] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [useCustomerAddress, setUseCustomerAddress] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<{
    name: string;
    quantity: number;
  } | null>(null);
  const [tempQuantityDisplay, setTempQuantityDisplay] = useState("");
  const inputClassName = cn(
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
  } = useForm<
    CreateDeliveryOrderInput & {
      customerName?: string;
      items: ExtendedProduct[];
      tempProduct?: string;
      tempProductId?: string;
      tempQuantity?: number;
      deliverySchedule?: Date;
    }
  >({
    resolver: joiResolver(schema),
    defaultValues: {
      customerId: "",
      customerName: "",
      address: "",
      internalNote: "",
      deliverySchedule: (() => {
        const jakartaTime = toZonedTime(new Date(), "Asia/Jakarta");
        return jakartaTime;
      })(),
      items: [],
      tempProduct: "",
      tempProductId: "",
      tempQuantity: undefined,
    },
  });

  const { append, remove, update } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchCustomerId = watch("customerId");

  const {
    data: customersData,
    isLoading: loadingCustomers,
    fetchNextPage: fetchNextCustomers,
    hasNextPage: hasNextCustomers,
    isFetchingNextPage: isFetchingNextCustomers,
  } = useInfiniteCustomers({
    searchQuery: customerSearchQuery,
    limit: 10,
  });

  const {
    data: productsData,
    isLoading: loadingProducts,
    fetchNextPage: fetchNextProducts,
    hasNextPage: hasNextProducts,
    isFetchingNextPage: isFetchingNextProducts,
  } = useInfiniteProducts({
    searchQuery: productSearchQuery,
    limit: 10,
  });

  // Flatten all customers and products from infinite query pages
  const customers =
    customersData?.pages.flatMap((page) => page.customers) || [];
  const products = productsData?.pages.flatMap((page) => page.products) || [];

  const customerOptions: ComboboxItem[] = customers.map((customer) => ({
    label: customer.name,
    value: customer.id,
  }));

  const productOptions: ComboboxItem[] = products.map((product) => ({
    label: product.name,
    value: product.id,
    secondary: product.satuan,
  }));

  const handleCustomerSearch = useCallback((query: string) => {
    setCustomerSearchQuery(query);
    // Search is handled by the infinite query hook
  }, []);

  const handleProductSearch = useCallback((query: string) => {
    setProductSearchQuery(query);
    // Search is handled by the infinite query hook
  }, []);

  const createDeliveryOrder = useCreateDeliveryOrder({
    onSuccess: (data) => {
      showSuccessAlert("Berhasil!", "Delivery Order telah berhasil dibuat.");
      navigate(`/do/${data.id}`);
    },
    onError: (error) => {
      let errorMessage = "Terjadi kesalahan saat membuat Delivery Order.";
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.message || errorMessage;
      } catch (error: unknown) {
        errorMessage = error instanceof Error ? error.message : errorMessage;
      }
      showErrorAlert("Gagal Membuat DO", errorMessage);
    },
  });

  useEffect(() => {
    if (
      watchItems &&
      watchItems.length > 0 &&
      watchItems.some((item) => item.productId)
    ) {
      setShowItems(true);
    } else {
      setShowItems(false);
    }
  }, [watchItems]);

  const handleCustomerSelect = (item: ComboboxItem) => {
    const customer = customers.find((c) => c.id === item.value);
    if (customer) {
      setValue("customerId", customer.id, { shouldValidate: true });
      setValue("customerName", customer.name);

      if (useCustomerAddress && customer.address) {
        setValue("address", customer.address, { shouldValidate: true });
      }
    }
  };

  const handleUseCustomerAddressChange = (checked: boolean) => {
    setUseCustomerAddress(checked);

    if (checked) {
      const customerId = watch("customerId");
      if (customerId) {
        const selectedCustomer = customers.find((c) => c.id === customerId);
        if (selectedCustomer && selectedCustomer.address) {
          setValue("address", selectedCustomer.address, {
            shouldValidate: true,
          });
        }
      }
    }
  };

  const resetItemForm = () => {
    setValue("tempProduct", "");
    setValue("tempProductId", "");
    setValue("tempQuantity", undefined);
    setTempQuantityDisplay("");
  };

  const handleAddItem = (product: (typeof products)[0], quantity: number) => {
    if (!quantity || quantity <= 0) {
      showErrorAlert("Validasi Gagal", "Kuantitas harus lebih dari 0");
      return;
    }

    const isDuplicate = watchItems.some(
      (item) =>
        item.productId === product.id &&
        (editingItemIndex === null ||
          watchItems.indexOf(item) !== editingItemIndex)
    );

    if (isDuplicate) {
      showErrorAlert(
        "Validasi Gagal",
        "Barang ini sudah ada dalam daftar. Tidak dapat menambahkan barang yang sama."
      );
      return;
    }

    append({
      productId: product.id,
      quantity: quantity,
      productName: product.name,
      productSatuan: product.satuan,
    } as ExtendedProduct);

    resetItemForm();
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    const item = watchItems[index];
    setValue("tempProduct", item.productName || "");
    setValue("tempProductId", item.productId);
    setValue("tempQuantity", item.quantity);
    setTempQuantityDisplay(formatInputNumber(item.quantity));
  };

  const handleUpdateItem = (
    product: (typeof products)[0],
    quantity: number
  ) => {
    if (!quantity || quantity <= 0) {
      showErrorAlert("Validasi Gagal", "Kuantitas harus lebih dari 0");
      return;
    }

    if (editingItemIndex !== null) {
      const isDuplicate = watchItems.some(
        (item, index) =>
          item.productId === product.id && index !== editingItemIndex
      );

      if (isDuplicate) {
        showErrorAlert(
          "Validasi Gagal",
          "Barang ini sudah ada dalam daftar. Tidak dapat menambahkan barang yang sama."
        );
        return;
      }

      update(editingItemIndex, {
        productId: product.id,
        quantity: quantity,
        productName: product.name,
        productSatuan: product.satuan,
      } as ExtendedProduct);

      setEditingItemIndex(null);
      resetItemForm();
    }
  };

  const onSubmit = (
    data: CreateDeliveryOrderInput & {
      customerName?: string;
      items: ExtendedProduct[];
    }
  ) => {
    // Check if there's a pending product that hasn't been added
    const tempProductId = watch("tempProductId");
    const tempQuantity = watch("tempQuantity");

    if (tempProductId && tempQuantity && tempQuantity > 0) {
      const selectedProduct = products.find((p) => p.id === tempProductId);
      if (selectedProduct) {
        setPendingProduct({
          name: selectedProduct.name,
          quantity: tempQuantity,
        });
        setShowWarningModal(true);
        return;
      }
    }


    // Set default delivery schedule to today's Jakarta time if not specified
    let finalDeliverySchedule = data.deliverySchedule;
    if (!finalDeliverySchedule) {
      const jakartaTime = toZonedTime(new Date(), "Asia/Jakarta");
      finalDeliverySchedule = jakartaTime;
    }

    const validItems = data.items.filter((item) => item.productId);

    if (validItems.length === 0) {
      setError("items", {
        type: "manual",
        message: "Tambahkan minimal satu barang",
      });
      showErrorAlert("Validasi Gagal", "Tambahkan minimal satu barang.");
      return;
    }

    const productIds = validItems.map((item) => item.productId);
    const hasDuplicates = productIds.some(
      (id, index) => productIds.indexOf(id) !== index
    );

    if (hasDuplicates) {
      showErrorAlert(
        "Validasi Gagal",
        "Terdapat barang duplikat dalam daftar. Hapus barang duplikat sebelum melanjutkan."
      );
      return;
    }

    createDeliveryOrder.mutate({
      customerId: data.customerId,
      address: data.address,
      internalNote: data.internalNote || "",
      deliverySchedule: finalDeliverySchedule,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    });

  };

  const handleProceedWithoutAdding = () => {
    setShowWarningModal(false);
    setPendingProduct(null);

    // Reset the temp fields
    setValue("tempProduct", "");
    setValue("tempProductId", "");
    setValue("tempQuantity", undefined);
    setTempQuantityDisplay("");

    // Submit the form again
    handleSubmit(onSubmit)();
  };

  const handleAddPendingProduct = () => {
    if (pendingProduct) {
      const tempProductId = watch("tempProductId");
      const tempQuantity = watch("tempQuantity");

      if (tempProductId && tempQuantity) {
        const selectedProduct = products.find((p) => p.id === tempProductId);
        if (selectedProduct) {
          handleAddItem(selectedProduct, tempQuantity);
        }
      }
    }

    setShowWarningModal(false);
    setPendingProduct(null);

    // Submit the form again
    handleSubmit(onSubmit)();
  };

  const handleProductSelect = (item: ComboboxItem) => {
    const product = products.find((p) => p.id === item.value);
    if (product) {
      setValue("tempProductId", product.id);
      setValue("tempProduct", product.name);
    }
  };

  const handleProductAction = () => {
    const productId = watch("tempProductId");
    const quantity = watch("tempQuantity");

    if (productId) {
      const selectedProduct = products.find((p) => p.id === productId);
      if (selectedProduct) {
        if (editingItemIndex !== null) {
          handleUpdateItem(selectedProduct, quantity as number);
        } else {
          handleAddItem(selectedProduct, quantity as number);
        }
      }
    }
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tambah Delivery Order
          </h1>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Form Delivery Order Baru</CardTitle>
          <CardDescription>
            Isi informasi untuk pembuatan delivery order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Informasi Dasar
                </h3>
                <div className="space-y-4">
                  <Combobox
                    items={customerOptions}
                    value={watchCustomerId}
                    onValueChange={(value) => {
                      setValue("customerId", value, { shouldValidate: true });
                    }}
                    onSelect={handleCustomerSelect}
                    placeholder="Masukkan nama pelanggan"
                    searchPlaceholder="Cari pelanggan..."
                    isLoading={loadingCustomers}
                    error={errors.customerId?.message}
                    name="customerId"
                    label="Pelanggan"
                    required
                    helpText="Ketik untuk mencari pelanggan"
                    onClear={() => {
                      setValue("customerId", "", { shouldValidate: true });
                      setValue("customerName", "");
                      setValue("address", "", { shouldValidate: true });
                    }}
                    onSearch={handleCustomerSearch}
                    useServerSearch
                    hasMore={hasNextCustomers}
                    onLoadMore={fetchNextCustomers}
                    isLoadingMore={isFetchingNextCustomers}
                  />

                  <div className="space-y-2">
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Alamat Pengiriman{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="address"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="address"
                            rows={3}
                            placeholder="Masukkan alamat pengiriman"
                            className={cn(
                              inputClassName,
                              errors.address && "border-red-500"
                            )}
                          />
                        )}
                      />
                      {errors.address ? (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.address.message}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">
                          Alamat lengkap pengiriman barang
                        </p>
                      )}
                    </div>

                    {watchCustomerId && customers.find(c => c.id === watchCustomerId)?.address && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="useCustomerAddress"
                          checked={useCustomerAddress}
                          onCheckedChange={handleUseCustomerAddressChange}
                        />
                        <label
                          htmlFor="useCustomerAddress"
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          Gunakan alamat pelanggan
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <div>
                      <label
                        htmlFor="deliverySchedule"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Jadwal Kirim
                      </label>
                      <Controller
                        name="deliverySchedule"
                        control={control}
                        render={({ field }) => (
                          <DateTimePicker
                            value={field.value}
                            onChange={field.onChange}
                            className={inputClassName}
                          />
                        )}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Masukkan jadwal pengiriman.
                        Jika tidak diisi, akan otomatis diset ke hari ini.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Tambah Barang DO
                </h3>

                <div className="grid grid-cols-12 gap-2 mb-4">
                  <div className="flex items-center col-span-12 sm:col-span-7">
                    <div className="w-full">
                      <div className="min-h-[40px]">
                        <Controller
                          name="tempProductId"
                          control={control}
                          defaultValue=""
                          render={({ field: { value, onChange } }) => (
                            <Combobox
                              items={productOptions}
                              value={value || ""}
                              onValueChange={onChange}
                              onSelect={handleProductSelect}
                              placeholder="Masukkan nama barang"
                              searchPlaceholder="Cari barang..."
                              isLoading={loadingProducts}
                              error={errors.items ? " " : ""}
                              name="tempProductId"
                              onClear={() => {
                                onChange("");
                                setValue("tempProduct", "");
                              }}
                              onSearch={handleProductSearch}
                              useServerSearch
                              hasMore={hasNextProducts}
                              onLoadMore={fetchNextProducts}
                              isLoadingMore={isFetchingNextProducts}
                              className="h-10"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center col-span-8 sm:col-span-3">
                    <div className="w-full">
                      <div className="min-h-[40px]">
                        <Controller
                          name="tempQuantity"
                          control={control}
                          render={({ field }) => (
                            <div>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Masukkan jumlah"
                                className={cn(
                                  (errors.tempQuantity || errors.items) &&
                                    "border-red-500",
                                  "h-10"
                                )}
                                value={tempQuantityDisplay}
                                onChange={(e) => {
                                  const result = handleDecimalInput(e.target.value);
                                  setTempQuantityDisplay(result.displayValue);
                                  field.onChange(result.numericValue);
                                }}
                              />
                              {errors.tempQuantity && (
                                <p className="mt-1 text-sm text-red-500">
                                  {errors.tempQuantity.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center col-span-4 pt-1 sm:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleProductAction}
                      className="w-10 h-10 text-blue-600 bg-white border border-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {errors.items && (
                  <div className="mt-0 mb-4">
                    <p className="text-sm font-medium text-red-500">
                      {errors.items.message}
                    </p>
                  </div>
                )}

                {showItems && (
                  <div className="mt-4 overflow-hidden border border-gray-200 rounded-md">
                    <div className="overflow-auto overflow-x-auto ">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                            >
                              Nama
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                            >
                              Kuantitas
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase"
                            >
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {watchItems
                            .filter((item) => item.productId)
                            .map((item: ExtendedProduct, index) => (
                              <tr
                                key={index}
                                className={
                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                }
                              >
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                                  <Link
                                    to={`/barang/${item.productId}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {item.productName}
                                    {item.productSatuan
                                      ? ` (${item.productSatuan})`
                                      : ""}
                                  </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {formatInputNumber(item.quantity)}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditItem(index)}
                                      className="flex items-center justify-center w-8 h-8 p-1 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-4 h-4"
                                      >
                                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                                      </svg>
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => remove(index)}
                                      className="flex items-center justify-center w-8 h-8 p-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-4 h-4"
                                      >
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line
                                          x1="10"
                                          y1="11"
                                          x2="10"
                                          y2="17"
                                        ></line>
                                        <line
                                          x1="14"
                                          y1="11"
                                          x2="14"
                                          y2="17"
                                        ></line>
                                      </svg>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {!showItems && (
                  <div
                    className={cn(
                      "p-6 text-center border border-dashed rounded-lg",
                      errors.items
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    )}
                  >
                    <p className="text-gray-500">
                      Belum ada barang yang ditambahkan. Masukkan barang dan
                      jumlah, lalu klik tombol + untuk menambahkan barang.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <div>
                  <label
                    htmlFor="internalNote"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Catatan Internal
                  </label>
                  <Controller
                    name="internalNote"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="internalNote"
                        rows={3}
                        placeholder="Tambahkan catatan internal jika diperlukan"
                        className={inputClassName}
                      />
                    )}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Catatan tambahan untuk internal (opsional)
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Link to="/do">
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
                disabled={createDeliveryOrder.isPending}
              >
                {createDeliveryOrder.isPending ? (
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

      {/* Warning Modal for Pending Product */}
      {showWarningModal && (
        <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
          <DialogContent className="bg-white ">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
                Produk Belum Ditambahkan
              </DialogTitle>
              <DialogDescription>
                Anda telah memilih produk{" "}
                <strong>{pendingProduct?.name}</strong> dengan jumlah{" "}
                <strong>{pendingProduct?.quantity}</strong> tetapi belum
                menekan tombol + untuk menambahkannya.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleProceedWithoutAdding}>
                Lanjutkan Tanpa Menambahkan
              </Button>
              <Button onClick={handleAddPendingProduct}>
                Tambah dan Lanjutkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
