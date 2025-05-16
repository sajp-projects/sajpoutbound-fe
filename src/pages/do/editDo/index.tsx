import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, Plus, Save, Loader2, X } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

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

interface ExtendedProduct extends CreateDeliveryOrderProduct {
  productName?: string;
  productSatuan?: string;
}

const itemSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.empty": "Barang harus dipilih",
    "any.required": "Barang harus dipilih",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Kuantitas harus berupa angka",
    "number.integer": "Kuantitas harus berupa bilangan bulat",
    "number.min": "Kuantitas minimal 1",
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
  items: Joi.array().min(1).items(itemSchema).required().messages({
    "array.min": "Minimal harus ada 1 barang",
    "any.required": "Daftar barang harus diisi",
  }),
  tempProduct: Joi.string().allow("").optional(),
  tempProductId: Joi.string().allow("").optional(),
  tempQuantity: Joi.number()
    .min(1)
    .messages({
      "number.base": "Kuantitas harus berupa angka",
      "number.min": "Kuantitas minimal 1",
    })
    .optional(),
});

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

interface AutocompleteInputProps<T> {
  items: T[];
  displayValue: string;
  onSelect: (item: T) => void;
  displayKey: keyof T;
  idKey: keyof T;
  placeholder: string;
  isLoading?: boolean;
  error?: string;
  name: string;
  required?: boolean;
  label: string;
  helpText?: string;
  onClear?: () => void;
  secondaryKey?: keyof T;
}

function AutocompleteInput<T>({
  items,
  displayValue,
  onSelect,
  displayKey,
  idKey,
  placeholder,
  isLoading,
  error,
  name,
  required,
  label,
  helpText,
  onClear,
  secondaryKey,
}: AutocompleteInputProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter((item) => {
    const itemValue = String(item[displayKey]).toLowerCase();
    return itemValue.includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const inputClassName = cn(
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm",
    error ? "border-red-500" : ""
  );

  return (
    <FormField
      id={name}
      label={label}
      error={error}
      helpText={helpText}
      required={required}
    >
      <div className="relative" ref={dropdownRef}>
        <Input
          id={name}
          name={name}
          type="text"
          placeholder={placeholder}
          value={displayValue || searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          className={inputClassName}
          onFocus={() => setIsOpen(true)}
        />
        {(displayValue || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              if (onClear) onClear();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isOpen && searchQuery && (
          <div className="absolute z-10 w-full mt-1 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60">
            {isLoading ? (
              <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                Tidak ada data yang cocok
              </div>
            ) : (
              <ul className="py-1">
                {filteredItems.map((item) => (
                  <li
                    key={String(item[idKey])}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      onSelect(item);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    {String(item[displayKey])}
                    {secondaryKey && item[secondaryKey]
                      ? ` (${String(item[secondaryKey])})`
                      : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}

export default function EditDo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deliveryOrderId = id || "";
  const [showItems, setShowItems] = useState(true);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const inputClassName = cn(
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    setError,
  } = useForm<
    UpdateDeliveryOrderInput & {
      customerName?: string;
      items: ExtendedProduct[];
      tempProduct?: string;
      tempProductId?: string;
      tempQuantity?: number;
    }
  >({
    resolver: joiResolver(schema),
    defaultValues: {
      customerId: "",
      customerName: "",
      address: "",
      internalNote: "",
      items: [],
      tempProduct: "",
      tempProductId: "",
      tempQuantity: undefined,
    },
  });

  const { append, remove, update, replace } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchCustomerName = watch("customerName");

  const { data: customersData, isLoading: loadingCustomers } = useCustomers({
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const { data: productsData, isLoading: loadingProducts } = useProducts({
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });

  const customers = customersData?.customers || [];
  const products = productsData?.products || [];

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

  useEffect(() => {
    if (deliveryOrder) {
      reset({
        customerId: deliveryOrder.customerId,
        customerName: deliveryOrder.customer.name,
        address: deliveryOrder.address,
        internalNote: deliveryOrder.internalNote,
      });

      if (deliveryOrder.items && deliveryOrder.items.length > 0) {
        const mappedItems = deliveryOrder.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          productName: item.product.name,
          productSatuan: item.product.satuan,
        }));
        replace(mappedItems);
        setShowItems(true);
      }
    }
  }, [deliveryOrder, reset, replace]);

  const handleCustomerSelect = (customer: (typeof customers)[0]) => {
    setValue("customerId", customer.id, { shouldValidate: true });
    setValue("customerName", customer.name);
    setValue("address", customer.address || "", { shouldValidate: true });
  };

  const resetItemForm = () => {
    setValue("tempProduct", "");
    setValue("tempProductId", "");
    setValue("tempQuantity", undefined);
    const quantityInput = document.querySelector(
      'input[name="tempQuantity"]'
    ) as HTMLInputElement;
    if (quantityInput) {
      quantityInput.value = "";
    }
  };

  const handleAddItem = (product: (typeof products)[0], quantity: number) => {
    if (!quantity || quantity < 1) {
      showErrorAlert("Validasi Gagal", "Kuantitas minimal 1");
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
    setValue("tempProduct", watchItems[index].productName || "");
    setValue("tempProductId", watchItems[index].productId);
    setValue("tempQuantity", watchItems[index].quantity);
  };

  const handleUpdateItem = (
    product: (typeof products)[0],
    quantity: number
  ) => {
    if (!quantity || quantity < 1) {
      showErrorAlert("Validasi Gagal", "Kuantitas minimal 1");
      return;
    }

    if (editingItemIndex !== null) {
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
    data: UpdateDeliveryOrderInput & {
      customerName?: string;
      items: ExtendedProduct[];
      tempProduct?: string;
      tempProductId?: string;
      tempQuantity?: number;
    }
  ) => {
    const validItems = data.items.filter((item) => item.productId);

    if (validItems.length === 0) {
      setError("items", {
        type: "manual",
        message: "Tambahkan minimal satu barang",
      });
      showErrorAlert("Validasi Gagal", "Tambahkan minimal satu barang.");
      return;
    }

    updateDeliveryOrder.mutate({
      id: deliveryOrderId,
      customerId: data.customerId,
      address: data.address,
      internalNote: data.internalNote,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    });
  };

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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Informasi Dasar
                </h3>
                <div className="space-y-4">
                  <AutocompleteInput
                    items={customers}
                    displayValue={watchCustomerName || ""}
                    onSelect={handleCustomerSelect}
                    displayKey="name"
                    idKey="id"
                    placeholder="Masukkan nama pelanggan"
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
                  />

                  <FormField
                    id="address"
                    label="Alamat Pengiriman"
                    required
                    error={errors.address?.message}
                    helpText="Alamat lengkap pengiriman barang"
                  >
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
                  </FormField>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Tambah Barang DO
                </h3>

                <div
                  className={cn(
                    "grid grid-cols-12 gap-2 mb-4",
                    errors.items &&
                      "border border-red-300 rounded-md p-3 bg-red-50"
                  )}
                >
                  <div className="flex items-center col-span-7">
                    <div className="w-full pt-1">
                      <Controller
                        name="tempProduct"
                        control={control}
                        render={({ field: { onChange, value, ...rest } }) => (
                          <AutocompleteInput
                            items={products}
                            displayValue={value || ""}
                            onSelect={(product) => {
                              onChange(product.name);
                              setValue("tempProductId", product.id);
                            }}
                            displayKey="name"
                            idKey="id"
                            secondaryKey="satuan"
                            placeholder="Masukkan nama barang"
                            isLoading={loadingProducts}
                            label=""
                            helpText=""
                            onClear={() => {
                              onChange("");
                              setValue("tempProductId", "");
                            }}
                            {...rest}
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex items-center col-span-3">
                    <div className="w-full pt-1">
                      <Controller
                        name="tempQuantity"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                              placeholder="Masukkan jumlah"
                              className={cn(
                                inputClassName,
                                errors.tempQuantity && "border-red-500",
                                "h-10"
                              )}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                                )
                              }
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
                  <div className="flex items-center col-span-2 pt-1">
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
                  <div className="mt-2 mb-4">
                    <p className="text-sm font-medium text-red-500">
                      {errors.items.message}
                    </p>
                  </div>
                )}

                {showItems && (
                  <div className="mt-4 overflow-hidden border border-gray-200 rounded-md">
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
                                {item.productName}
                                {item.productSatuan
                                  ? ` (${item.productSatuan})`
                                  : ""}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                {item.quantity}
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
                    <p
                      className={cn(
                        errors.items ? "text-red-500" : "text-gray-500"
                      )}
                    >
                      Belum ada barang yang ditambahkan. Masukkan barang dan
                      jumlah, lalu klik tombol + untuk menambahkan barang.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <FormField
                  id="internalNote"
                  label="Catatan Internal"
                  helpText="Catatan tambahan untuk internal (opsional)"
                >
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
                </FormField>
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
