import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader2, Plus, Save, Trash } from "lucide-react";

import { useCreateShipment } from "@/hooks/pengiriman";
import { useDeliveryOrders, useDeliveryOrder } from "@/hooks/do";
import { useArmadas } from "@/hooks/armada";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOCATION_TYPE } from "@/utils/constants";
import { showSuccessAlert, showErrorAlert } from "@/utils/sweetAlert";
import { CreateShipmentInput, Shipment } from "@/types/pengiriman";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combobox } from "@/components/ui/combobox";
import { formatNumber } from "@/utils/formatNumber";
import { cn } from "@/lib/utils";

// Validasi plat nomor Indonesia
const plateNumberRegex = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/;

// Schema untuk validasi
const deliveryOrderItemSchema = Joi.object({
  deliveryOrderId: Joi.string().required().messages({
    "string.empty": "ID DO harus diisi",
    "any.required": "ID DO harus diisi",
  }),
  locationType: Joi.string().required().messages({
    "string.empty": "Tipe lokasi harus dipilih",
    "any.required": "Tipe lokasi harus dipilih",
  }),
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        requestedQuantity: Joi.number().integer().min(0).required(),
      })
    )
    .required(),
});

const formSchema = Joi.object({
  type: Joi.string().valid("ANTAR", "JEMPUT").required().messages({
    "any.only": "Tipe harus ANTAR atau JEMPUT",
    "any.required": "Tipe pengiriman harus diisi",
  }),
  plateNumber: Joi.when("type", {
    is: "JEMPUT",
    then: Joi.string().pattern(plateNumberRegex).required().messages({
      "string.empty": "Plat nomor harus diisi",
      "string.pattern.base":
        "Format plat nomor tidak valid (contoh: B 1234 ABC)",
      "any.required": "Plat nomor harus diisi",
    }),
    otherwise: Joi.string().allow("").optional(),
  }),
  armadaId: Joi.when("type", {
    is: "ANTAR",
    then: Joi.string().required().messages({
      "string.empty": "Armada harus dipilih",
      "any.required": "Armada harus dipilih",
    }),
    otherwise: Joi.string().allow("").optional(),
  }),
  internalNote: Joi.string().allow("").optional(),
  deliveryOrders: Joi.array()
    .items(deliveryOrderItemSchema)
    .min(1)
    .required()
    .messages({
      "array.min": "Minimal harus ada 1 Delivery Order",
      "any.required": "Delivery Order harus diisi",
    }),
});

interface FormValues {
  type: "ANTAR" | "JEMPUT";
  plateNumber?: string;
  armadaId?: string;
  internalNote?: string;
  deliveryOrders: {
    deliveryOrderId: string;
    locationType: string;
    products: {
      productId: string;
      requestedQuantity: number;
    }[];
  }[];
}

interface DOProduct {
  id: string;
  name: string;
  satuan: string;
  quantity: number;
}

export default function TambahPengiriman() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryOrderSearchQuery, setDeliveryOrderSearchQuery] = useState("");
  const [armadaSearchQuery, setArmadaSearchQuery] = useState("");
  const [selectedDOProducts, setSelectedDOProducts] = useState<
    Record<string, DOProduct[]>
  >({});
  const [activeDOId, setActiveDOId] = useState<string>("");

  // Fetch data armada dan delivery orders
  const {
    data: armadasData,
    isLoading: loadingArmadas,
    refetch: refetchArmadas,
  } = useArmadas({
    staleTime: 300000,
    refetchOnWindowFocus: false,
    searchQuery: armadaSearchQuery,
  });

  const {
    data: deliveryOrdersData,
    isLoading: loadingDeliveryOrders,
    refetch: refetchDeliveryOrders,
  } = useDeliveryOrders({
    staleTime: 300000,
    refetchOnWindowFocus: false,
    searchQuery: deliveryOrderSearchQuery,
  });

  // Hook untuk mendapatkan detail DO yang sedang aktif dipilih
  const {
    data: activeDOData,
    isLoading: loadingActiveDO,
    error: activeDOError,
  } = useDeliveryOrder(
    { id: activeDOId },
    {
      enabled: !!activeDOId,
      refetchOnWindowFocus: false,
      staleTime: 300000,
    }
  );

  // Convert data dari API ke format ComboboxItem
  const armadas =
    armadasData?.armadas?.map((armada) => ({
      label: `${armada.model} - ${armada.plateNumber}`,
      value: armada.id,
      secondary: armada.description,
    })) || [];

  const deliveryOrders =
    deliveryOrdersData?.deliveryOrders?.map((do_item) => ({
      label: `${do_item.id} - ${do_item.customer.name}`,
      value: do_item.id,
      secondary: `${do_item.items.length} items`,
    })) || [];

  const createShipment = useCreateShipment({
    onSuccess: (data: Shipment) => {
      showSuccessAlert("Berhasil!", "Pengiriman berhasil dibuat").then(() => {
        navigate(`/pengiriman/${data.id}`);
      });
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      showErrorAlert(
        "Gagal Membuat Pengiriman",
        error.message || "Terjadi kesalahan saat membuat pengiriman"
      );
    },
  });

  const form = useForm<FormValues>({
    resolver: joiResolver(formSchema),
    defaultValues: {
      type: "ANTAR",
      plateNumber: "",
      armadaId: "",
      internalNote: "",
      deliveryOrders: [
        {
          deliveryOrderId: "",
          locationType: "",
          products: [],
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deliveryOrders",
  });

  const watchType = form.watch("type");
  const watchDeliveryOrders = form.watch("deliveryOrders");

  // Update products ketika data DO berhasil dimuat
  useEffect(() => {
    if (activeDOData?.items && activeDOId) {
      const doProducts = activeDOData.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        satuan: item.product.satuan,
        quantity: item.quantity,
      }));

      setSelectedDOProducts((prev) => ({
        ...prev,
        [activeDOId]: doProducts,
      }));

      // Temukan indeks DO yang sesuai dengan activeDOId
      const doIndex = watchDeliveryOrders.findIndex(
        (item) => item.deliveryOrderId === activeDOId
      );

      if (doIndex !== -1) {
        // Inisialisasi array produk dengan requestedQuantity 0
        const initialProducts = doProducts.map((product) => ({
          productId: product.id,
          requestedQuantity: 0,
        }));

        form.setValue(`deliveryOrders.${doIndex}.products`, initialProducts);
      }
    }
  }, [activeDOData, activeDOId, form, watchDeliveryOrders]);

  // Handle error saat memuat DO
  useEffect(() => {
    if (activeDOError && activeDOId) {
      showErrorAlert(
        "Error Memuat Produk",
        `Gagal memuat produk untuk DO ${activeDOId}: ${activeDOError.message}`
      );
    }
  }, [activeDOError, activeDOId]);

  // Refetch data saat komponen pertama kali dimuat
  useEffect(() => {
    refetchArmadas();
    refetchDeliveryOrders();
  }, [refetchArmadas, refetchDeliveryOrders]);

  const isDOLoading = useCallback(
    (doId: string) => loadingActiveDO && activeDOId === doId,
    [loadingActiveDO, activeDOId]
  );

  const loadDOProducts = useCallback(
    (doId: string) => {
      if (!doId || selectedDOProducts[doId]) return;
      setActiveDOId(doId);
    },
    [selectedDOProducts]
  );

  // Watch perubahan DO yang dipilih
  useEffect(() => {
    watchDeliveryOrders.forEach((item) => {
      if (item.deliveryOrderId && !selectedDOProducts[item.deliveryOrderId]) {
        loadDOProducts(item.deliveryOrderId);
      }
    });
  }, [watchDeliveryOrders, selectedDOProducts, loadDOProducts]);

  // Validasi kuantitas terhadap stok tersedia
  const validateQuantity = useCallback(
    (doIndex: number) => {
      const deliveryOrder = watchDeliveryOrders[doIndex];
      if (!deliveryOrder?.products || deliveryOrder.products.length === 0)
        return null;

      const doProducts =
        selectedDOProducts[deliveryOrder.deliveryOrderId] || [];
      const errors: string[] = [];

      deliveryOrder.products.forEach((product) => {
        if (!product.productId || product.requestedQuantity <= 0) return;

        const selectedProduct = doProducts.find(
          (p) => p.id === product.productId
        );
        if (
          selectedProduct &&
          product.requestedQuantity > selectedProduct.quantity
        ) {
          errors.push(
            `DO ${doIndex + 1}, Produk ${
              selectedProduct.name
            }: Jumlah yang diminta (${formatNumber(
              product.requestedQuantity
            )}) melebihi kuantitas tersedia (${formatNumber(
              selectedProduct.quantity
            )} ${selectedProduct.satuan})`
          );
        }
      });

      return errors.length > 0 ? errors.join("\n") : null;
    },
    [selectedDOProducts, watchDeliveryOrders]
  );

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);

    // Persiapkan payload
    const items: {
      deliveryOrderId: string;
      productId: string;
      requestedQuantity: number;
    }[] = [];

    // Gabungkan semua produk dari semua DO
    values.deliveryOrders.forEach((do_item) => {
      if (!do_item.deliveryOrderId) return;

      do_item.products.forEach((product) => {
        if (product.productId && product.requestedQuantity > 0) {
          items.push({
            deliveryOrderId: do_item.deliveryOrderId,
            productId: product.productId,
            requestedQuantity: product.requestedQuantity,
          });
        }
      });
    });

    if (items.length === 0) {
      setIsSubmitting(false);
      showErrorAlert(
        "Validasi Gagal",
        "Minimal harus ada 1 produk yang dipilih dengan jumlah yang valid"
      );
      return;
    }

    // Validasi kuantitas untuk setiap DO
    const validationErrors: string[] = [];
    values.deliveryOrders.forEach((_, index) => {
      const error = validateQuantity(index);
      if (error) validationErrors.push(error);
    });

    if (validationErrors.length > 0) {
      setIsSubmitting(false);
      showErrorAlert("Validasi Gagal", validationErrors.join("\n"));
      return;
    }

    // Persiapkan payload
    const payload: CreateShipmentInput = {
      type: values.type,
      plateNumber:
        values.type === "JEMPUT" && values.plateNumber
          ? values.plateNumber
          : "",
      items,
    };

    if (values.type === "ANTAR" && values.armadaId) {
      payload.armadaId = values.armadaId;
    }

    if (values.internalNote) {
      payload.internalNote = values.internalNote;
    }

    createShipment.mutate(payload);
  };

  const addNewDeliveryOrder = () => {
    append({
      deliveryOrderId: "",
      locationType: "",
      products: [],
    });
  };

  const handleDeliveryOrderSearch = useCallback(
    (query: string) => {
      setDeliveryOrderSearchQuery(query);
      refetchDeliveryOrders();
    },
    [refetchDeliveryOrders]
  );

  const handleArmadaSearch = useCallback(
    (query: string) => {
      setArmadaSearchQuery(query);
      refetchArmadas();
    },
    [refetchArmadas]
  );

  const handleDeliveryOrderChange = useCallback(
    (value: string, index: number) => {
      form.setValue(`deliveryOrders.${index}.deliveryOrderId`, value);
      form.clearErrors(`deliveryOrders.${index}.deliveryOrderId`);

      // Reset products array
      form.setValue(`deliveryOrders.${index}.products`, []);

      if (value) {
        loadDOProducts(value);
      }
    },
    [form, loadDOProducts]
  );

  const handleTypeChange = (value: "ANTAR" | "JEMPUT") => {
    form.resetField("plateNumber");
    form.resetField("armadaId");

    form.setValue("plateNumber", "");
    form.setValue("armadaId", "");

    form.clearErrors("plateNumber");
    form.clearErrors("armadaId");

    form.setValue("type", value);
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Pengiriman</h1>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Form Pengiriman Baru</CardTitle>
          <CardDescription>
            Isi informasi untuk pembuatan pengiriman
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* Informasi Dasar */}
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Informasi Dasar
                  </h3>
                  <div className="space-y-4">
                    {/* Tipe Pengiriman */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>
                            Tipe Pengiriman{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={handleTypeChange}
                              value={field.value}
                              className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ANTAR" id="antar" />
                                <label
                                  htmlFor="antar"
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  Antar
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="JEMPUT" id="jemput" />
                                <label
                                  htmlFor="jemput"
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  Jemput
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Field kondisional berdasarkan tipe */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {watchType === "JEMPUT" ? (
                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control}
                            name="plateNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Plat Nomor Kendaraan{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Contoh: B 1234 ABC"
                                    disabled={isSubmitting}
                                    className={cn(
                                      form.formState.errors.plateNumber &&
                                        "border-red-500"
                                    )}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control}
                            name="armadaId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Armada <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Combobox
                                    items={armadas}
                                    value={field.value || ""}
                                    onValueChange={(val) => {
                                      field.onChange(val);
                                    }}
                                    placeholder="Pilih armada"
                                    searchPlaceholder="Cari armada..."
                                    isLoading={loadingArmadas}
                                    name="armadaId"
                                    onClear={() => field.onChange("")}
                                    onSearch={handleArmadaSearch}
                                    useServerSearch
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Orders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Delivery Orders
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewDeliveryOrder}
                      disabled={isSubmitting}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah DO
                    </Button>
                  </div>

                  {form.formState.errors.deliveryOrders?.root && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-red-500">
                        {form.formState.errors.deliveryOrders.root.message}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative p-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        {/* Tombol hapus */}
                        {fields.length > 1 && (
                          <div className="flex justify-end mb-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="flex items-center justify-center w-8 h-8 p-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                              onClick={() => remove(index)}
                              disabled={isSubmitting}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {/* DO Selector */}
                          <FormField
                            control={form.control}
                            name={`deliveryOrders.${index}.deliveryOrderId`}
                            render={({ field }) => (
                              <FormItem className="h-[80px]">
                                <FormLabel>
                                  Delivery Order{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Combobox
                                    items={deliveryOrders}
                                    value={field.value}
                                    onValueChange={(value) =>
                                      handleDeliveryOrderChange(value, index)
                                    }
                                    placeholder="Pilih Delivery Order"
                                    searchPlaceholder="Cari DO..."
                                    isLoading={loadingDeliveryOrders}
                                    name={`deliveryOrders.${index}.deliveryOrderId`}
                                    onClear={() => {
                                      field.onChange("");
                                      form.setValue(
                                        `deliveryOrders.${index}.products`,
                                        []
                                      );
                                    }}
                                    onSearch={handleDeliveryOrderSearch}
                                    useServerSearch
                                  />
                                </FormControl>
                                <div className="min-h-[20px]">
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          {/* Lokasi */}
                          <FormField
                            control={form.control}
                            name={`deliveryOrders.${index}.locationType`}
                            render={({ field }) => (
                              <FormItem className="h-[80px]">
                                <FormLabel>
                                  Tipe Lokasi{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={isSubmitting}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih tipe lokasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.values(LOCATION_TYPE).map(
                                        (type) => (
                                          <SelectItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() +
                                              type.slice(1).toLowerCase()}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <div className="min-h-[20px]">
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Daftar Produk - ditampilkan jika DO dipilih */}
                        {watchDeliveryOrders[index]?.deliveryOrderId && (
                          <div className="mt-4 ">
                            <h4 className="mb-2 font-medium text-md">
                              Daftar Produk
                            </h4>

                            {isDOLoading(
                              watchDeliveryOrders[index].deliveryOrderId
                            ) && (
                              <p className="py-2 text-sm text-blue-500">
                                Memuat produk...
                              </p>
                            )}

                            {!isDOLoading(
                              watchDeliveryOrders[index].deliveryOrderId
                            ) &&
                              (!selectedDOProducts[
                                watchDeliveryOrders[index].deliveryOrderId
                              ] ||
                                selectedDOProducts[
                                  watchDeliveryOrders[index].deliveryOrderId
                                ].length === 0) && (
                                <p className="py-2 text-sm text-red-500">
                                  Tidak ada produk yang tersedia
                                </p>
                              )}

                            {!isDOLoading(
                              watchDeliveryOrders[index].deliveryOrderId
                            ) &&
                              selectedDOProducts[
                                watchDeliveryOrders[index].deliveryOrderId
                              ]?.length > 0 && (
                                <div className="p-3 space-y-3 border border-gray-200 rounded-md">
                                  {selectedDOProducts[
                                    watchDeliveryOrders[index].deliveryOrderId
                                  ].map((product, productIndex) => (
                                    <div
                                      key={product.id}
                                      className="grid grid-cols-1 gap-2 pb-2 border-b border-gray-200 bitems-center sm:grid-cols-7 last:border-0 last:pb-0"
                                    >
                                      <div className="sm:col-span-4">
                                        <p className="font-medium">
                                          {product.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          Stok tersedia:{" "}
                                          {formatNumber(product.quantity)}{" "}
                                          {product.satuan}
                                        </p>
                                      </div>
                                      <div className="sm:col-span-3">
                                        <FormField
                                          control={form.control}
                                          name={`deliveryOrders.${index}.products.${productIndex}.requestedQuantity`}
                                          render={({ field }) => (
                                            <FormItem className="h-[80px]">
                                              <FormControl>
                                                <Input
                                                  type="text"
                                                  placeholder="Masukkan jumlah"
                                                  value={
                                                    field.value > 0
                                                      ? formatNumber(
                                                          field.value
                                                        )
                                                      : ""
                                                  }
                                                  onChange={(e) => {
                                                    const numValue =
                                                      parseInt(
                                                        e.target.value.replace(
                                                          /\D/g,
                                                          ""
                                                        )
                                                      ) || 0;
                                                    field.onChange(numValue);

                                                    // Update hidden field for productId
                                                    form.setValue(
                                                      `deliveryOrders.${index}.products.${productIndex}.productId`,
                                                      product.id
                                                    );
                                                  }}
                                                  disabled={isSubmitting}
                                                  className={cn(
                                                    field.value >
                                                      product.quantity &&
                                                      "border-orange-500"
                                                  )}
                                                />
                                              </FormControl>
                                              <div className="min-h-[20px]">
                                                {field.value >
                                                  product.quantity && (
                                                  <p className="text-xs text-orange-500">
                                                    Nilai melebihi stok tersedia
                                                  </p>
                                                )}
                                              </div>
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={form.control}
                                          name={`deliveryOrders.${index}.products.${productIndex}.productId`}
                                          render={({ field }) => (
                                            <input
                                              type="hidden"
                                              {...field}
                                              value={product.id}
                                            />
                                          )}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Catatan Internal */}
                <FormField
                  control={form.control}
                  name="internalNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan Internal</FormLabel>
                      <p className="mb-2 text-sm text-gray-500">
                        Catatan tambahan untuk internal (opsional)
                      </p>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Tambahkan catatan internal (opsional)"
                          disabled={isSubmitting}
                          rows={4}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 sm:flex-row sm:justify-end">
                <Link to="/pengiriman" className="w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="w-full text-gray-700 sm:w-auto"
                  >
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white bg-blue-600 hover:bg-blue-700 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Pengiriman
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
