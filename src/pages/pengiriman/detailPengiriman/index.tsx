import {
  useShipment,
  useDeleteShipment,
  useChooseProduct,
  useShipmentChosenProducts,
} from "@/hooks/pengiriman";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import {
  ArrowLeft,
  Edit,
  FileText,
  Info,
  Package,
  Upload,
  History,
  Archive,
  ShoppingCart,
  Check,
  Loader2,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { ShipmentStatus, ChosenProduct } from "@/types/pengiriman";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { useState, useEffect } from "react";
import {
  SHIPMENT_TYPE_LABELS,
  SHIPMENT_STATUS_LABELS,
} from "@/utils/constants";
import { formatNumber } from "@/utils/formatNumber";
import { FormErrorData } from "@/utils/errorHandler";

interface StatusBadgeProps {
  status: ShipmentStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROSES":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SELESAI":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium px-2.5 py-0.5", getStatusColor(status))}
    >
      {SHIPMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

// Update untuk tipe ChosenProduct
interface ChosenProductExtended extends ChosenProduct {
  locationType?: string;
}

// Interface untuk ShipmentItem dengan locationType
interface ShipmentItemExtended {
  id: string;
  deliveryOrderId: string;
  productId: string;
  requestedQuantity: number;
  warehouseId: string;
  chosenProduct: boolean;
  locationType?: string;
  product: {
    id: string;
    name: string;
    satuan: string;
    warehouseId: string;
    warehouse: {
      id: string;
      name: string;
    };
  };
  deliveryOrder: {
    id: string;
    customerId: string;
    customer: {
      id: string;
      name: string;
      address?: string;
    };
  };
  warehouse: {
    id: string;
    name: string;
  };
}

// Define interfaces for the grouped delivery orders
interface ProductItem {
  id: string;
  name: string;
  satuan: string;
  quantity: number;
  warehouseId: string;
  chosenProduct?: boolean;
  locationType?: string;
  warehouse: {
    id: string;
    name: string;
  };
}

interface GroupedDeliveryOrder {
  id: string;
  customer: {
    id: string;
    name: string;
    address?: string;
  };
  products: ProductItem[];
}

export default function DetailPengiriman() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";
  const [activeTab, setActiveTab] = useState<"info" | "items" | "spmb" | "do">(
    "info"
  );

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== "",
  });

  const hasPengirimanUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasPengirimanDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.DELETE
  );

  const shipmentId = id || "";

  const {
    data: shipment,
    isLoading,
    error,
    isError,
    refetch,
  } = useShipment(
    { id: shipmentId },
    {
      enabled: !!shipmentId,
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: chosenProducts = [] as ChosenProductExtended[],
    isLoading: isLoadingChosenProducts,
    error: chosenProductsError,
    isError: isChosenProductsError,
    refetch: refetchChosenProducts,
  } = useShipmentChosenProducts(shipmentId, {
    enabled: !!shipmentId,
  });

  const chooseProduct = useChooseProduct({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Produk berhasil dipilih untuk pengiriman");
      refetch();
      refetchChosenProducts();
    },
    onError: (error: Error) => {
      try {
        const errorObj = JSON.parse(error.message) as FormErrorData;
        showErrorAlert("Gagal Memilih Produk", errorObj.message);
      } catch {
        showErrorAlert(
          "Gagal Memilih Produk",
          "Terjadi kesalahan saat memilih produk"
        );
      }
    },
  });

  const deleteShipment = useDeleteShipment({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengiriman berhasil diarsipkan").then(
        () => {
          navigate("/pengiriman");
        }
      );
    },
    onError: (error: Error) => {
      showErrorAlert(
        "Gagal Mengarsipkan",
        `Gagal mengarsipkan pengiriman: ${
          error.message || "Terjadi kesalahan saat mengarsipkan pengiriman."
        }`
      );
    },
  });

  const handleChooseProduct = (deliveryOrderId: string, productId: string) => {
    chooseProduct.mutate({
      shipmentId,
      deliveryOrderId,
      productId,
    });
  };

  const handleDelete = (id: string) => {
    showConfirmationAlert(
      "Konfirmasi Arsip",
      "Apakah Anda yakin ingin mengarsipkan Pengiriman ini?",
      "Ya, Arsipkan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteShipment.mutate({ id });
      }
    });
  };

  const handleUploadPlatePhoto = () => {
    alert("Fitur pengunggahan foto plat nomor belum diimplementasikan");
  };

  const handleTabChange = (tab: "info" | "items" | "spmb" | "do") => {
    setActiveTab(tab);
    if (tab === "items") {
      refetchChosenProducts();
    }
  };

  useEffect(() => {
    if (activeTab === "items" && shipmentId) {
      refetchChosenProducts();
    }
  }, [activeTab, shipmentId, refetchChosenProducts]);

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/pengiriman">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Detail Pengiriman
          </h1>
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Pengiriman
            </h2>
            <p className="text-sm text-gray-500">
              Detail lengkap informasi pengiriman
            </p>
          </div>
          {shipment?.status && <StatusBadge status={shipment.status} />}
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pengiriman..." />
        ) : isError ? (
          <ErrorState
            title="Gagal Memuat Data Pengiriman"
            message={
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan pada server"
            }
            onRetry={refetch}
            retryButtonText="Coba lagi"
          />
        ) : !shipment ? (
          <div className="p-6 rounded-lg bg-red-50">
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold text-red-700">
                Pengiriman tidak ditemukan
              </h2>
              <p className="mb-4 text-red-600">
                Data pengiriman dengan ID yang diberikan tidak ditemukan atau
                telah dihapus.
              </p>
              <Link to="/pengiriman">
                <Button>Kembali ke Daftar Pengiriman</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-none">
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap",
                  activeTab === "info"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleTabChange("info")}
              >
                <Info className="flex-shrink-0 w-4 h-4 mr-2" />
                Informasi Pengiriman
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap",
                  activeTab === "do"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleTabChange("do")}
              >
                <ShoppingCart className="flex-shrink-0 w-4 h-4 mr-2" />
                Delivery Orders & Produk
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap",
                  activeTab === "items"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleTabChange("items")}
              >
                <Package className="flex-shrink-0 w-4 h-4 mr-2" />
                Item Pengiriman
                {chosenProducts && chosenProducts.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {chosenProducts.length}
                  </span>
                )}
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap",
                  activeTab === "spmb"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleTabChange("spmb")}
              >
                <FileText className="flex-shrink-0 w-4 h-4 mr-2" />
                SPMB
                {shipment.spmbs && shipment.spmbs.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {shipment.spmbs.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "info" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Informasi Kendaraan
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Tipe Pengiriman</p>
                        <p className="font-medium text-gray-700">
                          {SHIPMENT_TYPE_LABELS[shipment.type]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Model Kendaraan</p>
                        <p className="font-medium text-gray-700">
                          {shipment.type === "ANTAR"
                            ? shipment.armada?.model
                            : "Kendaraan Eksternal"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Plat Nomor</p>
                        <p className="font-medium text-gray-700">
                          {shipment.type === "ANTAR" ? (
                            <Link
                              to={`/armada/${shipment.armadaId}`}
                              className="text-blue-600 hover:underline"
                            >
                              {shipment.armada?.plateNumber}
                            </Link>
                          ) : (
                            shipment.plateNumber
                          )}
                        </p>
                      </div>
                      {shipment.platePhoto ? (
                        <div>
                          <p className="text-sm text-gray-500">
                            Foto Plat Nomor
                          </p>
                          <img
                            src={shipment.platePhoto}
                            alt="Foto Plat Nomor"
                            className="object-cover w-full h-32 mt-2 rounded-md"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-500">
                            Foto Plat Nomor
                          </p>
                          <p className="text-red-500">
                            Belum ada foto plat nomor
                          </p>
                          {hasPengirimanUpdateAccess && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={handleUploadPlatePhoto}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Unggah Foto
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {shipment.internalNote && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="mb-4 text-lg font-medium text-gray-900">
                        Catatan Internal
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap wrap-text">
                        {shipment.internalNote}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Informasi Dokumen
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">ID Dokumen</p>
                        <p className="p-1 font-mono text-sm font-medium text-gray-900 break-all rounded bg-gray-50">
                          {shipment.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <StatusBadge status={shipment.status} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Terverifikasi</p>
                        <p className="font-medium text-gray-700">
                          {shipment.isVerified ? (
                            <span className="text-green-600">Ya</span>
                          ) : (
                            <span className="text-red-600">Tidak</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(shipment.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tanggal Diperbarui
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(shipment.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Tindakan
                    </h3>
                    <div className="space-y-3">
                      <Link
                        to={`/pengiriman/${shipmentId}/log`}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="justify-start w-full"
                        >
                          <History className="w-4 h-4 mr-2" />
                          Lihat Log Aktivitas
                        </Button>
                      </Link>
                      {hasPengirimanUpdateAccess &&
                        shipment &&
                        !shipment.deletedAt && (
                          <Link
                            to={`/pengiriman/${shipmentId}/edit`}
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Pengiriman
                            </Button>
                          </Link>
                        )}
                      {hasPengirimanDeleteAccess &&
                        shipment &&
                        !shipment.deletedAt && (
                          <Button
                            variant="outline"
                            className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(shipmentId)}
                            disabled={deleteShipment.isPending}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            {deleteShipment.isPending
                              ? "Mengarsipkan..."
                              : "Arsipkan Pengiriman"}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "do" && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                  Delivery Orders & Produk
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Pilih produk dari delivery order yang akan dimasukkan ke dalam
                  pengiriman ini
                </p>

                {/* Group items by delivery order */}
                {(() => {
                  // Group items by delivery order
                  const doMap = new Map<string, GroupedDeliveryOrder>();

                  shipment.shipmentItems.forEach((item) => {
                    const doId = item.deliveryOrderId;
                    if (!doMap.has(doId)) {
                      doMap.set(doId, {
                        id: doId,
                        customer: item.deliveryOrder.customer,
                        products: [],
                      });
                    }

                    doMap.get(doId)?.products.push({
                      id: item.productId,
                      name: item.product.name,
                      satuan: item.product.satuan,
                      quantity: item.requestedQuantity,
                      warehouseId: item.warehouseId,
                      chosenProduct: item.chosenProduct,
                      locationType: (item as ShipmentItemExtended).locationType,
                      warehouse: item.warehouse,
                    });
                  });

                  return Array.from(doMap.values()).map(
                    (deliveryOrder: GroupedDeliveryOrder, doIndex: number) => (
                      <div
                        key={deliveryOrder.id}
                        className="mb-6 overflow-hidden border border-gray-200 rounded-lg"
                      >
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                <Link
                                  to={`/do/${deliveryOrder.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  Delivery Order #{doIndex + 1}
                                </Link>
                              </h4>
                              <p className="text-sm text-gray-500">
                                {deliveryOrder.customer.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-gray-200 bg-gray-50">
                                <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                                  No
                                </TableHead>
                                <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                                  Produk
                                </TableHead>
                                <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                                  Gudang
                                </TableHead>
                                <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                                  Lokasi
                                </TableHead>
                                <TableHead className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                                  Kuantitas
                                </TableHead>
                                <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                                  Aksi
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {deliveryOrder.products.map(
                                (product: ProductItem, index: number) => (
                                  <TableRow
                                    key={`${deliveryOrder.id}-${product.id}`}
                                  >
                                    <TableCell className="px-4 py-3 text-sm text-gray-600">
                                      {index + 1}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-gray-600">
                                      <Link
                                        to={`/barang/${product.id}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {product.name}
                                      </Link>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-gray-600">
                                      {product.warehouse.name}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-gray-600">
                                      <span className="flex items-center">
                                        <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                        {product.locationType || "GUDANG"}
                                      </span>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                                      {formatNumber(product.quantity)}{" "}
                                      {product.satuan}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                      {hasPengirimanUpdateAccess && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className={
                                            product.chosenProduct
                                              ? "text-green-600 border-green-200 hover:bg-green-50"
                                              : "text-blue-600 border-blue-200 hover:bg-blue-50"
                                          }
                                          onClick={() =>
                                            handleChooseProduct(
                                              deliveryOrder.id,
                                              product.id
                                            )
                                          }
                                          disabled={
                                            chooseProduct.isPending ||
                                            product.chosenProduct
                                          }
                                        >
                                          {chooseProduct.isPending ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                          ) : product.chosenProduct ? (
                                            <Check className="w-4 h-4 mr-2" />
                                          ) : (
                                            <Check className="w-4 h-4 mr-2" />
                                          )}
                                          {product.chosenProduct
                                            ? "Produk Terpilih"
                                            : "Pilih Produk"}
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>
            )}

            {activeTab === "items" && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Item Pengiriman
                </h3>

                {isLoadingChosenProducts ? (
                  <LoadingState text="Memuat data item pengiriman..." />
                ) : isChosenProductsError ? (
                  <ErrorState
                    title="Gagal Memuat Data Item"
                    message={
                      chosenProductsError instanceof Error
                        ? chosenProductsError.message
                        : "Terjadi kesalahan pada server"
                    }
                    retryButtonText="Coba lagi"
                    onRetry={refetchChosenProducts}
                  />
                ) : (
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-gray-200 bg-gray-50">
                            <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                              No
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                              Pelanggan
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                              Barang
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                              Gudang
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                              Satuan
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                              Aksi
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!chosenProducts || chosenProducts.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="px-4 py-6 text-sm text-center text-gray-500"
                              >
                                Tidak ada item yang dipilih dalam pengiriman
                                ini. Pilih produk di tab "Delivery Orders &
                                Produk".
                              </TableCell>
                            </TableRow>
                          ) : (
                            chosenProducts.map((item, index) => (
                              <TableRow key={item.id}>
                                <TableCell className="px-4 py-3 text-sm text-gray-600">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="px-4 py-3 font-medium text-blue-600">
                                  <Link
                                    to={`/pelanggan/${item.deliveryOrder.customer.id}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {item.deliveryOrder.customer.name}
                                  </Link>
                                  {item.deliveryOrder.customer.address && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      {item.deliveryOrder.customer.address}
                                    </p>
                                  )}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-gray-600">
                                  <Link
                                    to={`/barang/${item.productId}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {item.product.name}
                                  </Link>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-gray-600">
                                  {item.product.warehouse.name}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-gray-600">
                                  {item.product.satuan}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                  {hasPengirimanUpdateAccess && (
                                    <div className="flex justify-center space-x-2">
                                      <Link to={`/do/${item.deliveryOrderId}`}>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                          <FileText className="w-4 h-4 mr-2" />
                                          Detail DO
                                        </Button>
                                      </Link>
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Tampilan mobile */}
                <div className="mt-4 sm:hidden">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    Daftar Item Pengiriman:
                  </h4>
                  <div className="space-y-3">
                    {isLoadingChosenProducts ? (
                      <LoadingState text="Memuat data item..." />
                    ) : isChosenProductsError ? (
                      <ErrorState
                        title="Gagal Memuat Data"
                        message={
                          chosenProductsError instanceof Error
                            ? chosenProductsError.message
                            : "Terjadi kesalahan pada server"
                        }
                        retryButtonText="Coba lagi"
                      />
                    ) : chosenProducts.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Tidak ada item yang dipilih dalam pengiriman ini
                      </p>
                    ) : (
                      chosenProducts.map((item, index) => (
                        <div
                          key={item.id}
                          className="p-3 border border-gray-200 rounded-md"
                        >
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-800">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-blue-600">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Gudang: {item.product.warehouse.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Satuan: {item.product.satuan}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Pelanggan: {item.deliveryOrder.customer.name}
                            </p>
                          </div>
                          <div className="mt-3 text-center">
                            <Link to={`/do/${item.deliveryOrderId}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Detail DO
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "spmb" && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Surat Perintah Muat Barang (SPMB)
                </h3>

                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-gray-50">
                          <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                            No
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Kode SPMB
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            ID Delivery Order
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Tanggal Dibuat
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                            Dokumen
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {!shipment.spmbs || shipment.spmbs.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="px-4 py-6 text-sm text-center text-gray-500"
                            >
                              Tidak ada SPMB dalam pengiriman ini
                            </TableCell>
                          </TableRow>
                        ) : (
                          shipment.spmbs.map((spmb, index) => (
                            <TableRow key={spmb.id}>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                {index + 1}
                              </TableCell>
                              <TableCell className="px-4 py-3 font-medium text-blue-600">
                                {spmb.code}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                <Link
                                  to={`/do/${spmb.deliveryOrderId}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {spmb.deliveryOrderId}
                                </Link>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "px-2 py-0.5 rounded-md font-medium text-xs",
                                    spmb.status === "PENDING"
                                      ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                      : spmb.status === "PROSES"
                                      ? "bg-blue-50 text-blue-600 border-blue-200"
                                      : "bg-green-50 text-green-600 border-green-200"
                                  )}
                                >
                                  {spmb.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(spmb.createdAt)}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                {spmb.documentPath ? (
                                  <a
                                    href={spmb.documentPath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    Lihat Dokumen
                                  </a>
                                ) : (
                                  <span className="text-gray-400">
                                    Tidak tersedia
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="mt-4 sm:hidden">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">
                    Daftar SPMB:
                  </h4>
                  <div className="space-y-3">
                    {!shipment.spmbs || shipment.spmbs.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Tidak ada SPMB dalam pengiriman ini
                      </p>
                    ) : (
                      shipment.spmbs.map((spmb, index) => (
                        <div
                          key={spmb.id}
                          className="p-3 border border-gray-200 rounded-md"
                        >
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-800">
                              #{index + 1}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-2 py-0.5 rounded-md font-medium text-xs",
                                spmb.status === "PENDING"
                                  ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                  : spmb.status === "PROSES"
                                  ? "bg-blue-50 text-blue-600 border-blue-200"
                                  : "bg-green-50 text-green-600 border-green-200"
                              )}
                            >
                              {spmb.status}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-blue-600">
                              {spmb.code}
                            </p>
                            <p className="text-xs text-gray-500">
                              DO ID: {spmb.deliveryOrderId}
                            </p>
                            <p className="text-xs text-gray-500">
                              Dibuat: {formatDate(spmb.createdAt)}
                            </p>
                          </div>
                          <div className="mt-3 text-center">
                            {spmb.documentPath ? (
                              <a
                                href={spmb.documentPath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Lihat Dokumen
                              </a>
                            ) : (
                              <span className="text-gray-400">
                                Dokumen tidak tersedia
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
