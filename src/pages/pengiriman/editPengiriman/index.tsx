import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { ArrowLeft, Loader2, Plus, Save, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";

import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useArmadas } from "@/hooks/armada";
import {
  deliveryOrderKeys,
  useDeliveryOrder,
  useDeliveryOrders,
} from "@/hooks/do";
import {
  shipmentKeys,
  useShipment,
  useUpdateShipment,
} from "@/hooks/pengiriman";
import { cn } from "@/lib/utils";
import { UpdateShipmentInput } from "@/types/pengiriman";
import { LOCATION_TYPE } from "@/utils/constants";
import { formatNumber } from "@/utils/formatNumber";
import { showErrorAlert, showSuccessAlert } from "@/utils/sweetAlert";
import { useQueryClient } from "@tanstack/react-query";

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
        shipmentItemId: Joi.string().allow("", null).optional(),
      })
    )
    .required(),
  isChosen: Joi.boolean().optional(),
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
      shipmentItemId?: string;
    }[];
    isChosen?: boolean;
  }[];
}

interface DOProduct {
  id: string;
  name: string;
  satuan: string;
  quantity: number;
  pendingQuantity: number;
}

export default function EditPengiriman() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryOrderSearchQuery, setDeliveryOrderSearchQuery] = useState("");
  const [armadaSearchQuery, setArmadaSearchQuery] = useState("");
  const [selectedDOProducts, setSelectedDOProducts] = useState<
    Record<string, DOProduct[]>
  >({});
  const [activeDOId, setActiveDOId] = useState<string>("");
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>(
    {}
  );

  const {
    data: shipment,
    isLoading,
    isError,
    error,
    refetch,
  } = useShipment(
    { id: id || "" },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

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
    availableOnly: true,
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

  // Convert DO data ke format ComboboxItem (filtering sudah dilakukan di backend)
  const deliveryOrders =
    deliveryOrdersData?.deliveryOrders?.map((do_item) => ({
      label: `${do_item.doNumber} - ${do_item.customer.name}`,
      value: do_item.id,
      secondary: `${do_item.address} - ${
        do_item.items.filter((item) => item.pendingQuantity > 0).length
      } barang tersedia`,
    })) || [];

  const updateShipment = useUpdateShipment({
    onSuccess: () => {
      // Invalidate shipment queries
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(id || ""),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.archived(),
      });
      // Invalidate all related DOs so their quantities are up-to-date
      form.getValues().deliveryOrders.forEach((doItem) => {
        if (doItem.deliveryOrderId) {
          queryClient.invalidateQueries({
            queryKey: deliveryOrderKeys.detail(doItem.deliveryOrderId),
          });
        }
      });
      showSuccessAlert("Berhasil!", "Pengiriman berhasil diperbarui").then(
        () => {
          navigate(`/pengiriman/${id}`);
        }
      );
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      showErrorAlert(
        "Gagal Memperbarui Pengiriman",
        error.message || "Terjadi kesalahan saat memperbarui pengiriman"
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
      deliveryOrders: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deliveryOrders",
  });

  const watchType = form.watch("type");
  const watchDeliveryOrders = form.watch("deliveryOrders");

  // Inisialisasi form dengan data shipment yang ada
  useEffect(() => {
    if (shipment) {
      // Group shipment items by delivery order
      const doMap = new Map();

      shipment.shipmentItems.forEach((item) => {
        const doId = item.deliveryOrderId;
        if (!doMap.has(doId)) {
          doMap.set(doId, {
            deliveryOrderId: doId,
            locationType: item.locationType,
            products: [],
            isChosen: item.chosenProduct || false,
          });
        }

        const doData = doMap.get(doId);
        doData.products.push({
          productId: item.productId,
          requestedQuantity: item.requestedQuantity,
          shipmentItemId: item.id,
        });

        // Update isChosen if any product is chosen
        if (item.chosenProduct) {
          doData.isChosen = true;
        }
      });

      const deliveryOrdersArray = Array.from(doMap.values());

      form.reset({
        type: shipment.type,
        plateNumber: shipment.plateNumber || "",
        armadaId: shipment.armadaId || "",
        internalNote: shipment.internalNote || "",
        deliveryOrders: deliveryOrdersArray,
      });

      // Set accordion states - open all by default
      const accordionStates: Record<string, boolean> = {};
      deliveryOrdersArray.forEach((_, index) => {
        accordionStates[`do-${index}`] = true;
      });
      setOpenAccordions(accordionStates);

      // Load products for each DO
      deliveryOrdersArray.forEach((doItem) => {
        if (doItem.deliveryOrderId) {
          setActiveDOId(doItem.deliveryOrderId);
        }
      });
    }
  }, [shipment, form]);

  // Refetch data saat komponen pertama kali dimuat
  useEffect(() => {
    refetchArmadas();
    refetchDeliveryOrders();
  }, [refetchArmadas, refetchDeliveryOrders]);

  // Update products ketika data DO berhasil dimuat
  useEffect(() => {
    if (activeDOData?.items && activeDOId) {
      const doProducts = activeDOData.items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        satuan: item.product.satuan,
        quantity: item.quantity,
        pendingQuantity: item.pendingQuantity,
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
        // Untuk edit, tampilkan semua produk (termasuk yang pendingQuantity = 0)
        // karena mungkin ada shipment item yang sudah ada sebelumnya
        const availableProducts = doProducts;

        // Jika tidak ada barang sama sekali, set products kosong
        if (availableProducts.length === 0) {
          form.setValue(`deliveryOrders.${doIndex}.products`, []);
          return;
        }

        // Cek apakah sudah ada products yang tersimpan untuk DO ini
        const existingProducts = watchDeliveryOrders[doIndex]?.products || [];

        if (existingProducts.length === 0) {
          // Inisialisasi array barang dengan requestedQuantity 0 untuk semua barang
          const initialProducts = availableProducts.map((product) => ({
            productId: product.id,
            requestedQuantity: 0,
            shipmentItemId: "", // Kosong untuk item baru
          }));

          form.setValue(`deliveryOrders.${doIndex}.products`, initialProducts);
        } else {
          // Pastikan semua produk yang tersedia ada dalam form
          const updatedProducts = availableProducts.map((product) => {
            const existingProduct = existingProducts.find(
              (ep) => ep.productId === product.id
            );
            return {
              productId: product.id,
              requestedQuantity: existingProduct?.requestedQuantity || 0,
              shipmentItemId: existingProduct?.shipmentItemId || "", // Kosong jika tidak ada
            };
          });

          form.setValue(`deliveryOrders.${doIndex}.products`, updatedProducts);
        }
      }
    }
  }, [activeDOData, activeDOId, form, watchDeliveryOrders]);

  // Handle error saat memuat DO
  useEffect(() => {
    if (activeDOError && activeDOId) {
      showErrorAlert(
        "Error Memuat Barang",
        `Gagal memuat Barang untuk DO ${activeDOId}: ${activeDOError.message}`
      );
    }
  }, [activeDOError, activeDOId]);

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
      // Cek apakah DO sudah dipilih di field lain
      const isDuplicate = watchDeliveryOrders.some(
        (item, idx) => idx !== index && item.deliveryOrderId === value
      );

      if (isDuplicate) {
        showErrorAlert(
          "Validasi DO Gagal",
          "DO ini sudah ditambahkan. Setiap DO hanya dapat ditambahkan sekali."
        );
        return;
      }

      // Ambil DO lama untuk membersihkan state
      const oldDeliveryOrderId = watchDeliveryOrders[index]?.deliveryOrderId;

      form.setValue(`deliveryOrders.${index}.deliveryOrderId`, value);
      form.clearErrors(`deliveryOrders.${index}.deliveryOrderId`);

      // Reset products array
      form.setValue(`deliveryOrders.${index}.products`, []);

      // Reset locationType juga
      form.setValue(`deliveryOrders.${index}.locationType`, "");
      form.clearErrors(`deliveryOrders.${index}.locationType`);

      // Bersihkan state DO lama dari selectedDOProducts
      if (oldDeliveryOrderId) {
        setSelectedDOProducts((prev) => {
          const newState = { ...prev };
          delete newState[oldDeliveryOrderId];
          return newState;
        });
      }

      // Jika memilih DO baru, pastikan state bersih untuk DO tersebut
      if (value) {
        // Hapus state lama jika ada untuk DO yang dipilih
        setSelectedDOProducts((prev) => {
          const newState = { ...prev };
          delete newState[value];
          return newState;
        });

        // Load data DO yang baru
        loadDOProducts(value);
      }
    },
    [form, loadDOProducts, watchDeliveryOrders]
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

  const addNewDeliveryOrder = () => {
    // Validasi untuk memastikan DO yang sudah ada sudah diisi
    const emptyDOIndex = watchDeliveryOrders.findIndex(
      (item) => !item.deliveryOrderId
    );

    if (emptyDOIndex !== -1) {
      showErrorAlert(
        "Validasi DO Gagal",
        "Harap isi DO yang kosong terlebih dahulu sebelum menambahkan DO baru."
      );
      return;
    }

    append({
      deliveryOrderId: "",
      locationType: "",
      products: [],
      isChosen: false,
    });

    // Membuka accordion untuk DO baru
    setOpenAccordions((prev) => ({
      ...prev,
      [`do-${fields.length}`]: true,
    }));
  };

  const removeDO = (index: number) => {
    const doItem = watchDeliveryOrders[index];

    // Cek apakah DO sudah chosen
    if (doItem.isChosen) {
      showErrorAlert(
        "Tidak Dapat Menghapus",
        "DO ini tidak dapat dihapus karena barangnya sudah dimuat/dipilih."
      );
      return;
    }

    // Bersihkan state untuk DO yang dihapus
    if (doItem?.deliveryOrderId) {
      setSelectedDOProducts((prev) => {
        const newState = { ...prev };
        delete newState[doItem.deliveryOrderId];
        return newState;
      });
    }

    // Bersihkan error untuk field yang akan dihapus
    form.clearErrors(`deliveryOrders.${index}.deliveryOrderId`);
    form.clearErrors(`deliveryOrders.${index}.locationType`);
    form.clearErrors(`deliveryOrders.${index}.products`);

    // Hapus dari form
    remove(index);

    // Update accordion states
    const newAccordionStates: Record<string, boolean> = {};
    Object.keys(openAccordions).forEach((key) => {
      const keyIndex = parseInt(key.split("-")[1]);
      if (keyIndex < index) {
        newAccordionStates[key] = openAccordions[key];
      } else if (keyIndex > index) {
        newAccordionStates[`do-${keyIndex - 1}`] = openAccordions[key];
      }
    });
    setOpenAccordions(newAccordionStates);
  };

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);

    // Validasi DO duplikat
    const deliveryOrderIds = values.deliveryOrders.map(
      (do_item) => do_item.deliveryOrderId
    );
    const uniqueDeliveryOrderIds = new Set(deliveryOrderIds);

    if (deliveryOrderIds.length !== uniqueDeliveryOrderIds.size) {
      setIsSubmitting(false);
      showErrorAlert(
        "Validasi Gagal",
        "Terdapat Delivery Order duplikat. Setiap DO hanya dapat ditambahkan sekali."
      );
      return;
    }

    // Persiapkan payload
    const items: {
      deliveryOrderId: string;
      productId: string;
      requestedQuantity: number;
      locationType: string;
      shipmentItemId?: string;
    }[] = [];

    // Gabungkan semua Barang dari semua DO
    values.deliveryOrders.forEach((do_item) => {
      if (!do_item.deliveryOrderId) return;
      do_item.products.forEach((product) => {
        // Hanya kirim barang yang memiliki requestedQuantity > 0
        if (product.productId && product.requestedQuantity > 0) {
          const item = {
            deliveryOrderId: do_item.deliveryOrderId,
            productId: product.productId,
            requestedQuantity: product.requestedQuantity,
            locationType: do_item.locationType,
            // Hanya kirim shipmentItemId jika ada dan tidak kosong
            ...(product.shipmentItemId && product.shipmentItemId.trim() !== ""
              ? { shipmentItemId: product.shipmentItemId }
              : {}),
          };
          items.push(item);
        }
      });
    });

    if (items.length === 0) {
      setIsSubmitting(false);
      showErrorAlert(
        "Validasi Gagal",
        "Minimal harus ada 1 Barang yang dipilih dengan jumlah yang valid"
      );
      return;
    }

    // Persiapkan payload
    const payload: UpdateShipmentInput = {
      type: values.type,
      internalNote: values.internalNote || "",
      items,
    };

    if (values.type === "ANTAR" && values.armadaId) {
      payload.armadaId = values.armadaId;
      payload.plateNumber = "";
    } else if (values.type === "JEMPUT" && values.plateNumber) {
      payload.plateNumber = values.plateNumber;
      payload.armadaId = "";
    }

    updateShipment.mutate({
      id: id || "",
      ...payload,
    });
  };

  if (isLoading) {
    return <LoadingState text="Memuat data pengiriman..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Data Pengiriman"
        message={
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat data pengiriman"
        }
        onRetry={refetch}
        retryButtonText="Coba lagi"
      />
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 rounded-lg bg-red-50">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-700">
            Pengiriman tidak ditemukan
          </h2>
          <p className="mb-4 text-red-600">
            Data pengiriman dengan ID yang diberikan tidak ditemukan atau telah
            dihapus.
          </p>
          <Link to="/pengiriman">
            <Button>Kembali ke Daftar Pengiriman</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/pengiriman/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Pengiriman</h1>
      </div>
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Pengiriman</CardTitle>
          <CardDescription>
            Perbarui detail pengiriman dengan ID:{" "}
            <code className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded text-sm">
              {id}
            </code>
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
                                    onChange={(e) => {
                                      field.onChange(
                                        e.target.value.toUpperCase()
                                      );
                                    }}
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
                    <Accordion
                      type="multiple"
                      className="w-full"
                      value={Object.keys(openAccordions).filter(
                        (key) => openAccordions[key]
                      )}
                      onValueChange={(value: string[]) => {
                        const newOpenState = value.reduce(
                          (acc: Record<string, boolean>, val: string) => {
                            acc[val] = true;
                            return acc;
                          },
                          {}
                        );
                        setOpenAccordions(newOpenState);
                      }}
                    >
                      {fields.map((field, index) => {
                        const doItem = watchDeliveryOrders[index];
                        const isChosen = doItem?.isChosen || false;

                        return (
                          <AccordionItem
                            key={field.id}
                            value={`do-${index}`}
                            className={cn(
                              "mb-4 overflow-hidden border rounded-lg",
                              isChosen
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200 bg-gray-50"
                            )}
                          >
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">
                                  #Delivery Order {index + 1}
                                </h4>
                                {isChosen && (
                                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                    Sudah Dimuat
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {fields.length > 1 && !isChosen && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center justify-center w-8 h-8 p-1 text-white bg-red-500 rounded-md hover:bg-red-600"
                                    onClick={() => removeDO(index)}
                                    disabled={isSubmitting}
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                )}
                                <AccordionTrigger className="px-0 hover:no-underline" />
                              </div>
                            </div>
                            <AccordionContent className="px-4 pb-4">
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
                                        <div
                                          className={cn(
                                            isChosen &&
                                              "opacity-50 pointer-events-none"
                                          )}
                                        >
                                          <Combobox
                                            items={deliveryOrders}
                                            value={field.value}
                                            onValueChange={(value) =>
                                              handleDeliveryOrderChange(
                                                value,
                                                index
                                              )
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
                                        </div>
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
                                          value={field.value}
                                          disabled={isSubmitting || isChosen}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe lokasi" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Object.values(LOCATION_TYPE).map(
                                              (type) => (
                                                <SelectItem
                                                  key={type}
                                                  value={type}
                                                >
                                                  {type
                                                    .charAt(0)
                                                    .toUpperCase() +
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

                              {/* Daftar barang - ditampilkan jika DO dipilih */}
                              {watchDeliveryOrders[index]?.deliveryOrderId && (
                                <div className="mt-4">
                                  <h4 className="mb-2 font-medium text-md">
                                    Daftar Barang
                                  </h4>

                                  {isDOLoading(
                                    watchDeliveryOrders[index].deliveryOrderId
                                  ) && (
                                    <p className="py-2 text-sm text-blue-500">
                                      Memuat barang...
                                    </p>
                                  )}

                                  {!isDOLoading(
                                    watchDeliveryOrders[index].deliveryOrderId
                                  ) &&
                                    (!selectedDOProducts[
                                      watchDeliveryOrders[index].deliveryOrderId
                                    ] ||
                                      selectedDOProducts[
                                        watchDeliveryOrders[index]
                                          .deliveryOrderId
                                      ].length === 0) && (
                                      <p className="py-2 text-sm text-red-500">
                                        Tidak ada barang yang tersedia
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
                                          watchDeliveryOrders[index]
                                            .deliveryOrderId
                                        ].map((product) => {
                                          // Cari index produk yang tepat berdasarkan productId di form
                                          const formProducts =
                                            watchDeliveryOrders[index]
                                              ?.products || [];
                                          const productFormIndex =
                                            formProducts.findIndex(
                                              (fp) =>
                                                fp.productId === product.id
                                            );

                                          return (
                                            <div
                                              key={product.id}
                                              className="grid items-center grid-cols-1 gap-2 pb-2 border-b border-gray-200 sm:grid-cols-7 last:border-0 last:pb-0"
                                            >
                                              <div className="sm:col-span-4">
                                                <p className="font-medium">
                                                  {product.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                  Stok tersedia:{" "}
                                                  {(() => {
                                                    const shipmentItem =
                                                      shipment?.shipmentItems.find(
                                                        (si) =>
                                                          si.deliveryOrderId ===
                                                            watchDeliveryOrders[
                                                              index
                                                            ]
                                                              ?.deliveryOrderId &&
                                                          si.productId ===
                                                            product.id
                                                      );

                                                    const originalDOQuantity =
                                                      shipmentItem?.originalDOQuantity ??
                                                      product.quantity;

                                                    const totalOtherRequested =
                                                      shipment?.shipmentItems
                                                        .filter(
                                                          (si) =>
                                                            si.deliveryOrderId ===
                                                              watchDeliveryOrders[
                                                                index
                                                              ]
                                                                ?.deliveryOrderId &&
                                                            si.productId ===
                                                              product.id &&
                                                            si.id !==
                                                              (formProducts[
                                                                productFormIndex
                                                              ]
                                                                ?.shipmentItemId ||
                                                                "")
                                                        )
                                                        .reduce(
                                                          (sum, si) =>
                                                            sum +
                                                            (si.requestedQuantity ||
                                                              0),
                                                          0
                                                        ) || 0;
                                                    const currentInput =
                                                      form.getValues(
                                                        `deliveryOrders.${index}.products.${productFormIndex}.requestedQuantity`
                                                      ) || 0;
                                                    const stokTersedia =
                                                      originalDOQuantity -
                                                      totalOtherRequested -
                                                      currentInput;
                                                    return formatNumber(
                                                      stokTersedia < 0
                                                        ? 0
                                                        : stokTersedia
                                                    );
                                                  })()}{" "}
                                                  {product.satuan}
                                                </p>
                                              </div>
                                              <div className="sm:col-span-3">
                                                {productFormIndex !== -1 && (
                                                  <>
                                                    <FormField
                                                      control={form.control}
                                                      name={`deliveryOrders.${index}.products.${productFormIndex}.requestedQuantity`}
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
                                                                field.onChange(
                                                                  numValue
                                                                );
                                                              }}
                                                              disabled={
                                                                isSubmitting ||
                                                                isChosen
                                                              }
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
                                                                Nilai melebihi
                                                                stok tersedia
                                                              </p>
                                                            )}
                                                          </div>
                                                        </FormItem>
                                                      )}
                                                    />
                                                    <FormField
                                                      control={form.control}
                                                      name={`deliveryOrders.${index}.products.${productFormIndex}.productId`}
                                                      render={({ field }) => (
                                                        <input
                                                          type="hidden"
                                                          {...field}
                                                          value={product.id}
                                                        />
                                                      )}
                                                    />
                                                    <FormField
                                                      control={form.control}
                                                      name={`deliveryOrders.${index}.products.${productFormIndex}.shipmentItemId`}
                                                      render={({ field }) => (
                                                        <input
                                                          type="hidden"
                                                          {...field}
                                                          value={
                                                            field.value || ""
                                                          }
                                                        />
                                                      )}
                                                    />
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
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
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link to={`/pengiriman/${id}`}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="text-gray-700"
                  >
                    Batal
                  </Button>
                </Link>
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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
