import { useUploadPlatePhoto, useVerifyPlateNumber } from "@/hooks/media";
import {
  useBulkWeighShipmentItems,
  useChooseProduct,
  useDeleteShipment,
  useShipment,
  useShipmentChosenProducts,
} from "@/hooks/pengiriman";
import {
  Archive,
  ArrowLeft,
  Check,
  CheckCircle,
  Edit,
  Eye,
  FileText,
  History,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Pencil,
  RefreshCw,
  Scale,
  ShoppingCart,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import { ChangeCustomerModal } from "@/components/ChangeCustomerModal";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ReviseDOModal } from "@/components/ReviseDOModal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilePreviewModal } from "@/components/ui/file-preview-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useDeliveryOrder } from "@/hooks/do";
import { useRolePermissions } from "@/hooks/izin";
import { cn } from "@/lib/utils";
import { DeliveryOrder } from "@/types/do";
import { FilePreview } from "@/types/media";
import {
  ChosenProductExtended,
  GroupedDeliveryOrder,
  ProductItem,
  ShipmentItemExtended,
  ShipmentStatus,
  SPMB,
  StatusBadgeProps,
} from "@/types/pengiriman";
import {
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_TYPE_LABELS,
} from "@/utils/constants";
import { formatDate } from "@/utils/date";
import { FormErrorData } from "@/utils/errorHandler";
import { formatNumber } from "@/utils/formatNumber";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { useEffect, useState } from "react";

function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROSES":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
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

export default function DetailPengiriman() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  // Get tab from URL query parameter or default to "info"
  const getTabFromUrl = (): "info" | "items" | "spmb" | "do" => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "items" || tab === "spmb" || tab === "do") {
      return tab;
    }
    return "info";
  };

  const [activeTab, setActiveTab] = useState<"info" | "items" | "spmb" | "do">(
    getTabFromUrl()
  );
  const [previewFile, setPreviewFile] = useState<FilePreview | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [allItemsCompleted, setAllItemsCompleted] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProductDOs, setSelectedProductDOs] = useState<
    {
      doId: string;
      customer: {
        id: string;
        name: string;
      };
      product: {
        id: string;
        name: string;
        quantity: number;
        satuan: string;
      };
    }[]
  >([]);
  const [weighingProductId, setWeighingProductId] = useState<string>("");
  const [weighingModalOpen, setWeighingModalOpen] = useState(false);
  const [grossWeight, setGrossWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [tareWeight, setTareWeight] = useState("");

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== "",
  });

  // Permission checks for customer change and DO revision
  const hasChangeCustomerAfterWeighAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.CHANGE_CUSTOMER
  );

  const hasReviseDoAfterWeighAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.REVISE_DO
  );

  // Modal states for customer change and DO revision
  const [showChangeCustomerModal, setShowChangeCustomerModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [fullDeliveryOrder, setFullDeliveryOrder] =
    useState<DeliveryOrder | null>(null);
  const [selectedDoId, setSelectedDoId] = useState<string>("");
  const [modalIntent, setModalIntent] = useState<
    "change-customer" | "revise" | null
  >(null);

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

  const hasPengirimanWeighAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.WEIGH
  );

  const hasPengirimanVerifyPlateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.VERIFY_PLATE
  );

  console.log(hasPengirimanVerifyPlateAccess);

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
    refetchOnWindowFocus: false,
  });

  const chooseProduct = useChooseProduct({
    onSuccess: () => {
      // Tutup modal terlebih dahulu, baru tampilkan alert sukses
      handleCloseProductModal();
      // Tunda alert agar tampil setelah modal tertutup
      setTimeout(() => {
        showSuccessAlert("Berhasil", "Barang berhasil dipilih");
        refetch();
        refetchChosenProducts();
      }, 300);
    },
    onError: (error: FormErrorData) => {
      // Tutup modal terlebih dahulu, baru tampilkan alert error
      handleCloseProductModal();

      // Tunda alert agar tampil setelah modal tertutup
      setTimeout(() => {
        // Coba parse error message jika dalam format JSON
        try {
          const errorObj = JSON.parse(error.message);
          if (errorObj && errorObj.message) {
            showErrorAlert("Gagal", errorObj.message);
            return;
          }
        } catch {
          // Jika bukan JSON, gunakan pesan error langsung
        }
        showErrorAlert("Gagal", error.message);
      }, 300);
    },
  });

  const deleteShipment = useDeleteShipment({
    onSuccess: () => {
      showSuccessAlert("Berhasil", "Pengiriman berhasil diarsipkan");
      navigate("/pengiriman");
    },
    onError: (error: FormErrorData) => {
      showErrorAlert("Gagal", error.message);
    },
  });

  const uploadPlatePhoto = useUploadPlatePhoto({
    onSuccess: () => {
      showSuccessAlert("Berhasil", "Foto plat nomor berhasil diunggah");
      refetch();
    },
    onError: (error: Error) => {
      showErrorAlert(
        "Gagal",
        error.message || "Terjadi kesalahan saat mengupload foto plat nomor"
      );
    },
  });

  // Hook to fetch full delivery order data for modals
  const {
    data: fullDeliveryOrderData,
    isLoading: isLoadingFullDOHook,
    error: deliveryOrderError,
  } = useDeliveryOrder(
    { id: selectedDoId, shipmentId: shipment?.id },
    {
      enabled: !!selectedDoId, // Only fetch when we have a selectedDoId
      staleTime: 0, // Always fetch fresh data
      retry: 1,
    }
  );

  // Update fullDeliveryOrder when data is fetched and open appropriate modal
  useEffect(() => {
    if (fullDeliveryOrderData && modalIntent) {
      setFullDeliveryOrder(fullDeliveryOrderData);

      // Open the appropriate modal based on intent
      if (modalIntent === "change-customer") {
        setShowChangeCustomerModal(true);
      } else if (modalIntent === "revise") {
        setShowReviseModal(true);
      }

      // Reset modal intent after opening
      setModalIntent(null);
    }
  }, [fullDeliveryOrderData, modalIntent]);

  // Handle delivery order fetch error
  useEffect(() => {
    if (deliveryOrderError) {
      showErrorAlert("Gagal", "Terjadi kesalahan saat memuat data DO");
      setSelectedDoId(""); // Reset to stop further attempts
    }
  }, [deliveryOrderError]);

  const verifyPlateNumber = useVerifyPlateNumber({
    onSuccess: () => {
      showSuccessAlert("Berhasil", "Plat nomor berhasil diverifikasi");
      refetch();
    },
    onError: (error: Error) => {
      showErrorAlert(
        "Gagal",
        error.message || "Terjadi kesalahan saat memverifikasi plat nomor"
      );
    },
  });

  const bulkWeighItems = useBulkWeighShipmentItems({
    onSuccess: () => {
      showSuccessAlert("Berhasil", "Item berhasil ditimbang");
      setWeighingModalOpen(false);
      refetch();
      refetchChosenProducts();
    },
    onError: (error: FormErrorData) => {
      try {
        const errorObj = JSON.parse(error.message);
        if (errorObj && errorObj.message) {
          showErrorAlert("Gagal", errorObj.message);
          return;
        }
      } catch {
        // If not JSON, use error message directly
      }
      showErrorAlert("Gagal", error.message);
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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset input value untuk memungkinkan upload file yang sama
    event.target.value = "";

    try {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        showErrorAlert(
          "Format File Tidak Valid",
          "Silakan pilih file gambar (JPG, PNG, dll.)"
        );
        return;
      }

      // Validasi ukuran file (maksimal 10MB)
      const maxSizeInMB = 10;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        showErrorAlert(
          "File Terlalu Besar",
          `Ukuran file (${fileSizeInMB}MB) melebihi batas maksimum ${maxSizeInMB}MB. Silakan pilih file yang lebih kecil.`
        );
        return;
      }

      handleUploadPlatePhoto(file);
    } catch (error) {
      console.error("Error processing file:", error);
      showErrorAlert(
        "Error",
        "Terjadi kesalahan saat memproses file. Silakan coba lagi."
      );
    }
  };

  const handleUploadPlatePhoto = (file: File) => {
    if (!shipmentId || !file) return;
    uploadPlatePhoto.mutate({ shipmentId, file });
  };

  const handleVerifyPlateNumber = () => {
    if (!shipmentId) return;
    verifyPlateNumber.mutate(shipmentId);
  };

  const handleReplacePhoto = () => {
    if (
      !hasPengirimanUpdateAccess ||
      !allItemsCompleted ||
      shipment?.isVerified
    )
      return;
    document.getElementById("platePhotoInput")?.click();
  };

  // Helper functions for DO modal operations
  const handleOpenChangeCustomerModal = (
    deliveryOrder: GroupedDeliveryOrder
  ) => {
    setSelectedDoId(deliveryOrder.id);
    setModalIntent("change-customer");
  };

  const handleOpenReviseModal = (deliveryOrder: GroupedDeliveryOrder) => {
    setSelectedDoId(deliveryOrder.id);
    setModalIntent("revise");
  };

  const handleCloseChangeCustomerModal = () => {
    setShowChangeCustomerModal(false);
    setFullDeliveryOrder(null);
    setSelectedDoId("");
    setModalIntent(null);
  };

  const handleCloseReviseModal = () => {
    setShowReviseModal(false);
    setFullDeliveryOrder(null);
    setSelectedDoId("");
    setModalIntent(null);
  };

  const handleViewPlatePhoto = () => {
    if (!shipment?.platePhoto) return;

    // Gunakan path relatif yang akan di-proxy oleh Vite
    const fileUrl = `/public${shipment.platePhoto}`;
    setPreviewFile({
      url: fileUrl,
      name: "Foto Plat Nomor",
      type: "image/jpeg",
    });
    setPreviewModalOpen(true);
  };

  const handleTabChange = (tab: "info" | "items" | "spmb" | "do") => {
    setActiveTab(tab);
    if (tab === "items") {
      refetchChosenProducts();
    }

    // Update URL with the active tab
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("tab", tab);
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  const handleOpenProductModal = (productId: string) => {
    if (!shipment) return;

    const productDOs: {
      doId: string;
      customer: {
        id: string;
        name: string;
      };
      product: {
        id: string;
        name: string;
        quantity: number;
        satuan: string;
      };
    }[] = [];

    // Collect all DOs containing this product
    shipment.shipmentItems.forEach((item) => {
      if (item.productId === productId) {
        productDOs.push({
          doId: item.deliveryOrderId,
          customer: item.deliveryOrder.customer,
          product: {
            id: item.productId,
            name: item.product.name,
            quantity: item.requestedQuantity,
            satuan: item.product.satuan,
          },
        });
      }
    });

    setSelectedProductId(productId);
    setSelectedProductDOs(productDOs);
    setProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductModalOpen(false);
    setSelectedProductId("");
    setSelectedProductDOs([]);
  };

  const handleOpenWeighingModal = (productId: string) => {
    setWeighingProductId(productId);
    setWeighingModalOpen(true);
  };

  const handleCloseWeighingModal = () => {
    setWeighingModalOpen(false);
    setWeighingProductId("");
  };

  const handleWeighSubmit = () => {
    if (!shipmentId || !weighingProductId) return;
    bulkWeighItems.mutate({
      shipmentId,
      productId: weighingProductId,
      grossWeight: parseFloat(grossWeight),
      netWeight: netWeight ? parseFloat(netWeight) : undefined,
      tareWeight: tareWeight ? parseFloat(tareWeight) : undefined,
    });
  };

  useEffect(() => {
    if (activeTab === "items" && shipmentId) {
      refetchChosenProducts();
    }
  }, [activeTab, shipmentId, refetchChosenProducts]);

  // Effect to update tab when URL changes
  useEffect(() => {
    const currentTab = getTabFromUrl();
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Check if all items are completed
  useEffect(() => {
    if (shipment && shipment.shipmentItems) {
      const allCompleted = shipment.shipmentItems.every(
        (item) => item.status === "COMPLETED"
      );
      setAllItemsCompleted(allCompleted);
    }
  }, [shipment]);

  // Handler for SPMB preview:
  const handlePreviewSpmb = (spmb: SPMB) => {
    setPreviewFile({
      url: `/public/${spmb.documentPath}`,
      name: `${spmb.code}.pdf`,
      type: "application/pdf",
    });
    setPreviewModalOpen(true);
  };

  // Handler for Nota Timbangan preview:
  const handlePreviewNotaTimbangan = (notaTimbangan: {
    ticketNumber: string;
    documentPath: string;
  }) => {
    setPreviewFile({
      url: `/public/${notaTimbangan.documentPath}`,
      name: `Nota Timbangan_${notaTimbangan.ticketNumber}.pdf`,
      type: "application/pdf",
    });
    setPreviewModalOpen(true);
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col gap-3 justify-between items-start sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/pengiriman">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="mr-1 w-4 h-4" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Detail Pengiriman
          </h1>
        </div>
      </div>

      <div className="overflow-hidden p-4 bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col gap-4 justify-between items-start mb-6 sm:flex-row sm:items-center">
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
          <div className="p-6 bg-red-50 rounded-lg">
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
                <Info className="flex-shrink-0 mr-2 w-4 h-4" />
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
                <ShoppingCart className="flex-shrink-0 mr-2 w-4 h-4" />
                Delivery Orders & Barang
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
                <Package className="flex-shrink-0 mr-2 w-4 h-4" />
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
                <FileText className="flex-shrink-0 mr-2 w-4 h-4" />
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
                  <div className="p-4 rounded-lg border border-gray-200">
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
                      <div>
                        {shipment.platePhoto ? (
                          <div>
                            <p className="mb-2 text-sm text-gray-500">
                              Foto Plat Nomor
                            </p>

                            <div className="relative group">
                              <img
                                src={`/public${shipment.platePhoto}`}
                                alt="Foto Plat Nomor"
                                className="object-cover w-full h-40 rounded-lg border border-gray-200 transition-all duration-300 cursor-pointer hover:opacity-95 hover:shadow-lg"
                                onClick={handleViewPlatePhoto}
                                onError={(e) => {
                                  console.error(
                                    "Error loading image:",
                                    e.currentTarget.src
                                  );
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="flex justify-center items-center w-full h-40 bg-gray-100 rounded-lg border-2 border-gray-300 border-dashed">
                                        <div class="text-center">
                                          <p class="text-sm text-gray-500">Gambar tidak dapat dimuat</p>
                                          <p class="mt-1 text-xs text-gray-400">Klik untuk melihat detail</p>
                                        </div>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-white/0 rounded-lg opacity-0 group-hover:bg-white/10 group-hover:opacity-100 backdrop-blur-[1px]">
                                <div className="transition-transform duration-300 transform scale-90 group-hover:scale-100">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="text-gray-700 border border-gray-200 shadow-lg backdrop-blur-sm bg-white/95 hover:bg-white"
                                    onClick={handleViewPlatePhoto}
                                  >
                                    <Eye className="mr-2 w-4 h-4" />
                                    Lihat Detail
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 mt-3 space-y-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  {shipment.isVerified ? (
                                    <div className="flex items-center px-3 py-1.5 bg-green-100 rounded-full border border-green-200">
                                      <CheckCircle className="mr-2 w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700">
                                        Terverifikasi
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center px-3 py-1.5 bg-orange-100 rounded-full border border-orange-200">
                                      <div className="mr-2 w-4 h-4 bg-orange-400 rounded-full"></div>
                                      <span className="text-sm font-medium text-orange-700">
                                        Belum diverifikasi
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {hasPengirimanVerifyPlateAccess &&
                                  !shipment.isVerified && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleVerifyPlateNumber}
                                      disabled={verifyPlateNumber.isPending}
                                      className="text-blue-600 border-blue-200 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
                                    >
                                      {verifyPlateNumber.isPending ? (
                                        <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                      ) : (
                                        <CheckCircle className="mr-2 w-4 h-4" />
                                      )}
                                      Verifikasi
                                    </Button>
                                  )}
                              </div>

                              {/* Tombol Aksi Foto */}
                              {hasPengirimanVerifyPlateAccess &&
                                allItemsCompleted &&
                                !shipment.isVerified && (
                                  <div className="flex gap-2 items-center pt-2 border-t border-gray-200">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleReplacePhoto}
                                      disabled={uploadPlatePhoto.isPending}
                                      className="w-full text-blue-600 border-blue-200 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
                                    >
                                      <RefreshCw className="mr-2 w-4 h-4" />
                                      Ganti Foto
                                    </Button>
                                  </div>
                                )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            {allItemsCompleted && hasPengirimanVerifyPlateAccess ? (
                              <>
                                <div
                                  className="flex justify-center items-center w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 border-dashed transition-all duration-300 cursor-pointer hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 group"
                                  onClick={() =>
                                    document
                                      .getElementById("platePhotoInput")
                                      ?.click()
                                  }
                                >
                                  <div className="p-6 text-center">
                                    <div className="flex justify-center items-center mx-auto mb-3 w-12 h-12 bg-gray-200 rounded-full transition-colors duration-300 group-hover:bg-blue-200">
                                      <Upload className="w-6 h-6 text-gray-400 transition-colors duration-300 group-hover:text-blue-500" />
                                    </div>
                                    <p className="mb-1 text-sm font-medium text-gray-600 transition-colors duration-300 group-hover:text-blue-700">
                                      Belum ada foto plat nomor
                                    </p>
                                    <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-blue-600">
                                      Klik untuk mengunggah foto
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      document
                                        .getElementById("platePhotoInput")
                                        ?.click()
                                    }
                                    disabled={uploadPlatePhoto.isPending}
                                    className="w-full text-blue-600 border-blue-200 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
                                  >
                                    {uploadPlatePhoto.isPending ? (
                                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                    ) : (
                                      <Upload className="mr-2 w-4 h-4" />
                                    )}
                                    {uploadPlatePhoto.isPending
                                      ? "Mengunggah..."
                                      : "Unggah Foto Plat Nomor"}
                                  </Button>
                                  <div className="p-3 mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                    <p className="text-xs text-blue-700">
                                      <strong>Format:</strong> JPG, PNG
                                      <br />
                                      <strong>Ukuran maksimal:</strong> 10MB
                                    </p>
                                  </div>
                                </div>
                              </>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {shipment.internalNote && (
                    <div className="p-4 rounded-lg border border-gray-200">
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
                  <div className="p-4 rounded-lg border border-gray-200">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Informasi Dokumen
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Nomor Pengiriman
                        </p>
                        <p className="p-1 font-mono text-sm font-medium text-gray-900 break-all bg-gray-50 rounded">
                          {shipment.shipmentNumber}
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

                  <div className="p-4 rounded-lg border border-gray-200">
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
                          <History className="mr-2 w-4 h-4" />
                          Lihat Log Aktivitas
                        </Button>
                      </Link>
                      {hasPengirimanUpdateAccess &&
                        shipment &&
                        !shipment.deletedAt &&
                        shipment.status !== "SELESAI" &&
                        shipment.status !== "COMPLETED" && (
                          <Link
                            to={`/pengiriman/${shipmentId}/edit`}
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                            >
                              <Edit className="mr-2 w-4 h-4" />
                              Edit Pengiriman
                            </Button>
                          </Link>
                        )}
                      {hasPengirimanDeleteAccess &&
                        shipment &&
                        !shipment.deletedAt &&
                        shipment.status !== "SELESAI" &&
                        shipment.status !== "COMPLETED" && (
                          <Button
                            variant="outline"
                            className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(shipmentId)}
                            disabled={deleteShipment.isPending}
                          >
                            <Archive className="mr-2 w-4 h-4" />
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
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <ShoppingCart className="mr-2 w-5 h-5 text-blue-600" />
                  Delivery Orders & Barang
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Ringkasan barang dari seluruh delivery order dalam pengiriman
                  ini
                </p>

                {/* Tabel barang - Desktop view */}
                <div className="hidden mb-6 rounded-lg border border-gray-200 sm:block">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-b border-gray-200">
                          <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                            No
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Barang
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Gudang
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                            Jumlah DO
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                            Total Kuantitas
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                            Aksi
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          // Group items by product
                          const productMap = new Map<
                            string,
                            {
                              id: string;
                              name: string;
                              satuan: string;
                              warehouseId: string;
                              warehouse: {
                                id: string;
                                name: string;
                              };
                              doIds: Set<string>;
                              totalQuantity: number;
                              isChosen: boolean;
                            }
                          >();

                          shipment.shipmentItems.forEach((item) => {
                            const productId = item.productId;
                            if (!productMap.has(productId)) {
                              productMap.set(productId, {
                                id: productId,
                                name: item.product.name,
                                satuan: item.product.satuan,
                                warehouseId: item.warehouseId,
                                warehouse: item.warehouse,
                                doIds: new Set([item.deliveryOrderId]),
                                totalQuantity: item.requestedQuantity,
                                isChosen: item.chosenProduct || false,
                              });
                            } else {
                              const product = productMap.get(productId)!;
                              product.doIds.add(item.deliveryOrderId);
                              product.totalQuantity += item.requestedQuantity;
                              if (item.chosenProduct) {
                                product.isChosen = true;
                              }
                            }
                          });

                          return Array.from(productMap.values()).map(
                            (product, index) => (
                              <TableRow key={product.id}>
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
                                <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                  <Badge
                                    variant="outline"
                                    className="text-blue-700 bg-blue-50 border-blue-200"
                                  >
                                    {product.doIds.size} DO
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                                  {formatNumber(product.totalQuantity)}{" "}
                                  {product.satuan}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                  {product.isChosen ? (
                                    <Badge
                                      variant="outline"
                                      className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap"
                                    >
                                      Sudah Dimuat
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="outline"
                                      className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap"
                                    >
                                      Belum Dimuat
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                  <div className="flex justify-center space-x-2">
                                    {hasPengirimanUpdateAccess &&
                                      !product.isChosen && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                          onClick={() =>
                                            handleOpenProductModal(product.id)
                                          }
                                          disabled={chooseProduct.isPending}
                                        >
                                          <Package className="mr-2 w-4 h-4" />
                                          Muat Barang
                                        </Button>
                                      )}
                                    {hasPengirimanUpdateAccess &&
                                      product.isChosen && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-green-600 border-green-200 hover:bg-green-50"
                                          disabled={true}
                                        >
                                          <Check className="mr-2 w-4 h-4" />
                                          Barang Sudah Dimuat
                                        </Button>
                                      )}
                                    {hasPengirimanWeighAccess &&
                                      product.isChosen && (
                                        <>
                                          {shipment.shipmentItems
                                            .filter(
                                              (si) =>
                                                si.productId === product.id
                                            )
                                            .every(
                                              (si) => si.status === "COMPLETED"
                                            ) ? (
                                            /* ── SUDAH DITIMBANG (one disabled button) ── */
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-green-600 bg-green-50 border-green-200 cursor-not-allowed"
                                              disabled
                                            >
                                              <Check className="mr-2 w-4 h-4" />
                                              Sudah ditimbang
                                            </Button>
                                          ) : (
                                            /* ── BELUM SELESAI (two buttons) ── */
                                            <>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-blue-600 border-blue-200 hover:bg-purple-50"
                                                onClick={() =>
                                                  handleOpenWeighingModal(
                                                    product.id
                                                  )
                                                }
                                                disabled={
                                                  bulkWeighItems.isPending
                                                }
                                              >
                                                <Scale className="mr-2 w-4 h-4" />
                                                Timbang
                                              </Button>

                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-blue-600 border-blue-200 hover:bg-purple-50"
                                                onClick={() =>
                                                  window.open(
                                                    `${
                                                      import.meta.env
                                                        .VITE_WEIGHING_URL
                                                    }`,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                  )
                                                }
                                              >
                                                <Navigation className="mr-2 w-4 h-4" />
                                                API
                                              </Button>
                                            </>
                                          )}
                                        </>
                                      )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          );
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Tampilan mobile - Tabel barang */}
                <div className="mb-6 sm:hidden">
                  <h3 className="mb-3 text-base font-medium text-gray-800">
                    Daftar Barang
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      // Group items by product
                      const productMap = new Map<
                        string,
                        {
                          id: string;
                          name: string;
                          satuan: string;
                          warehouseId: string;
                          warehouse: {
                            id: string;
                            name: string;
                          };
                          doIds: Set<string>;
                          totalQuantity: number;
                          isChosen: boolean;
                        }
                      >();

                      shipment.shipmentItems.forEach((item) => {
                        const productId = item.productId;
                        if (!productMap.has(productId)) {
                          productMap.set(productId, {
                            id: productId,
                            name: item.product.name,
                            satuan: item.product.satuan,
                            warehouseId: item.warehouseId,
                            warehouse: item.warehouse,
                            doIds: new Set([item.deliveryOrderId]),
                            totalQuantity: item.requestedQuantity,
                            isChosen: item.chosenProduct || false,
                          });
                        } else {
                          const product = productMap.get(productId)!;
                          product.doIds.add(item.deliveryOrderId);
                          product.totalQuantity += item.requestedQuantity;
                          if (item.chosenProduct) {
                            product.isChosen = true;
                          }
                        }
                      });

                      return Array.from(productMap.values()).map(
                        (product, index) => (
                          <div
                            key={product.id}
                            className="p-4 rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <div className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                                  {index + 1}
                                </div>
                                <Link
                                  to={`/barang/${product.id}`}
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  {product.name}
                                </Link>
                              </div>
                              {product.isChosen ? (
                                <Badge
                                  variant="outline"
                                  className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap"
                                >
                                  Sudah Dimuat
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap"
                                >
                                  Belum Dimuat
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <p>
                                <span className="font-medium">Gudang: </span>
                                {product.warehouse.name}
                              </p>
                              <div className="flex items-center">
                                <span className="font-medium">Jumlah DO: </span>
                                <Badge
                                  variant="outline"
                                  className="text-blue-700 bg-blue-50 border-blue-200"
                                >
                                  {product.doIds.size} DO
                                </Badge>
                              </div>
                              <p>
                                <span className="font-medium">
                                  Total Kuantitas:{" "}
                                </span>
                                {formatNumber(product.totalQuantity)}{" "}
                                {product.satuan}
                              </p>
                            </div>
                            {(hasPengirimanUpdateAccess ||
                              hasPengirimanWeighAccess) && (
                              <div className="pt-3 mt-3 space-y-2 border-t border-gray-100">
                                {hasPengirimanUpdateAccess &&
                                  !product.isChosen && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                      onClick={() =>
                                        handleOpenProductModal(product.id)
                                      }
                                      disabled={chooseProduct.isPending}
                                    >
                                      <Package className="mr-2 w-4 h-4" />
                                      Muat Barang
                                    </Button>
                                  )}
                                {hasPengirimanUpdateAccess &&
                                  product.isChosen && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-green-600 border-green-200 hover:bg-green-50"
                                      disabled={true}
                                    >
                                      <Check className="mr-2 w-4 h-4" />
                                      Barang Sudah Dimuat
                                    </Button>
                                  )}
                                {hasPengirimanWeighAccess &&
                                  product.isChosen && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full text-blue-600 border-blue-200 hover:bg-purple-50"
                                      onClick={() =>
                                        handleOpenWeighingModal(product.id)
                                      }
                                      disabled={bulkWeighItems.isPending}
                                    >
                                      <Scale className="mr-2 w-4 h-4" />
                                      Timbang
                                    </Button>
                                  )}
                              </div>
                            )}
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>

                {/* Accordion untuk delivery order */}
                <h4 className="mb-4 text-lg font-medium text-gray-900">
                  Daftar Delivery Order
                </h4>
                <Accordion type="multiple" className="space-y-4">
                  {(() => {
                    // Group items by delivery order
                    const doMap = new Map<string, GroupedDeliveryOrder>();

                    shipment.shipmentItems.forEach((item) => {
                      const doId = item.deliveryOrderId;
                      if (!doMap.has(doId)) {
                        doMap.set(doId, {
                          id: doId,
                          doNumber: item.deliveryOrder.doNumber,
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
                        locationType: (item as ShipmentItemExtended)
                          .locationType,
                        warehouse: item.warehouse,
                      });
                    });

                    return Array.from(doMap.values()).map(
                      (
                        deliveryOrder: GroupedDeliveryOrder,
                        doIndex: number
                      ) => (
                        <AccordionItem
                          key={deliveryOrder.id}
                          value={`do-${doIndex}`}
                          className="overflow-hidden rounded-lg border border-gray-200"
                        >
                          <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100 hover:no-underline">
                            <div className="flex items-center justify-between w-full text-left">
                              <div className="min-w-0 flex-1 mr-2">
                                <h4 className="font-medium text-gray-900">
                                  <Link
                                    to={`/do/${deliveryOrder.id}`}
                                    className="text-blue-600 hover:underline inline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {deliveryOrder.doNumber}
                                  </Link>
                                </h4>
                                <p className="text-sm text-gray-500 truncate">
                                  {deliveryOrder.customer.name}
                                </p>
                              </div>

                              {/* Action buttons for customer change and DO revision */}
                              {shipment.status === "PROSES" && 
                               deliveryOrder.products.some(product => product.chosenProduct) && (
                                <div
                                  className="flex gap-1 sm:gap-2 flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {hasChangeCustomerAfterWeighAccess && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenChangeCustomerModal(
                                          deliveryOrder
                                        );
                                      }}
                                      disabled={isLoadingFullDOHook}
                                      title="Ubah Customer" // Tooltip for icon-only view
                                    >
                                      {isLoadingFullDOHook ? (
                                        <Loader2 className="w-3 h-3 animate-spin sm:mr-1" />
                                      ) : (
                                        <UserCheck className="w-3 h-3 sm:mr-1" />
                                      )}
                                      <span className="hidden sm:inline ml-1">
                                        {isLoadingFullDOHook
                                          ? "Loading..."
                                          : "Ubah Customer"}
                                      </span>
                                    </Button>
                                  )}
                                  {hasReviseDoAfterWeighAccess && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-green-600 border-green-200 hover:bg-green-50 flex-shrink-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenReviseModal(deliveryOrder);
                                      }}
                                      disabled={isLoadingFullDOHook}
                                      title="Revisi DO" // Tooltip for icon-only view
                                    >
                                      {isLoadingFullDOHook ? (
                                        <Loader2 className="w-3 h-3 animate-spin sm:mr-1" />
                                      ) : (
                                        <Pencil className="w-3 h-3 sm:mr-1" />
                                      )}
                                      <span className="hidden sm:inline ml-1">
                                        {isLoadingFullDOHook
                                          ? "Loading..."
                                          : "Revisi DO"}
                                      </span>
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-0">
                            <div className="hidden overflow-x-auto sm:block">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50 border-b border-gray-200">
                                    <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                                      No
                                    </TableHead>
                                    <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                                      Barang
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
                                      Status
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
                                          {product.chosenProduct ? (
                                            <Badge
                                              variant="outline"
                                              className="text-green-700 bg-green-50 border-green-200"
                                            >
                                              Sudah Dimuat
                                            </Badge>
                                          ) : (
                                            <Badge
                                              variant="outline"
                                              className="text-yellow-700 bg-yellow-50 border-yellow-200"
                                            >
                                              Belum Dimuat
                                            </Badge>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                </TableBody>
                              </Table>
                            </div>

                            {/* Mobile view untuk product dalam DO */}
                            <div className="sm:hidden">
                              <div className="p-4 space-y-3">
                                {deliveryOrder.products.map(
                                  (product: ProductItem, index: number) => (
                                    <div
                                      key={`${deliveryOrder.id}-${product.id}`}
                                      className="p-3 rounded-lg border border-gray-200"
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center">
                                          <div className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                                            {index + 1}
                                          </div>
                                          <Link
                                            to={`/barang/${product.id}`}
                                            className="font-medium text-blue-600 hover:underline"
                                          >
                                            {product.name}
                                          </Link>
                                        </div>
                                        {product.chosenProduct ? (
                                          <Badge
                                            variant="outline"
                                            className="text-green-700 bg-green-50 border-green-200"
                                          >
                                            Sudah Dimuat
                                          </Badge>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="text-yellow-700 bg-yellow-50 border-yellow-200"
                                          >
                                            Belum Dimuat
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="space-y-1 text-xs text-gray-600">
                                        <p>
                                          <span className="font-medium">
                                            Gudang:{" "}
                                          </span>
                                          {product.warehouse.name}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Lokasi:{" "}
                                          </span>
                                          <span className="flex items-center">
                                            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                            {product.locationType || "GUDANG"}
                                          </span>
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Kuantitas:{" "}
                                          </span>
                                          {formatNumber(product.quantity)}{" "}
                                          {product.satuan}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    );
                  })()}
                </Accordion>
              </div>
            )}

            {activeTab === "items" && (
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <Package className="mr-2 w-5 h-5 text-blue-600" />
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
                  <div>
                    {/* Desktop view */}
                    <div className="hidden overflow-hidden rounded-lg border border-gray-200 sm:block">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                                Kode
                              </TableHead>
                              <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                                Barang
                              </TableHead>
                              <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                                Gudang
                              </TableHead>
                              <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                                Lokasi
                              </TableHead>
                              <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                                Pelanggan
                              </TableHead>
                              <TableHead className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                                Kuantitas
                              </TableHead>
                              <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                                Status Timbangan
                              </TableHead>
                              <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                                Nota Timbangan
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
                                  colSpan={9}
                                  className="px-4 py-6 text-sm text-center text-gray-500"
                                >
                                  Tidak ada item yang dipilih dalam pengiriman
                                  ini. Muat Barang di tab "Delivery Orders &
                                  Barang".
                                </TableCell>
                              </TableRow>
                            ) : (
                              chosenProducts.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="px-4 py-3 text-sm text-gray-600">
                                    {item.code}
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
                                    <span className="flex items-center">
                                      <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                      {item.locationType || "GUDANG"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-sm text-gray-600">
                                    <div className="space-y-1">
                                      {item.customers.map((customer, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center"
                                        >
                                          <Link
                                            to={`/pelanggan/${customer.id}`}
                                            className="text-xs text-blue-600 hover:underline"
                                          >
                                            {customer.name}
                                          </Link>
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                                    {formatNumber(item.totalRequestedQuantity)}{" "}
                                    {item.product.satuan}
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                    {item.shipmentItems.every(
                                      (si) => si.status === "COMPLETED"
                                    ) ? (
                                      <Badge
                                        variant="outline"
                                        className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap"
                                      >
                                        Sudah Ditimbang
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap"
                                      >
                                        Belum Ditimbang
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                    {item.shipmentItems.every(
                                      (si) => si.status === "COMPLETED"
                                    ) &&
                                    item.weighings &&
                                    item.weighings.length > 0 &&
                                    item.weighings[0]?.notaTimbangan ? (
                                      <button
                                        type="button"
                                        className="text-blue-600 hover:underline"
                                        onClick={() =>
                                          handlePreviewNotaTimbangan({
                                            ticketNumber:
                                              item.weighings[0].notaTimbangan!
                                                .ticketNumber,
                                            documentPath:
                                              item.weighings[0].notaTimbangan!
                                                .documentPath,
                                          })
                                        }
                                      >
                                        Lihat Dokumen
                                      </button>
                                    ) : (
                                      <span className="text-gray-400">
                                        Belum tersedia
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                    {hasPengirimanUpdateAccess && (
                                      <div className="flex justify-center space-x-2">
                                        {item.deliveryOrders.length > 0 && (
                                          <Link
                                            to={`/do/${item.deliveryOrders[0].id}`}
                                          >
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                            >
                                              <FileText className="mr-2 w-4 h-4" />
                                              Detail DO
                                            </Button>
                                          </Link>
                                        )}
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

                    {/* Mobile view */}
                    <div className="block sm:hidden">
                      <div className="space-y-4">
                        {!chosenProducts || chosenProducts.length === 0 ? (
                          <div className="p-4 text-center rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-500">
                              Tidak ada item yang dipilih dalam pengiriman ini.
                              Muat Barang di tab "Delivery Orders & Barang".
                            </p>
                          </div>
                        ) : (
                          chosenProducts.map((item, index) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                  <div className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                                    {index + 1}
                                  </div>
                                  <Link
                                    to={`/barang/${item.productId}`}
                                    className="font-medium text-blue-600 hover:underline"
                                  >
                                    {item.product.name}
                                  </Link>
                                </div>
                                {item.shipmentItems.every(
                                  (si) => si.status === "COMPLETED"
                                ) ? (
                                  <Badge
                                    variant="outline"
                                    className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap"
                                  >
                                    Sudah Ditimbang
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap"
                                  >
                                    Belum Ditimbang
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-start">
                                  <span className="w-20 font-medium">
                                    Gudang:
                                  </span>
                                  <span>{item.product.warehouse.name}</span>
                                </div>
                                <div className="flex items-start">
                                  <span className="w-20 font-medium">
                                    Lokasi:
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                    {item.locationType || "GUDANG"}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <span className="w-20 font-medium">
                                    Kuantitas:
                                  </span>
                                  <span>
                                    {formatNumber(item.totalRequestedQuantity)}{" "}
                                    {item.product.satuan}
                                  </span>
                                </div>
                                <div className="flex items-start">
                                  <span className="w-20 font-medium">
                                    Pelanggan:
                                  </span>
                                  <div className="flex flex-col space-y-1">
                                    {item.customers.map((customer, idx) => (
                                      <Link
                                        key={idx}
                                        to={`/pelanggan/${customer.id}`}
                                        className="text-blue-600 hover:underline"
                                      >
                                        {customer.name}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <span className="w-20 font-medium">
                                    Nota Timbangan:
                                  </span>
                                  <span>
                                    {item.shipmentItems.every(
                                      (si) => si.status === "COMPLETED"
                                    ) &&
                                    item.weighings &&
                                    item.weighings.length > 0 &&
                                    item.weighings[0]?.notaTimbangan ? (
                                      <button
                                        type="button"
                                        className="text-blue-600 hover:underline"
                                        onClick={() =>
                                          handlePreviewNotaTimbangan({
                                            ticketNumber:
                                              item.weighings[0].notaTimbangan!
                                                .ticketNumber,
                                            documentPath:
                                              item.weighings[0].notaTimbangan!
                                                .documentPath,
                                          })
                                        }
                                      >
                                        Lihat Dokumen
                                      </button>
                                    ) : (
                                      <span className="text-gray-400">
                                        Belum tersedia
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>

                              {hasPengirimanUpdateAccess &&
                                item.deliveryOrders.length > 0 && (
                                  <div className="pt-3 mt-3 text-center border-t border-gray-100">
                                    <Link
                                      to={`/do/${item.deliveryOrders[0].id}`}
                                      className="w-full"
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                      >
                                        <FileText className="mr-2 w-4 h-4" />
                                        Detail DO
                                      </Button>
                                    </Link>
                                  </div>
                                )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "spmb" && (
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <FileText className="mr-2 w-5 h-5 text-blue-600" />
                  Surat Perintah Muat Barang (SPMB)
                </h3>

                {/* Tampilan desktop dengan table */}
                <div className="hidden sm:block">
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 border-b border-gray-200">
                            <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                              No
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                              Kode SPMB
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                              ID Delivery Order{" "}
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
                                    {spmb.deliveryOrder?.doNumber ||
                                      spmb.deliveryOrderId}
                                  </Link>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-gray-600">
                                  {formatDate(spmb.createdAt)}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                  {spmb.documentPath ? (
                                    <button
                                      type="button"
                                      className="text-blue-600 hover:underline"
                                      onClick={() => handlePreviewSpmb(spmb)}
                                    >
                                      Lihat Dokumen
                                    </button>
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
                </div>

                {/* Tampilan mobile dengan card */}
                <div className="sm:hidden">
                  <div className="space-y-3">
                    {!shipment.spmbs || shipment.spmbs.length === 0 ? (
                      <div className="p-4 text-center rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500">
                          Tidak ada SPMB dalam pengiriman ini
                        </p>
                      </div>
                    ) : (
                      shipment.spmbs.map((spmb, index) => (
                        <div
                          key={spmb.id}
                          className="p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <div className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                                {index + 1}
                              </div>
                              <span className="font-medium text-blue-600">
                                {spmb.code}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>
                              <span className="font-medium">
                                Delivery Order:{" "}
                              </span>
                              <Link
                                to={`/do/${spmb.deliveryOrderId}`}
                                className="text-blue-600 hover:underline"
                              >
                                {spmb.deliveryOrder?.doNumber ||
                                  spmb.deliveryOrderId}
                              </Link>
                            </p>
                            <p>
                              <span className="font-medium">
                                Tanggal Dibuat:{" "}
                              </span>
                              {formatDate(spmb.createdAt)}
                            </p>
                            <p className="pt-2">
                              <span className="font-medium">Dokumen: </span>
                              {spmb.documentPath ? (
                                <button
                                  type="button"
                                  className="text-blue-600 hover:underline"
                                  onClick={() => handlePreviewSpmb(spmb)}
                                >
                                  Lihat Dokumen
                                </button>
                              ) : (
                                <span className="text-gray-400">
                                  Tidak tersedia
                                </span>
                              )}
                            </p>
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

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        file={previewFile}
      />

      {/* Hidden file input for photo replacement */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="platePhotoInput"
      />

      {/* Product Detail Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-0 p-0 rounded-lg shadow-lg">
          <div className="p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Package className="mr-2 w-5 h-5 text-blue-600" />
                Detail Barang untuk Pengiriman
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Pilih Barang untuk dimuat dalam pengiriman
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {selectedProductDOs.length > 0 && (
                <>
                  <h3 className="mb-3 text-base font-medium text-gray-800">
                    Informasi Barang
                  </h3>
                  <div className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-base font-medium text-blue-800">
                      {selectedProductDOs[0].product.name}
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-gray-700">
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          Total Kuantitas
                        </p>
                        <p className="font-semibold text-gray-800">
                          {formatNumber(
                            selectedProductDOs.reduce(
                              (sum, item) => sum + item.product.quantity,
                              0
                            )
                          )}{" "}
                          {selectedProductDOs[0].product.satuan}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          Total Delivery Order
                        </p>
                        <div className="font-semibold text-gray-800">
                          <Badge
                            variant="outline"
                            className="font-medium text-blue-700 bg-blue-50 border-blue-200"
                          >
                            {selectedProductDOs.length} DO
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-3 text-base font-medium text-gray-800">
                    Delivery Orders Terkait
                  </h3>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {selectedProductDOs.map((doItem, index) => (
                      <div
                        key={doItem.doId}
                        className="p-4 bg-white rounded-lg border border-gray-200 transition-colors duration-200 hover:border-gray-300"
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center">
                              <span className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                                {index + 1}
                              </span>
                              <p className="text-sm font-medium text-gray-800">
                                <Link
                                  to={`/do/${doItem.doId}`}
                                  className="text-blue-600 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  DO #{index + 1}
                                </Link>
                              </p>
                            </div>
                            <p className="mt-1 ml-8 text-xs text-gray-500">
                              Pelanggan: {doItem.customer.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Kuantitas</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {formatNumber(doItem.product.quantity)}{" "}
                              {doItem.product.satuan}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseProductModal}
                  className="flex-1 text-gray-700 border-gray-300 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
                >
                  <X className="mr-2 w-4 h-4" />
                  Batal
                </Button>

                <Button
                  onClick={() => {
                    if (selectedProductId && selectedProductDOs.length > 0) {
                      // Tidak perlu try-catch di sini karena handleChooseProduct menggunakan
                      // useMutation yang menangani error melalui onError callback
                      handleChooseProduct(
                        selectedProductDOs[0].doId,
                        selectedProductId
                      );
                      // Modal akan ditutup di onSuccess atau onError callback pada chooseProduct
                    }
                  }}
                  disabled={chooseProduct.isPending}
                  className="flex-1 text-white bg-blue-600 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  {chooseProduct.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 w-4 h-4" />
                      Muat Barang
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weighing Modal */}
      <Dialog open={weighingModalOpen} onOpenChange={setWeighingModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-0 p-0 rounded-lg shadow-lg">
          <div className="p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Scale className="mr-2 w-5 h-5 text-blue-600" />
                Timbang Item Pengiriman
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Input data penimbangan untuk item terpilih
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Berat Kotor (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none  focus:border-blue-500"
                    placeholder="Masukkan berat kotor"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Berat Bersih (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan berat bersih (opsional)"
                    value={netWeight}
                    onChange={(e) => setNetWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Berat Tare (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan berat tare (opsional)"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseWeighingModal}
                  className="flex-1 text-gray-700 border-gray-300 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
                >
                  <X className="mr-2 w-4 h-4" />
                  Batal
                </Button>

                <Button
                  onClick={handleWeighSubmit}
                  disabled={bulkWeighItems.isPending}
                  className="flex-1 text-white bg-blue-600 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  {bulkWeighItems.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Scale className="mr-2 w-4 h-4" />
                      Simpan Penimbangan
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Change and DO Revision Modals */}
      {fullDeliveryOrder && (
        <>
          <ChangeCustomerModal
            isOpen={showChangeCustomerModal}
            onClose={handleCloseChangeCustomerModal}
            deliveryOrder={fullDeliveryOrder}
            onSuccess={() => {
              refetch();
              refetchChosenProducts();
            }}
          />
          <ReviseDOModal
            isOpen={showReviseModal}
            onClose={handleCloseReviseModal}
            deliveryOrder={fullDeliveryOrder}
            onSuccess={() => {
              refetch();
              refetchChosenProducts();
            }}
          />
        </>
      )}
    </div>
  );
}
