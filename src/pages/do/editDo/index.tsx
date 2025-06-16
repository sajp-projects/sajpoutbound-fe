import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';
import { ArrowLeft, Loader2, Plus, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';

import { LoadingState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox, ComboboxItem } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/hooks/barang';
import {
  deliveryOrderKeys,
  useDeliveryOrder,
  useUpdateDeliveryOrder,
} from '@/hooks/do';
import { useCustomers } from '@/hooks/pelanggan';
import { shipmentKeys } from '@/hooks/pengiriman';
import { cn } from '@/lib/utils';
import {
  CreateDeliveryOrderProduct,
  UpdateDeliveryOrderInput,
} from '@/types/do';
import { formatNumber } from '@/utils/formatNumber';
import { showErrorAlert, showSuccessAlert } from '@/utils/sweetAlert';
import { useQueryClient } from '@tanstack/react-query';

interface ExtendedProduct extends CreateDeliveryOrderProduct {
  id?: string;
  productName?: string;
  productSatuan?: string;
}

const itemSchema = Joi.object({
  id: Joi.string().optional().optional(),
  productId: Joi.string().required().messages({
    'string.empty': 'Barang harus dipilih',
    'any.required': 'Barang harus dipilih',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Kuantitas harus berupa angka',
    'number.integer': 'Kuantitas harus berupa bilangan bulat',
    'number.min': 'Kuantitas minimal 1',
    'any.required': 'Kuantitas harus diisi',
  }),
  productName: Joi.string().allow('').optional(),
  productSatuan: Joi.string().allow('').optional(),
});

const schema = Joi.object({
  customerId: Joi.string().required().messages({
    'string.empty': 'Pelanggan harus dipilih',
    'any.required': 'Pelanggan harus dipilih',
  }),
  customerName: Joi.string().allow('').optional(),
  address: Joi.string().required().messages({
    'string.empty': 'Alamat pengiriman tidak boleh kosong',
    'any.required': 'Alamat pengiriman harus diisi',
  }),
  internalNote: Joi.string().allow('').optional(),
  items: Joi.array().min(1).items(itemSchema).required().messages({
    'array.min': 'Minimal harus ada 1 barang',
    'any.required': 'Daftar barang harus diisi',
  }),
  tempProduct: Joi.string().allow('').optional().strip(),
  tempProductId: Joi.string().allow('').optional().strip(),
  tempQuantity: Joi.number()
    .min(1)
    .messages({
      'number.base': 'Kuantitas harus berupa angka',
      'number.min': 'Kuantitas minimal 1',
    })
    .optional()
    .strip(),
  tempItemId: Joi.string().allow('').optional().strip(),
});

export default function EditDo() {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deliveryOrderId = id || '';
  const [showItems, setShowItems] = useState(true);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [useCustomerAddress, setUseCustomerAddress] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const inputClassName = cn(
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
    setError,
  } = useForm<
    UpdateDeliveryOrderInput & {
      customerName?: string;
      items: ExtendedProduct[];
      tempProduct?: string;
      tempProductId?: string;
      tempQuantity?: number;
      tempItemId?: string;
    }
  >({
    resolver: joiResolver(schema),
    defaultValues: {
      customerId: '',
      customerName: '',
      address: '',
      internalNote: '',
      items: [],
      tempProduct: '',
      tempProductId: '',
      tempQuantity: undefined,
      tempItemId: '',
    },
  });

  const { append, remove, update, replace } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchCustomerId = watch('customerId');

  const {
    data: customersData,
    isLoading: loadingCustomers,
    refetch: refetchCustomers,
  } = useCustomers({
    staleTime: 300000,
    refetchOnWindowFocus: false,
    searchQuery: customerSearchQuery,
  });

  const {
    data: productsData,
    isLoading: loadingProducts,
    refetch: refetchProducts,
  } = useProducts({
    staleTime: 300000,
    refetchOnWindowFocus: false,
    searchQuery: productSearchQuery,
  });

  const customers = customersData?.customers || [];
  const products = productsData?.products || [];

  // Ubah ke format combobox item
  const customerOptions: ComboboxItem[] = customers.map((customer) => ({
    label: customer.name,
    value: customer.id,
  }));

  const productOptions: ComboboxItem[] = products.map((product) => ({
    label: product.name,
    value: product.id,
    secondary: product.satuan,
  }));

  const handleCustomerSearch = useCallback(
    (query: string) => {
      setCustomerSearchQuery(query);
      refetchCustomers();
    },
    [refetchCustomers]
  );

  const handleProductSearch = useCallback(
    (query: string) => {
      setProductSearchQuery(query);
      refetchProducts();
    },
    [refetchProducts]
  );

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
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.list({}),
      });

      showSuccessAlert(
        'Berhasil!',
        'Delivery Order telah berhasil diperbarui.'
      );
      navigate(`/do/${data.id}`);
    },
    onError: (error) => {
      let errorMessage = 'Terjadi kesalahan saat memperbarui Delivery Order.';
      try {
        const parsedError = JSON.parse(error.message);
        errorMessage = parsedError.message || errorMessage;
      } catch (error: unknown) {
        errorMessage = error instanceof Error ? error.message : errorMessage;
      }
      showErrorAlert('Gagal Memperbarui DO', errorMessage);
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
          id: item.id,
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

  const handleCustomerSelect = (item: ComboboxItem) => {
    const customer = customers.find((c) => c.id === item.value);
    if (customer) {
      setValue('customerId', customer.id, { shouldValidate: true });
      setValue('customerName', customer.name);

      if (useCustomerAddress && customer.address) {
        setValue('address', customer.address, { shouldValidate: true });
      }
    }
  };

  const handleUseCustomerAddressChange = (checked: boolean) => {
    setUseCustomerAddress(checked);

    if (checked) {
      const customerId = watch('customerId');
      if (customerId) {
        const selectedCustomer = customers.find((c) => c.id === customerId);
        if (selectedCustomer && selectedCustomer.address) {
          setValue('address', selectedCustomer.address, {
            shouldValidate: true,
          });
        }
      }
    }
  };

  const resetItemForm = () => {
    setValue('tempProduct', '');
    setValue('tempProductId', '');
    setValue('tempQuantity', undefined);
    setValue('tempItemId', '');
    const quantityInput = document.querySelector(
      'input[name="tempQuantity"]'
    ) as HTMLInputElement;
    if (quantityInput) {
      quantityInput.value = '';
    }
  };

  const handleAddItem = (product: (typeof products)[0], quantity: number) => {
    if (!quantity || quantity < 1) {
      showErrorAlert('Validasi Gagal', 'Kuantitas minimal 1');
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
        'Validasi Gagal',
        'Barang ini sudah ada dalam daftar. Tidak dapat menambahkan barang yang sama.'
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
    setValue('tempProduct', watchItems[index].productName || '');
    setValue('tempProductId', watchItems[index].productId);
    setValue('tempQuantity', watchItems[index].quantity);
    setValue('tempItemId', watchItems[index].id || '');
  };

  const handleUpdateItem = (
    product: (typeof products)[0],
    quantity: number
  ) => {
    if (!quantity || quantity < 1) {
      showErrorAlert('Validasi Gagal', 'Kuantitas minimal 1');
      return;
    }

    if (editingItemIndex !== null) {
      const isDuplicate = watchItems.some(
        (item, index) =>
          item.productId === product.id && index !== editingItemIndex
      );

      if (isDuplicate) {
        showErrorAlert(
          'Validasi Gagal',
          'Barang ini sudah ada dalam daftar. Tidak dapat menambahkan barang yang sama.'
        );
        return;
      }

      update(editingItemIndex, {
        id: watchItems[editingItemIndex].id,
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
    const validItems: ExtendedProduct[] = data.items.filter(
      (item) => item.productId
    );

    if (validItems.length === 0) {
      setError('items', {
        type: 'manual',
        message: 'Tambahkan minimal satu barang',
      });
      showErrorAlert('Validasi Gagal', 'Tambahkan minimal satu barang.');
      return;
    }

    const productIds = validItems.map((item) => item.productId);
    const hasDuplicates = productIds.some(
      (id, index) => productIds.indexOf(id) !== index
    );

    if (hasDuplicates) {
      showErrorAlert(
        'Validasi Gagal',
        'Terdapat barang duplikat dalam daftar. Hapus barang duplikat sebelum melanjutkan.'
      );
      return;
    }

    updateDeliveryOrder.mutate({
      id: deliveryOrderId,
      customerId: data.customerId,
      address: data.address,
      internalNote: data.internalNote,
      items: validItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    });
  };

  const handleProductSelect = (item: ComboboxItem) => {
    const product = products.find((p) => p.id === item.value);
    if (product) {
      setValue('tempProductId', product.id);
      setValue('tempProduct', product.name);
    }
  };

  const handleProductAction = () => {
    const productId = watch('tempProductId');
    const quantity = watch('tempQuantity');

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

  console.log({
    errors,
    isDirty: isDirty,
    tempProductId: watch('tempProductId'),
    tempQuantity: watch('tempQuantity'),
    items: watch('items'),
  });

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
                  <Combobox
                    items={customerOptions}
                    value={watchCustomerId || ''}
                    onValueChange={(value) => {
                      setValue('customerId', value, { shouldValidate: true });
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
                      setValue('customerId', '', { shouldValidate: true });
                      setValue('customerName', '');
                      setValue('address', '', { shouldValidate: true });
                    }}
                    onSearch={handleCustomerSearch}
                    useServerSearch
                  />

                  <div className="space-y-2">
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Alamat Pengiriman{' '}
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
                              errors.address && 'border-red-500'
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
                          render={({ field: { value, onChange } }) => (
                            <Combobox
                              items={productOptions}
                              value={value || ''}
                              onValueChange={onChange}
                              onSelect={handleProductSelect}
                              placeholder="Masukkan nama barang"
                              searchPlaceholder="Cari barang..."
                              isLoading={loadingProducts}
                              error={errors.items ? ' ' : ''}
                              name="tempProductId"
                              onClear={() => {
                                onChange('');
                                setValue('tempProduct', '');
                              }}
                              onSearch={handleProductSearch}
                              useServerSearch
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
                                    'border-red-500',
                                  'h-10'
                                )}
                                value={
                                  field.value ? formatNumber(field.value) : ''
                                }
                                onChange={(e) => {
                                  const numValue =
                                    parseInt(
                                      e.target.value.replace(/\D/g, '')
                                    ) || undefined;
                                  field.onChange(numValue);
                                }}
                              />
                              {errors.tempQuantity && watch('tempQuantity') && (
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
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
                                      : ''}
                                  </Link>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {formatNumber(item.quantity)}
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
                      'p-6 text-center border border-dashed rounded-lg',
                      errors.items
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                    )}
                  >
                    <p
                      className={cn(
                        errors.items ? 'text-red-500' : 'text-gray-500'
                      )}
                    >
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
