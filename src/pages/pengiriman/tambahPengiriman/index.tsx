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
  productId: Joi.string().required().messages({
    "string.empty": "Produk harus dipilih",
    "any.required": "Produk harus dipilih",
  }),
  requestedQuantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Harus berupa angka",
    "number.integer": "Harus bilangan bulat",
    "number.min": "Minimal 1",
    "any.required": "Jumlah harus diisi",
  }),
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
    productId: string;
    requestedQuantity: number | undefined;
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
    }
  }, [activeDOData, activeDOId]);

  // Handle error saat memuat DO
  useEffect(() => {
    if (activeDOError && activeDOId) {
      showErrorAlert(
        "Error Memuat Produk",
        `Gagal memuat produk untuk DO ${activeDOId}: ${activeDOError.message}`
      );
    }
  }, [activeDOError, activeDOId]);

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
          productId: "",
          requestedQuantity: undefined,
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

  // Validasi realtime untuk kuantitas produk
  useEffect(() => {
    watchDeliveryOrders.forEach((item, index) => {
      if (item.deliveryOrderId && item.productId && item.requestedQuantity) {
        const doProducts = selectedDOProducts[item.deliveryOrderId];
        const selectedProduct = doProducts?.find(
          (p) => p.id === item.productId
        );

        if (
          selectedProduct &&
          item.requestedQuantity > selectedProduct.quantity
        ) {
          form.setError(`deliveryOrders.${index}.requestedQuantity`, {
            type: "manual",
            message: `Jumlah melebihi stok tersedia (${formatNumber(
              selectedProduct.quantity
            )} ${selectedProduct.satuan})`,
          });
        } else if (
          form.formState.errors.deliveryOrders?.[index]?.requestedQuantity
            ?.type === "manual"
        ) {
          form.clearErrors(`deliveryOrders.${index}.requestedQuantity`);
        }
      }
    });
  }, [watchDeliveryOrders, selectedDOProducts, form]);

  // Validasi kuantitas terhadap stok tersedia
  const validateQuantity = useCallback(
    (item: FormValues["deliveryOrders"][0], index: number) => {
      const doProducts = selectedDOProducts[item.deliveryOrderId];
      const selectedProduct = doProducts?.find((p) => p.id === item.productId);

      if (
        selectedProduct &&
        item.requestedQuantity! > selectedProduct.quantity
      ) {
        return `DO ${index + 1}: Jumlah yang diminta (${formatNumber(
          item.requestedQuantity!
        )}) melebihi kuantitas tersedia (${formatNumber(
          selectedProduct.quantity
        )} ${selectedProduct.satuan})`;
      }
      return null;
    },
    [selectedDOProducts]
  );

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);

    // Filter DO yang valid
    const validDeliveryOrders = values.deliveryOrders.filter(
      (item) =>
        item.deliveryOrderId &&
        item.productId &&
        item.requestedQuantity &&
        item.requestedQuantity > 0
    );

    if (validDeliveryOrders.length === 0) {
      setIsSubmitting(false);
      showErrorAlert(
        "Validasi Gagal",
        "Minimal harus ada 1 Delivery Order yang lengkap dengan jumlah yang valid"
      );
      return;
    }

    // Validasi kuantitas
    const validationErrors = validDeliveryOrders
      .map((item, index) => validateQuantity(item, index))
      .filter(Boolean);

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
      items: validDeliveryOrders.map((item) => ({
        deliveryOrderId: item.deliveryOrderId,
        productId: item.productId,
        requestedQuantity: item.requestedQuantity!,
      })),
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
      productId: "",
      requestedQuantity: undefined,
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
      form.setValue(`deliveryOrders.${index}.productId`, "");
      form.clearErrors(`deliveryOrders.${index}.deliveryOrderId`);
      if (value) loadDOProducts(value);
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

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {/* DO Selector */}
                          <FormField
                            control={form.control}
                            name={`deliveryOrders.${index}.deliveryOrderId`}
                            render={({ field }) => (
                              <FormItem className="h-[90px] flex flex-col">
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
                                        `deliveryOrders.${index}.productId`,
                                        ""
                                      );
                                    }}
                                    onSearch={handleDeliveryOrderSearch}
                                    useServerSearch
                                  />
                                </FormControl>
                                <div className="min-h-[18px] text-xs">
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
                              <FormItem className="h-[90px] flex flex-col">
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
                                <div className="min-h-[18px] text-xs">
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />

                          {/* Produk dan Jumlah - hanya tampil jika DO dipilih */}
                          {watchDeliveryOrders[index]?.deliveryOrderId && (
                            <>
                              <FormField
                                control={form.control}
                                name={`deliveryOrders.${index}.productId`}
                                render={({ field }) => (
                                  <FormItem className="h-[90px] flex flex-col">
                                    <FormLabel>
                                      Produk{" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <div>
                                      {isDOLoading(
                                        watchDeliveryOrders[index]
                                          .deliveryOrderId
                                      ) && (
                                        <p className="text-sm text-blue-500">
                                          Memuat produk...
                                        </p>
                                      )}
                                      {!isDOLoading(
                                        watchDeliveryOrders[index]
                                          .deliveryOrderId
                                      ) &&
                                        (!selectedDOProducts[
                                          watchDeliveryOrders[index]
                                            .deliveryOrderId
                                        ] ||
                                          selectedDOProducts[
                                            watchDeliveryOrders[index]
                                              .deliveryOrderId
                                          ].length === 0) && (
                                          <p className="text-sm text-red-500">
                                            Tidak ada produk yang tersedia
                                          </p>
                                        )}
                                      <FormControl>
                                        <Select
                                          onValueChange={(value) => {
                                            field.onChange(value);
                                            form.clearErrors(
                                              `deliveryOrders.${index}.productId`
                                            );
                                          }}
                                          value={field.value}
                                          disabled={
                                            isDOLoading(
                                              watchDeliveryOrders[index]
                                                .deliveryOrderId
                                            ) ||
                                            !selectedDOProducts[
                                              watchDeliveryOrders[index]
                                                .deliveryOrderId
                                            ]
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue
                                              placeholder={
                                                isDOLoading(
                                                  watchDeliveryOrders[index]
                                                    .deliveryOrderId
                                                )
                                                  ? "Memuat produk..."
                                                  : "Pilih produk"
                                              }
                                            />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {selectedDOProducts[
                                              watchDeliveryOrders[index]
                                                .deliveryOrderId
                                            ]?.map((product) => (
                                              <SelectItem
                                                key={product.id}
                                                value={product.id}
                                              >
                                                {product.name} -{" "}
                                                {formatNumber(product.quantity)}{" "}
                                                {product.satuan}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </FormControl>
                                    </div>
                                    <div className="min-h-[18px] text-xs">
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`deliveryOrders.${index}.requestedQuantity`}
                                render={({ field }) => {
                                  const selectedProduct = selectedDOProducts[
                                    watchDeliveryOrders[index]?.deliveryOrderId
                                  ]?.find(
                                    (p) =>
                                      p.id ===
                                      watchDeliveryOrders[index]?.productId
                                  );

                                  return (
                                    <FormItem className="h-[90px] flex flex-col">
                                      <FormLabel>
                                        Jumlah{" "}
                                        <span className="text-red-500">*</span>
                                      </FormLabel>
                                      <div>
                                        <FormControl>
                                          <Input
                                            type="text"
                                            placeholder="Masukkan jumlah"
                                            value={
                                              field.value && field.value > 0
                                                ? formatNumber(field.value)
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

                                              // Hanya set nilai jika lebih dari 0, jika tidak set undefined
                                              if (numValue > 0) {
                                                field.onChange(numValue);
                                                form.clearErrors(
                                                  `deliveryOrders.${index}.requestedQuantity`
                                                );
                                              } else {
                                                field.onChange(undefined);
                                              }
                                            }}
                                            min={1}
                                            disabled={isSubmitting}
                                            className={cn(
                                              form.formState.errors
                                                .deliveryOrders?.[index]
                                                ?.requestedQuantity &&
                                                "border-red-500",
                                              selectedProduct &&
                                                field.value &&
                                                field.value >
                                                  selectedProduct.quantity &&
                                                "border-orange-500"
                                            )}
                                          />
                                        </FormControl>
                                        {selectedProduct &&
                                          field.value &&
                                          field.value >
                                            selectedProduct.quantity && (
                                            <p className="mt-1 text-xs text-orange-500">
                                              Nilai melebihi stok tersedia (
                                              {formatNumber(
                                                selectedProduct.quantity
                                              )}{" "}
                                              {selectedProduct.satuan})
                                            </p>
                                          )}
                                      </div>
                                      <div className="min-h-[18px] text-xs">
                                        <FormMessage />
                                      </div>
                                    </FormItem>
                                  );
                                }}
                              />
                            </>
                          )}
                        </div>
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
