import { useUploadPlatePhoto, useVerifyPlateNumber } from "@/hooks/media";
import {
  useBulkWeighShipmentItems,
  useCancelItemReflectedToDO,
  useCancelItemShipmentOnly,
  useChooseProduct,
  useDeleteShipment,
  useIndividualWeighShipmentItem,
  useNotaTimbanganForProduct,
  useSelectiveChooseProduct,
  useShipment,
  useShipmentChosenProducts,
  useTransferItems,
  useUpdateTally,
  useUpdateWeighingMethod,
} from "@/hooks/shipment";
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
  Package,
  RefreshCw,
  Scale,
  ShoppingCart,
  Upload,
  User,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import { CancelItemModal } from "@/components/CancelItemModal";
import { ChangeCustomerModal } from "@/components/ChangeCustomerModal";
import { ErrorState } from "@/components/ErrorState";
import { IndividualWeighingModal } from "@/components/IndividualWeighingModal";
import { LoadingState } from "@/components/LoadingState";
import { ReviseDOModal } from "@/components/ReviseDOModal";
import { TruckWeighingModal } from "@/components/TruckWeighingModal";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useDeliveryOrder } from "@/hooks/do";
import { useRolePermissions } from "@/hooks/permission";
import { cn } from "@/lib/utils";
import { DeliveryOrder } from "@/types/do";
import { FilePreview } from "@/types/media";
import {
  ChosenProductExtended,
  DeliveryOrderForSelection,
  GroupedDeliveryOrder,
  IndividualWeighingItem,
  LoadingGroup,
  ProductItem,
  ShipmentItem,
  ShipmentStatus,
  SPMB,
  StatusBadgeProps,
  TransferItem,
} from "@/types/shipment";
import {
  SHIPMENT_STATUS_LABELS,
  SHIPMENT_TYPE_LABELS,
} from "@/utils/constants";
import { formatDate } from "@/utils/date";
import { FormErrorData } from "@/utils/errorHandler";
import {
  formatInputNumber,
  formatNumber,
  handleDecimalInput,
} from "@/utils/formatNumber";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { DeliveryOrderAccordion } from "@/components/DeliveryOrderAccordion";
import { DOSelectionModal } from "@/components/DOSelectionModal";
import { LoadingGroupSelectionModal } from "@/components/LoadingGroupSelectionModal";
import {
  LoadingMethod,
  LoadingMethodSelectionModal,
} from "@/components/LoadingMethodSelectionModal";
import { ManualTruckWeighModal } from "@/components/ManualTruckWeighModal";
import { ReduceQuantityModal } from "@/components/ReduceQuantityModal";
import { TransferItemsModal } from "@/components/TransferItemsModal";

// Tally form schema and types
interface TallyFormValues {
  tally: string;
}

const tallyFormSchema = Joi.object<TallyFormValues>({
  tally: Joi.string().required().min(1).max(255).messages({
    "string.empty": "Tally harus diisi",
    "string.min": "Tally minimal 1 karakter",
    "string.max": "Tally maksimal 255 karakter",
    "any.required": "Tally harus diisi",
  }),
});

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
      case "CANCEL":
        return "bg-red-100 text-red-800 border-red-200";
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
  const getTabFromUrl = (): "info" | "items" | "spmb" | "do" | "truck-weighing" => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "items" || tab === "spmb" || tab === "do" || tab === "truck-weighing") {
      return tab;
    }
    return "info";
  };

  const [activeTab, setActiveTab] = useState<"info" | "items" | "spmb" | "do" | "truck-weighing">(
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
  const [selectedWeighingMethod, setSelectedWeighingMethod] = useState<
    "MANUAL" | "VENDOR" | null
  >(null);
  const [weighingProductId, setWeighingProductId] = useState<string>("");
  const [weighingModalOpen, setWeighingModalOpen] = useState(false);

  // States for weighing DO selection
  const [weighingDOSelectionOpen, setWeighingDOSelectionOpen] = useState(false);
  const [selectedDOsForWeighing, setSelectedDOsForWeighing] = useState<
    string[]
  >([]);
  const [selectedLoadingGroupId, setSelectedLoadingGroupId] = useState<
    string | undefined
  >(undefined);

  // States for individual weighing modal
  const [individualWeighingModalOpen, setIndividualWeighingModalOpen] =
    useState(false);

  const [individualWeighingItems, setIndividualWeighingItems] = useState<
    IndividualWeighingItem[]
  >([]);
  const [currentWeighingIndex, setCurrentWeighingIndex] = useState(0);
  const [vendorWaitingModalOpen, setVendorWaitingModalOpen] = useState(false);
  const [selectedVendorProduct, _setSelectedVendorProduct] =
    useState<string>("");
  const [grossWeight, setGrossWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [tareWeight, setTareWeight] = useState("");

  // Formatted display states for weight inputs
  const [grossWeightDisplay, setGrossWeightDisplay] = useState("");
  const [netWeightDisplay, setNetWeightDisplay] = useState("");
  const [tareWeightDisplay, setTareWeightDisplay] = useState("");

  // States for nota timbangan modal
  const [currentNotaIndex, setCurrentNotaIndex] = useState(0);

  // State for truck weighing modal in "Tipe Penimbangan" section
  const [truckWeighingModalOpen, setTruckWeighingModalOpen] = useState(false);
  const [truckWeighingProduct, setTruckWeighingProduct] = useState<{
    productId: string;
    productName: string;
    productUnit: string;
    loadingGroupId: string;
  } | null>(null);

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

  // Permission check for transfer items - using specific TRANSFER_ITEMS permission
  const hasTransferItemsAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.TRANSFER_ITEMS
  );

  // Permission check for reduce quantity - using specific REDUCE_ITEMS permission
  const hasReduceQuantityAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.REDUCE_ITEMS
  );

  // Permission check for cancel items - using DELETE permission for shipment resource
  const hasCancelItemAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.CANCEL_ITEMS
  );

  // Permission check for manual truck weighing override
  const hasManualWeighingOverrideAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.MANUAL_WEIGHING_OVERRIDE
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
  const [tallyModalOpen, setTallyModalOpen] = useState(false);

  // Loading method selection modal states
  const [loadingMethodModalOpen, setLoadingMethodModalOpen] = useState(false);
  const [selectedProductForLoading, setSelectedProductForLoading] = useState<{
    id: string;
    name: string;
    satuan: string;
  } | null>(null);

  // DO Selection Modal states
  const [doSelectionModalOpen, setDoSelectionModalOpen] = useState(false);
  const [selectedProductForDOSelection, setSelectedProductForDOSelection] =
    useState<{
      id: string;
      name: string;
      satuan: string;
      deliveryOrders: DeliveryOrderForSelection[] | LoadingGroup[];
    } | null>(null);

  // Transfer Items Modal states
  const [transferItemsModalOpen, setTransferItemsModalOpen] = useState(false);
  const [selectedTransferItems, setSelectedTransferItems] = useState<
    TransferItem[]
  >([]);

  // Reduce Quantity Modal states
  const [reduceQuantityModalOpen, setReduceQuantityModalOpen] = useState(false);
  const [selectedReduceQuantityItem, setSelectedReduceQuantityItem] = useState<{
    shipmentItem: ShipmentItem;
    product: ProductItem;
    deliveryOrder: GroupedDeliveryOrder;
  } | null>(null);

  // Cancel Item Modal states
  const [cancelItemModalOpen, setCancelItemModalOpen] = useState(false);
  const [selectedCancelItem, setSelectedCancelItem] = useState<{
    shipmentItem: ShipmentItem;
    product: ProductItem;
    deliveryOrder: GroupedDeliveryOrder;
  } | null>(null);

  // Manual Truck Weighing Modal states
  const [manualWeighModalOpen, setManualWeighModalOpen] = useState(false);
  const [manualWeighType, setManualWeighType] = useState<'PRE' | 'POST'>('PRE');

  // Tally form - initialize without defaultValues first
  const tallyForm = useForm<TallyFormValues>({
    resolver: joiResolver(tallyFormSchema),
    defaultValues: {
      tally: "",
    },
  });

  // Update tally mutation
  const updateTally = useUpdateTally({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Tally berhasil diperbarui");
      setTallyModalOpen(false);
      tallyForm.reset();
      refetch(); // Refetch shipment data to get updated tally
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Memperbarui Tally",
        error.message || "Terjadi kesalahan saat memperbarui tally"
      );
    },
  });

  // Transfer items mutation
  const transferItems = useTransferItems({
    onSuccess: (response) => {
      if (response.data) {
        const summary = response.data.transferSummary;
        showSuccessAlert(
          "Transfer Berhasil!",
          `${summary.totalItemsTransferred} item berhasil ditransfer ke ${summary.targetCustomer}. DO baru: ${summary.newDoNumber}`
        );
      } else {
        showSuccessAlert(
          "Transfer Berhasil!",
          "Items berhasil ditransfer ke customer baru"
        );
      }
      handleCloseTransferItemsModal();
      refetch(); // Refetch shipment data to show updated quantities
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Transfer Items",
        error.message || "Terjadi kesalahan saat transfer items"
      );
    },
  });

  // Cancel item mutations
  const cancelItemReflected = useCancelItemReflectedToDO({
    onSuccess: () => {
      showSuccessAlert(
        "Item Dibatalkan!",
        "Item berhasil dibatalkan dan direfleksikan ke Delivery Order"
      );
      setCancelItemModalOpen(false);
      setSelectedCancelItem(null);
      refetch();
      refetchChosenProducts();
    },
    onError: (error) => {
      setCancelItemModalOpen(false);
      setSelectedCancelItem(null);
      showErrorAlert(
        "Gagal Membatalkan Item",
        error.message || "Terjadi kesalahan saat membatalkan item"
      );
    },
  });

  const cancelItemShipmentOnly = useCancelItemShipmentOnly({
    onSuccess: () => {
      showSuccessAlert(
        "Item Dibatalkan!",
        "Item berhasil dibatalkan dari pengiriman"
      );
      setCancelItemModalOpen(false);
      setSelectedCancelItem(null);
      refetch();
      refetchChosenProducts();
    },
    onError: (error) => {
      setCancelItemModalOpen(false);
      setSelectedCancelItem(null);
      showErrorAlert(
        "Gagal Membatalkan Item",
        error.message || "Terjadi kesalahan saat membatalkan item"
      );
    },
  });

  // Tally handlers
  const handleOpenTallyModal = () => {
    tallyForm.setValue("tally", shipment?.tally || "");
    setTallyModalOpen(true);
  };

  const handleTallySubmit = (data: TallyFormValues) => {
    if (shipmentId) {
      updateTally.mutate({
        id: shipmentId,
        tally: data.tally,
      });
    }
  };

  // Selective choose product mutation
  const selectiveChooseProduct = useSelectiveChooseProduct({
    onSuccess: () => {
      // Show success message
      showSuccessAlert("Sukses!", "Barang berhasil dimuat secara selektif");

      // Clear the selected data
      setSelectedProductId("");
      setSelectedProductDOs([]);
      setSelectedWeighingMethod(null);

      // Immediately refetch to ensure UI update
      refetch();
      refetchChosenProducts();

      // Additional refetch after a small delay to ensure data consistency
      setTimeout(() => {
        refetch();
        refetchChosenProducts();
      }, 500);

      // The shipment data will also be automatically refetched due to query invalidation
      // in the useSelectiveChooseProduct hook
    },
    onError: (error) => {
      showErrorAlert(
        "Error",
        error.message || "Terjadi kesalahan saat memuat barang selektif"
      );
    },
  });

  // Update weighing method mutation
  const updateWeighingMethod = useUpdateWeighingMethod({
    onSuccess: (response) => {
      const hasWeighings = response.data?.hasWeighings;
      if (hasWeighings) {
        showSuccessAlert(
          "Tipe Penimbangan Diubah",
          "Tipe penimbangan berhasil diubah. Data timbangan sebelumnya tetap tersimpan."
        );
      } else {
        showSuccessAlert("Berhasil", "Tipe penimbangan berhasil diubah");
      }
      refetch();
      refetchChosenProducts();
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Mengubah Tipe Penimbangan",
        error.message || "Terjadi kesalahan saat mengubah tipe penimbangan"
      );
    },
  });

  // Handler to toggle weighing method
  const handleToggleWeighingMethod = (
    productId: string,
    currentMethod: "MANUAL" | "VENDOR"
  ) => {
    if (!shipmentId) return;

    const newMethod = currentMethod === "MANUAL" ? "VENDOR" : "MANUAL";
    const methodLabel = newMethod === "MANUAL" ? "Manual" : "Vendor";

    showConfirmationAlert(
      "Ubah Tipe Penimbangan",
      `Apakah Anda yakin ingin mengubah tipe penimbangan menjadi "${methodLabel}"?`,
      "Ya, Ubah",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        updateWeighingMethod.mutate({
          shipmentId,
          productId,
          weighingMethod: newMethod,
        });
      }
    });
  };

  // Handler to open truck weighing modal for a product
  const handleOpenTruckWeighingModal = (productId: string) => {
    if (!shipment || !shipmentId) return;

    // Find the chosen product
    const chosenProduct = chosenProducts.find(
      (cp) => cp.productId === productId
    );
    if (!chosenProduct) return;

    // Find shipment items for this product that are in CHOSEN status (ready to weigh)
    const chosenItems = shipment.shipmentItems.filter(
      (item) =>
        item.productId === productId &&
        item.chosenProduct &&
        item.status === "CHOSEN"
    );

    if (chosenItems.length === 0) {
      showErrorAlert(
        "Tidak Ada Item",
        "Tidak ada item yang siap untuk ditimbang"
      );
      return;
    }

    // Get the first loading group ID (most common case is single group)
    const loadingGroupId = chosenItems[0].loadingGroupId || "";

    if (!loadingGroupId) {
      showErrorAlert(
        "Error",
        "Loading group ID tidak ditemukan untuk produk ini"
      );
      return;
    }

    setTruckWeighingProduct({
      productId,
      productName: chosenProduct.product.name,
      productUnit: chosenProduct.product.satuan,
      loadingGroupId,
    });
    setTruckWeighingModalOpen(true);
  };

  // Handler for truck weighing modal submission
  const handleTruckWeighingSubmit = async (data: {
    productId: string;
    grossWeight: number;
    netWeight: number;
    tareWeight: number;
  }) => {
    if (!shipmentId || !truckWeighingProduct) return;

    const currentMethod = getProductWeighingMethod(data.productId);

    // If method is not MANUAL, change it first
    if (currentMethod !== "MANUAL") {
      // First update the weighing method to MANUAL
      updateWeighingMethod.mutate(
        {
          shipmentId,
          productId: data.productId,
          weighingMethod: "MANUAL",
        },
        {
          onSuccess: () => {
            // After method is updated, submit the weighing
            submitWeighing(data);
          },
          onError: (error) => {
            showErrorAlert(
              "Gagal Mengubah Tipe Penimbangan",
              error.message || "Terjadi kesalahan"
            );
          },
        }
      );
    } else {
      // Method is already MANUAL, submit directly
      submitWeighing(data);
    }
  };

  // Helper to submit weighing data
  const submitWeighing = (data: {
    productId: string;
    grossWeight: number;
    netWeight: number;
    tareWeight: number;
  }) => {
    if (!shipmentId || !truckWeighingProduct) return;

    bulkWeighItems.mutate(
      {
        shipmentId,
        productId: data.productId,
        loadingGroupId: truckWeighingProduct.loadingGroupId,
        grossWeight: data.grossWeight,
        netWeight: data.netWeight,
        tareWeight: data.tareWeight,
      },
      {
        onSuccess: () => {
          showSuccessAlert(
            "Berhasil",
            "Penimbangan berhasil disimpan"
          );
          setTruckWeighingModalOpen(false);
          setTruckWeighingProduct(null);
          refetch();
          refetchChosenProducts();
        },
        onError: (error) => {
          showErrorAlert(
            "Gagal Menyimpan Penimbangan",
            error.message || "Terjadi kesalahan saat menyimpan penimbangan"
          );
        },
      }
    );
  };

  // Loading method selection handlers
  // This function checks if a product has multiple DOs in the shipment:
  // - If only 1 DO: directly opens product modal (ALL method)
  // - If multiple DOs: shows loading method selection modal
  const handleOpenLoadingMethodModal = (productId: string) => {
    if (!shipment) return;

    // Check how many unique DOs this product has in the shipment (exclude cancelled items)
    const uniqueDOs = new Set<string>();
    shipment.shipmentItems.forEach((item) => {
      if (
        item.productId === productId &&
        !item.chosenProduct &&
        item.status !== "CANCELLED"
      ) {
        uniqueDOs.add(item.deliveryOrderId);
      }
    });

    // If only one DO, directly use ALL method (original flow)
    if (uniqueDOs.size <= 1) {
      handleOpenProductModal(productId);
      return;
    }

    // If multiple DOs, show the loading method selection modal
    const productName =
      shipment.shipmentItems.find((item) => item.productId === productId)
        ?.product.name || "";
    const productUnit =
      shipment.shipmentItems.find((item) => item.productId === productId)
        ?.product.satuan || "";

    setSelectedProductForLoading({
      id: productId,
      name: productName,
      satuan: productUnit,
    });
    setLoadingMethodModalOpen(true);
  };

  const handleLoadingMethodSelect = (method: LoadingMethod) => {
    if (!selectedProductForLoading) return;

    setLoadingMethodModalOpen(false);

    if (method === "ALL") {
      // Use existing product modal for weighing method selection (original flow)
      handleOpenProductModal(selectedProductForLoading.id);
    } else if (method === "SELECTIVE") {
      // Open DO selection modal
      handleOpenDOSelectionModal(selectedProductForLoading.id);
    }

    setSelectedProductForLoading(null);
  };

  // DO Selection handlers
  const handleOpenDOSelectionModal = (productId: string) => {
    if (!shipment) return;

    // Extract delivery orders for this product
    const productName =
      shipment.shipmentItems.find((item) => item.productId === productId)
        ?.product.name || "";
    const productUnit =
      shipment.shipmentItems.find((item) => item.productId === productId)
        ?.product.satuan || "";

    // Group items by delivery order for this product (exclude cancelled items)
    const doMap = new Map<string, DeliveryOrderForSelection>();

    shipment.shipmentItems.forEach((item) => {
      if (
        item.productId === productId &&
        !item.chosenProduct &&
        item.status !== "CANCELLED"
      ) {
        const doId = item.deliveryOrderId;
        if (!doMap.has(doId)) {
          doMap.set(doId, {
            id: doId,
            doNumber: item.deliveryOrder.doNumber,
            customer: item.deliveryOrder.customer,
            items: [],
          });
        }

        doMap.get(doId)!.items.push({
          id: item.id,
          productId: item.productId,
          requestedQuantity: item.requestedQuantity,
          pendingQuantity: item.requestedQuantity, // Assuming pending = requested for non-chosen items
          status: item.status,
        });
      }
    });

    setSelectedProductForDOSelection({
      id: productId,
      name: productName,
      satuan: productUnit,
      deliveryOrders: Array.from(doMap.values()),
    });
    setDoSelectionModalOpen(true);
  };

  const handleDOSelectionConfirm = (selectedDOIds: string[]) => {
    if (!selectedProductForDOSelection) return;

    // Store the selected DOs and open the weighing method selection modal
    const selectedDOs = selectedDOIds
      .map((doId) => {
        const doInfo = (
          selectedProductForDOSelection.deliveryOrders as DeliveryOrderForSelection[]
        ).find((deliveryOrder) => deliveryOrder.id === doId);
        if (!doInfo) return null;

        return {
          doId: doInfo.id,
          customer: doInfo.customer,
          product: {
            id: selectedProductForDOSelection.id,
            name: selectedProductForDOSelection.name,
            quantity: doInfo.items
              .filter((item: { status: string }) => item.status !== "CANCELLED")
              .reduce(
                (
                  sum: number,
                  item: {
                    id: string;
                    productId: string;
                    requestedQuantity: number;
                    pendingQuantity: number;
                    status: string;
                  }
                ) => sum + item.requestedQuantity,
                0
              ),
            satuan: selectedProductForDOSelection.satuan,
          },
        };
      })
      .filter((item) => item !== null && item.product.quantity > 0) as {
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
    }[];

    setSelectedProductDOs(selectedDOs);

    setSelectedProductId(selectedProductForDOSelection.id);
    setProductModalOpen(true);
    setDoSelectionModalOpen(false);
    setSelectedProductForDOSelection(null);
  };

  const hasPengirimanUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasPengirimanUpdateTallyAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.UPDATE_TALLY
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

  const hasPengirimanUpdateWeighingMethodAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.UPDATE_WEIGHING_METHOD
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
      refetchOnMount: "always",
      staleTime: 0,
    }
  );

  const isKenekRequiredForLoading = shipment?.type === "ANTAR";
  const isLoadBlockedByCrew = Boolean(
    isKenekRequiredForLoading && !shipment?.kenek
  );
  const loadBlockedMessage = "Kenek harus diisi terlebih dahulu";

  // Fetch nota timbangan data when product is selected
  const { data: notaTimbanganData, refetch: refetchNotaTimbangan } =
    useNotaTimbanganForProduct(shipmentId!, selectedProductId!, {
      enabled: !!selectedProductId && selectedProductId !== "" && !!shipmentId,
      staleTime: 0,
    });

  // Get manual weighing products
  const {
    data: manualProducts = [] as ChosenProductExtended[],
    isLoading: isLoadingManualProducts,
    error: manualProductsError,
    isError: isManualProductsError,
    refetch: refetchManualProducts,
  } = useShipmentChosenProducts(shipmentId, "MANUAL", {
    enabled: !!shipmentId,
    refetchOnWindowFocus: false,
  });

  // Get vendor weighing products
  const {
    data: vendorProducts = [] as ChosenProductExtended[],
    isLoading: isLoadingVendorProducts,
    error: vendorProductsError,
    isError: isVendorProductsError,
    refetch: refetchVendorProducts,
  } = useShipmentChosenProducts(shipmentId, "VENDOR", {
    enabled: !!shipmentId,
    refetchOnWindowFocus: false,
  });

  // Combined for backward compatibility
  const chosenProductsRaw = [...manualProducts, ...vendorProducts];

  // Filter customers and location types to only show those from non-cancelled items
  const chosenProducts = chosenProductsRaw.map((product) => {
    if (!shipment) return product;

    // Get non-cancelled shipment items for this product
    const activeItems = shipment.shipmentItems.filter(
      (item) =>
        item.productId === product.productId &&
        item.chosenProduct &&
        item.status !== "CANCELLED"
    );

    // Extract unique customers from active items
    const activeCustomers = Array.from(
      new Map(
        activeItems.map((item) => [
          item.deliveryOrder.customer.id,
          item.deliveryOrder.customer,
        ])
      ).values()
    );

    // Extract unique location types from active items
    const activeLocationTypes = Array.from(
      new Set(
        activeItems.map((item) => item.locationType).filter(Boolean) // Remove null/undefined values
      )
    );

    // Return product with filtered customers and location types
    return {
      ...product,
      customers: activeCustomers,
      locationType: activeLocationTypes.join(", "), // Join location types like backend does
    };
  });

  const isLoadingChosenProducts =
    isLoadingManualProducts || isLoadingVendorProducts;
  const isChosenProductsError = isManualProductsError || isVendorProductsError;
  const chosenProductsError = manualProductsError || vendorProductsError;
  const refetchChosenProducts = useCallback(() => {
    refetchManualProducts();
    refetchVendorProducts();
  }, [refetchManualProducts, refetchVendorProducts]);

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
      handleCloseWeighingModal(); // Use proper close handler
      refetch();
      refetchChosenProducts();
      // Ensure Nota Timbangan list refreshes for currently selected product
      if (selectedProductId) {
        refetchNotaTimbangan();
      }
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

  const individualWeighItem = useIndividualWeighShipmentItem({
    onSuccess: () => {
      showSuccessAlert("Berhasil", "Item berhasil ditimbang");

      // Refetch data to get updated status
      refetch();
      refetchChosenProducts();

      // Remove the weighed item from the current list and update modal
      const currentItemId =
        individualWeighingItems[currentWeighingIndex]?.shipmentItemId;
      const remainingItems = individualWeighingItems.filter(
        (item) => item.shipmentItemId !== currentItemId
      );

      if (remainingItems.length > 0) {
        // Still have items to weigh, update the list and continue
        setIndividualWeighingItems(remainingItems);
        // Reset to first item if current index is now out of bounds
        if (currentWeighingIndex >= remainingItems.length) {
          setCurrentWeighingIndex(0);
        }
        // Keep modal open
      } else {
        // All items weighed, close modal
        handleCloseIndividualWeighingModal();
      }

      // Ensure Nota Timbangan list refreshes for currently selected product
      if (selectedProductId) {
        refetchNotaTimbangan();
      }
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

  const handleChooseProduct = (
    deliveryOrderId: string,
    productId: string,
    weighingMethod: "MANUAL" | "VENDOR"
  ) => {
    chooseProduct.mutate({
      shipmentId,
      deliveryOrderId,
      productId,
      weighingMethod,
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

  // Transfer Items handlers
  const handleTransferItemSelect = (item: TransferItem, checked: boolean) => {
    if (checked) {
      // Add item to selection
      setSelectedTransferItems((prev) => [...prev, item]);
    } else {
      // Remove item from selection
      setSelectedTransferItems((prev) =>
        prev.filter(
          (selected) =>
            !(
              selected.deliveryOrderId === item.deliveryOrderId &&
              selected.productId === item.productId
            )
        )
      );
    }
  };

  const handleOpenTransferItemsModal = () => {
    setTransferItemsModalOpen(true);
  };

  const handleCloseTransferItemsModal = () => {
    setTransferItemsModalOpen(false);
    setSelectedTransferItems([]); // Clear selection when closing
  };

  const handleOpenReduceQuantityModal = (
    shipmentItem: ShipmentItem,
    product: ProductItem,
    deliveryOrder: GroupedDeliveryOrder
  ) => {
    setSelectedReduceQuantityItem({ shipmentItem, product, deliveryOrder });
    setReduceQuantityModalOpen(true);
  };

  const handleCloseReduceQuantityModal = () => {
    setReduceQuantityModalOpen(false);
    setSelectedReduceQuantityItem(null);
  };

  // Cancel item handlers
  const handleOpenCancelItemModal = (
    shipmentItem: ShipmentItem,
    product: ProductItem,
    deliveryOrder: GroupedDeliveryOrder
  ) => {
    setSelectedCancelItem({ shipmentItem, product, deliveryOrder });
    setCancelItemModalOpen(true);
  };

  const handleCloseCancelItemModal = () => {
    setCancelItemModalOpen(false);
    setSelectedCancelItem(null);
  };

  const handleCancelItemConfirm = (mode: "reflected" | "shipment-only") => {
    if (!selectedCancelItem) return;

    const shipmentItemId = selectedCancelItem.shipmentItem.id;

    if (mode === "reflected") {
      cancelItemReflected.mutate(shipmentItemId);
    } else {
      cancelItemShipmentOnly.mutate(shipmentItemId);
    }
  };

  const handleTransferSubmit = (
    targetCustomerId: string,
    items: TransferItem[]
  ) => {
    if (!shipment) return;

    const transferData = {
      targetCustomerId,
      sourceShipmentId: shipment.id,
      transferItems: items.map((item) => ({
        deliveryOrderId: item.deliveryOrderId,
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    transferItems.mutate(transferData);
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

  const handleTabChange = (tab: "info" | "items" | "spmb" | "do" | "truck-weighing") => {
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

    // Collect only UNCHOSEN DOs containing this product (exclude cancelled items)
    shipment.shipmentItems.forEach((item) => {
      if (
        item.productId === productId &&
        !item.chosenProduct &&
        item.status !== "CANCELLED"
      ) {
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

    // Check if this product has already been chosen with a specific weighing method
    const existingWeighingMethod = getProductWeighingMethod(productId);
    console.log(
      "Existing weighing method for product:",
      productId,
      "is:",
      existingWeighingMethod
    );
    setSelectedWeighingMethod(existingWeighingMethod);

    setSelectedProductId(productId);
    setSelectedProductDOs(productDOs);
    setProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setProductModalOpen(false);
    setSelectedProductId("");
    setSelectedProductDOs([]);
    setSelectedWeighingMethod(null); // Reset to no selection
  };

  // Open loading group selection for weighing
  const handleOpenWeighingDOSelection = (productId: string) => {
    if (!shipment || !chosenProducts) {
      console.log("Missing shipment or chosenProducts data");
      return;
    }

    const chosenProduct = chosenProducts.find(
      (cp) => cp.productId === productId
    );
    if (!chosenProduct) {
      console.log("Product not found in chosenProducts");
      return;
    }

    // Group items by loadingGroupId
    // Only include items that have unweighed items (status !== "COMPLETED" and status !== "CANCELLED")
    const loadingGroups = new Map();

    shipment.shipmentItems
      .filter(
        (item) =>
          item.productId === productId &&
          item.chosenProduct &&
          item.status !== "COMPLETED" &&
          item.status !== "CANCELLED" // Exclude cancelled shipment items
      )
      .forEach((item) => {
        const groupId = item.loadingGroupId || "unknown";

        if (!loadingGroups.has(groupId)) {
          loadingGroups.set(groupId, {
            id: groupId,
            doNumbers: [],
            deliveryOrderIds: [],
            customers: new Set(),
            items: [],
          });
        }

        const group = loadingGroups.get(groupId);

        // Add DO number if not already added
        if (!group.deliveryOrderIds.includes(item.deliveryOrderId)) {
          group.doNumbers.push(item.deliveryOrder.doNumber);
          group.deliveryOrderIds.push(item.deliveryOrderId);
          group.customers.add(item.deliveryOrder.customer.name);
        }

        // Add the item to the group's items array
        group.items.push({
          id: item.id,
          productId: item.productId,
          requestedQuantity: item.requestedQuantity,
          pendingQuantity: item.requestedQuantity,
          status: item.status,
        });
      });

    const loadingGroupsArray = Array.from(loadingGroups.values()).map(
      (group) => ({
        ...group,
        customers: Array.from(group.customers),
      })
    );

    setSelectedProductForDOSelection({
      id: productId,
      name: chosenProduct.product.name,
      satuan: chosenProduct.product.satuan,
      deliveryOrders: loadingGroupsArray,
    });
    setWeighingDOSelectionOpen(true);
  };

  // Handle loading group selection confirmation for weighing - goes directly to bulk weighing
  const handleWeighingDOSelectionConfirm = (loadingGroupId: string) => {
    if (!selectedProductForDOSelection) {
      return;
    }

    // Store selected loading group ID
    setSelectedLoadingGroupId(loadingGroupId);

    // Close DO selection modal and open bulk weighing modal directly
    setWeighingDOSelectionOpen(false);
    setWeighingProductId(selectedProductForDOSelection.id);
    setWeighingModalOpen(true);
  };

  const handleIndividualWeighItem = (data: {
    shipmentItemId: string;
    grossWeight: number;
    netWeight?: number;
    tareWeight?: number;
  }) => {
    if (shipmentId) {
      individualWeighItem.mutate({
        ...data,
        shipmentId: shipmentId,
      });
    }
  };

  const handleCloseWeighingModal = () => {
    setWeighingModalOpen(false);
    setWeighingProductId("");
    setSelectedDOsForWeighing([]); // Clear selected DOs (kept for backward compat)
    setSelectedLoadingGroupId(undefined); // Clear selected loading group
    // Reset weight values and displays when closing modal
    setGrossWeight("");
    setNetWeight("");
    setTareWeight("");
    setGrossWeightDisplay("");
    setNetWeightDisplay("");
    setTareWeightDisplay("");
  };

  const handleCloseIndividualWeighingModal = () => {
    setIndividualWeighingModalOpen(false);
    setCurrentWeighingIndex(0);
    setIndividualWeighingItems([]);
  };

  // Handler functions for formatted weight inputs with handleDecimalInput
  const handleGrossWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const result = handleDecimalInput(inputValue);

    if (result.numericValue !== undefined) {
      setGrossWeight(result.numericValue.toString());
      setGrossWeightDisplay(result.displayValue);
    } else {
      setGrossWeight("");
      setGrossWeightDisplay(inputValue);
    }
  };

  const handleTareWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const result = handleDecimalInput(inputValue);

    if (result.numericValue !== undefined) {
      setTareWeight(result.numericValue.toString());
      setTareWeightDisplay(result.displayValue);
    } else {
      setTareWeight("");
      setTareWeightDisplay(inputValue);
    }
  };

  // Auto-calculate net weight when gross or tare changes
  useEffect(() => {
    const grossNum = parseFloat(grossWeight);
    const tareNum = parseFloat(tareWeight);

    if (!isNaN(grossNum) && !isNaN(tareNum)) {
      const netValue = grossNum - tareNum;
      if (netValue >= 0) {
        setNetWeight(netValue.toString());
        setNetWeightDisplay(formatInputNumber(netValue));
      } else {
        setNetWeight("0");
        setNetWeightDisplay("0");
      }
    } else if (!isNaN(grossNum) && (tareWeight === "" || isNaN(tareNum))) {
      // If only gross is entered (no tare), net = gross
      setNetWeight(grossWeight);
      setNetWeightDisplay(grossWeightDisplay);
    } else {
      // Clear net weight if insufficient data
      setNetWeight("");
      setNetWeightDisplay("");
    }
  }, [grossWeight, tareWeight, grossWeightDisplay]);

  // Helper function to get weighing method for a product
  // Note: With selective loading, the weighing method is determined when the product is chosen
  // This function looks up the weighing method from the chosenProducts list
  const getProductWeighingMethod = (
    productId: string
  ): "MANUAL" | "VENDOR" | null => {
    const chosenProduct = chosenProducts.find(
      (cp) => cp.productId === productId
    );
    const result = chosenProduct?.weighingMethod || null;

    return result;
  };

  const handleWeighSubmit = () => {
    if (!shipmentId || !weighingProductId) return;

    setWeighingModalOpen(false);

    // Validate required fields (gross and tare)
    if (!grossWeight || parseFloat(grossWeight) <= 0) {
      showErrorAlert("Error", "Berat kotor harus diisi dan lebih dari 0");
      return;
    }
    if (!tareWeight || parseFloat(tareWeight) < 0) {
      showErrorAlert("Error", "Berat tare harus diisi dan tidak boleh negatif");
      return;
    }

    showConfirmationAlert(
      "Konfirmasi Penimbangan",
      "Apakah Anda yakin ingin menyimpan hasil penimbangan untuk produk ini?"
    ).then((result) => {
      if (isConfirmed(result)) {
        if (!selectedLoadingGroupId) {
          console.error("Loading group ID is required for weighing");
          return;
        }

        bulkWeighItems.mutate({
          shipmentId,
          productId: weighingProductId,
          loadingGroupId: selectedLoadingGroupId,
          grossWeight: parseFloat(grossWeight),
          netWeight: netWeight ? parseFloat(netWeight) : undefined,
          tareWeight: parseFloat(tareWeight),
        });
      } else {
        // If user cancels, reopen the modal
        setWeighingModalOpen(true);
      }
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
      // Check if all non-cancelled items are completed
      const activeItems = shipment.shipmentItems.filter(
        (item) => item.status !== "CANCELLED"
      );
      const allCompleted =
        activeItems.length > 0 &&
        activeItems.every((item) => item.status === "COMPLETED");
      setAllItemsCompleted(allCompleted);
    }
  }, [shipment]);

  // Update tally form when shipment data changes
  useEffect(() => {
    if (shipment) {
      tallyForm.setValue("tally", shipment.tally || "");
    }
  }, [shipment, tallyForm]);

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

  // Handler for multiple Nota Timbangan preview:
  const handleOpenNotaTimbanganModal = (item: ChosenProductExtended) => {
    setSelectedProductId(item.productId);
    setCurrentNotaIndex(0);
    const firstNota = item.weighings.find(
      (w) => w.notaTimbangan
    )?.notaTimbangan;
    if (firstNota) {
      handlePreviewNotaTimbangan({
        ticketNumber: firstNota.ticketNumber,
        documentPath: firstNota.documentPath,
      });
    }
  };

  // Handler to navigate between nota timbangan documents
  const handleNextNota = () => {
    if (
      notaTimbanganData &&
      currentNotaIndex < notaTimbanganData.notaTimbanganList.length - 1
    ) {
      const newIndex = currentNotaIndex + 1;
      setCurrentNotaIndex(newIndex);
      const currentNota = notaTimbanganData.notaTimbanganList[newIndex];
      handlePreviewNotaTimbangan({
        ticketNumber: currentNota.ticketNumber,
        documentPath: currentNota.documentPath,
      });
    }
  };

  const handlePrevNota = () => {
    if (currentNotaIndex > 0) {
      const newIndex = currentNotaIndex - 1;
      setCurrentNotaIndex(newIndex);
      const currentNota = notaTimbanganData?.notaTimbanganList[newIndex];
      handlePreviewNotaTimbangan({
        ticketNumber: currentNota?.ticketNumber || "",
        documentPath: currentNota?.documentPath || "",
      });
    }
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
                  activeTab === "truck-weighing"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleTabChange("truck-weighing")}
              >
                <Scale className="flex-shrink-0 mr-2 w-4 h-4" />
                Timbang Truk
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
                <span className="hidden sm:inline">
                  Delivery Orders & Barang
                </span>
                <span className="sm:hidden">DO & Barang</span>
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
                {(() => {
                  // Count only products with active (non-cancelled) items
                  const activeProductsCount = chosenProducts?.filter((item) => {
                    const activeItems = item.shipmentItems.filter(
                      (si) => si.status !== "CANCELLED"
                    );
                    return activeItems.length > 0;
                  }).length || 0;

                  return activeProductsCount > 0 ? (
                    <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {activeProductsCount}
                    </span>
                  ) : null;
                })()}
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
                              <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center">
                                <div className="flex items-center">
                                  {shipment.isVerified ? (
                                    <div className="flex items-center px-3 py-1.5 bg-green-100 rounded-full border border-green-200">
                                      <CheckCircle className="mr-2 w-4 h-4 text-green-600 flex-shrink-0" />
                                      <span className="text-sm font-medium text-green-700 whitespace-nowrap">
                                        Terverifikasi
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center px-3 py-1.5 bg-orange-100 rounded-full border border-orange-200">
                                      <span className="text-sm font-medium text-orange-700 whitespace-nowrap">
                                        Belum diverifikasi
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {hasPengirimanVerifyPlateAccess &&
                                  !shipment.isVerified && (
                                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleVerifyPlateNumber}
                                        disabled={verifyPlateNumber.isPending}
                                        className="text-blue-600 border-blue-200 transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 whitespace-nowrap"
                                      >
                                        {verifyPlateNumber.isPending ? (
                                          <Loader2 className="mr-2 w-4 h-4 animate-spin flex-shrink-0" />
                                        ) : (
                                          <CheckCircle className="mr-2 w-4 h-4 flex-shrink-0" />
                                        )}
                                        Verifikasi
                                      </Button>
                                    </div>
                                  )}
                              </div>

                              {/* Tombol Aksi Foto */}
                              {hasPengirimanVerifyPlateAccess &&
                                allItemsCompleted &&
                                shipment.postWeighingWeight &&
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
                            {allItemsCompleted &&
                            shipment?.postWeighingWeight &&
                            hasPengirimanVerifyPlateAccess ? (
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
                          {shipment.shipmentNumber} (
                          {shipment.type === "ANTAR"
                            ? shipment.armada?.plateNumber
                            : shipment.plateNumber}
                          )
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
                        shipment.status !== "CANCEL" &&
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
                        shipment.status !== "CANCEL" &&
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
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="flex items-center text-lg font-medium text-gray-900">
                      <ShoppingCart className="mr-2 w-5 h-5 text-blue-600" />
                      <span className="hidden sm:inline">
                        Delivery Orders & Barang
                      </span>
                      <span className="sm:hidden">DO & Barang</span>
                    </h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {hasPengirimanUpdateTallyAccess && shipment && (
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          shipment.tally
                            ? "w-full sm:w-auto text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 text-xs sm:text-sm"
                            : "w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm"
                        }
                        onClick={handleOpenTallyModal}
                      >
                        <User className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="truncate">
                          {shipment.tally ? shipment.tally : "Tambah Tally"}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
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
                            Tipe Penimbangan
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

                          // Don't filter by CANCELLED here - show all items in the table
                          shipment.shipmentItems.forEach((item) => {
                            const productId = item.productId;
                            const isCancelled = item.status === "CANCELLED";

                            if (!productMap.has(productId)) {
                              productMap.set(productId, {
                                id: productId,
                                name: item.product.name,
                                satuan: item.product.satuan,
                                warehouseId: item.warehouseId,
                                warehouse: item.warehouse,
                                doIds: new Set([item.deliveryOrderId]),
                                totalQuantity: isCancelled
                                  ? 0
                                  : item.requestedQuantity,
                                isChosen: item.chosenProduct || false,
                                hasPendingItems:
                                  !isCancelled && !item.chosenProduct,
                              } as {
                                id: string;
                                name: string;
                                satuan: string;
                                warehouseId: string;
                                warehouse: { id: string; name: string };
                                doIds: Set<string>;
                                totalQuantity: number;
                                isChosen: boolean;
                                hasPendingItems: boolean;
                              });
                            } else {
                              const product = productMap.get(productId)! as {
                                id: string;
                                name: string;
                                satuan: string;
                                warehouseId: string;
                                warehouse: { id: string; name: string };
                                doIds: Set<string>;
                                totalQuantity: number;
                                isChosen: boolean;
                                hasPendingItems: boolean;
                              };
                              product.doIds.add(item.deliveryOrderId);
                              // Only add to total if not cancelled
                              if (!isCancelled) {
                                product.totalQuantity += item.requestedQuantity;
                              }
                              if (item.chosenProduct) {
                                product.isChosen = true;
                              }
                              // Track if there are any pending items for this product (excluding cancelled items)
                              if (!isCancelled && !item.chosenProduct) {
                                product.hasPendingItems = true;
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
                                  {formatInputNumber(product.totalQuantity)}{" "}
                                  {product.satuan}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                  {(() => {
                                    const allCancelled = shipment.shipmentItems
                                      .filter(
                                        (si) => si.productId === product.id
                                      )
                                      .every((si) => si.status === "CANCELLED");

                                    if (allCancelled) {
                                      return (
                                        <Badge
                                          variant="outline"
                                          className="text-red-700 bg-red-50 border-red-200 whitespace-nowrap text-center"
                                        >
                                          Dibatalkan
                                        </Badge>
                                      );
                                    }

                                    const chosenCount =
                                      shipment.shipmentItems.filter(
                                        (si) =>
                                          si.productId === product.id &&
                                          si.chosenProduct &&
                                          si.status !== "CANCELLED"
                                      ).length;
                                    const totalCount =
                                      shipment.shipmentItems.filter(
                                        (si) =>
                                          si.productId === product.id &&
                                          si.status !== "CANCELLED"
                                      ).length;

                                    if (chosenCount === 0) {
                                      return (
                                        <Badge
                                          variant="outline"
                                          className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap text-center"
                                        >
                                          Belum Dimuat
                                        </Badge>
                                      );
                                    } else if (chosenCount === totalCount) {
                                      return (
                                        <Badge
                                          variant="outline"
                                          className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap text-center"
                                        >
                                          Sudah Dimuat
                                        </Badge>
                                      );
                                    } else {
                                      return (
                                        <div className="space-y-1">
                                          <Badge
                                            variant="outline"
                                            className="text-blue-700 bg-blue-50 border-blue-200 whitespace-nowrap text-center"
                                          >
                                            Sebagian Dimuat
                                          </Badge>
                                          <p className="text-xs text-gray-500">
                                            {chosenCount}/{totalCount} item
                                          </p>
                                        </div>
                                      );
                                    }
                                  })()}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                  {(() => {
                                    const weighingMethod =
                                      getProductWeighingMethod(product.id);
                                    const chosenItems =
                                      shipment.shipmentItems.filter(
                                        (si) =>
                                          si.productId === product.id &&
                                          si.chosenProduct &&
                                          si.status !== "CANCELLED"
                                      );
                                    const chosenCount = chosenItems.length;
                                    const hasWeighedItems = chosenItems.some(
                                      (si) => si.status === "COMPLETED"
                                    );

                                    if (chosenCount === 0) {
                                      return (
                                        <span className="text-gray-400">-</span>
                                      );
                                    }

                                    return (
                                      <div className="flex flex-col items-center gap-1">
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "whitespace-nowrap",
                                            weighingMethod === "MANUAL"
                                              ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                                              : "text-orange-700 bg-orange-50 border-orange-200"
                                          )}
                                        >
                                          {weighingMethod === "MANUAL"
                                            ? "Manual"
                                            : "Vendor"}
                                        </Badge>
                                        {hasPengirimanUpdateWeighingMethodAccess &&
                                          weighingMethod &&
                                          !hasWeighedItems && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                                              onClick={() =>
                                                handleToggleWeighingMethod(
                                                  product.id,
                                                  weighingMethod
                                                )
                                              }
                                              disabled={
                                                updateWeighingMethod.isPending
                                              }
                                            >
                                              <RefreshCw className="w-3 h-3 mr-1" />
                                              Ubah
                                            </Button>
                                          )}
                                      </div>
                                    );
                                  })()}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                  <div className="flex justify-center space-x-2">
                                    {(() => {
                                      // Check if all items for this product are cancelled
                                      const allCancelled =
                                        shipment.shipmentItems
                                          .filter(
                                            (si) => si.productId === product.id
                                          )
                                          .every(
                                            (si) => si.status === "CANCELLED"
                                          );

                                      // If all items are cancelled, don't show any buttons
                                      if (allCancelled) {
                                        return null;
                                      }

                                      const chosenCount =
                                        shipment.shipmentItems.filter(
                                          (si) =>
                                            si.productId === product.id &&
                                            si.chosenProduct &&
                                            si.status !== "CANCELLED"
                                        ).length;
                                      const totalCount =
                                        shipment.shipmentItems.filter(
                                          (si) =>
                                            si.productId === product.id &&
                                            si.status !== "CANCELLED"
                                        ).length;
                                      const allWeighed = shipment.shipmentItems
                                        .filter(
                                          (si) =>
                                            si.productId === product.id &&
                                            si.chosenProduct &&
                                            si.status !== "CANCELLED"
                                        )
                                        .every(
                                          (si) => si.status === "COMPLETED"
                                        );

                                      const weighingMethod =
                                        getProductWeighingMethod(product.id);

                                      // If no items chosen yet
                                      if (chosenCount === 0) {
                                        return hasPengirimanUpdateAccess ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className={
                                              isLoadBlockedByCrew
                                                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                                : "text-blue-600 border-blue-200 hover:bg-blue-50"
                                            }
                                            onClick={() =>
                                              handleOpenLoadingMethodModal(
                                                product.id
                                              )
                                            }
                                            disabled={
                                              chooseProduct.isPending ||
                                              selectiveChooseProduct.isPending ||
                                              isLoadBlockedByCrew
                                            }
                                            title={
                                              isLoadBlockedByCrew
                                                ? loadBlockedMessage
                                                : undefined
                                            }
                                          >
                                            <Package className="mr-2 w-4 h-4" />
                                            Muat Barang
                                          </Button>
                                        ) : null;
                                      }

                                      // If all items chosen
                                      if (chosenCount === totalCount) {
                                        // All chosen, check if all weighed
                                        if (allWeighed) {
                                          return (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-green-600 bg-green-50 border-green-200 cursor-not-allowed"
                                              disabled
                                            >
                                              <Check className="mr-2 w-4 h-4" />
                                              Sudah Ditimbang
                                            </Button>
                                          );
                                        } else if (
                                          weighingMethod === "MANUAL" &&
                                          hasPengirimanWeighAccess
                                        ) {
                                          return (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                              onClick={() =>
                                                handleOpenWeighingDOSelection(
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
                                          );
                                        } else if (
                                          weighingMethod === "VENDOR"
                                        ) {
                                          return (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-purple-600 border-purple-200 bg-purple-50 cursor-not-allowed"
                                              disabled={true}
                                            >
                                              <Scale className="mr-2 w-4 h-4" />
                                              Sedang Dimuat
                                            </Button>
                                          );
                                        } else {
                                          return (
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-green-600 border-green-200 hover:bg-green-50"
                                              disabled={true}
                                            >
                                              <Check className="mr-2 w-4 h-4" />
                                              Semua Dimuat
                                            </Button>
                                          );
                                        }
                                      }

                                      // Partial chosen - show load remaining button
                                      const buttons = [];
                                      if (hasPengirimanUpdateAccess) {
                                        buttons.push(
                                          <Button
                                            key="muat-sisa"
                                            variant="outline"
                                            size="sm"
                                            className={
                                              isLoadBlockedByCrew
                                                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                                                : "text-blue-600 border-blue-200 hover:bg-blue-50"
                                            }
                                            onClick={() =>
                                              handleOpenLoadingMethodModal(
                                                product.id
                                              )
                                            }
                                            disabled={
                                              chooseProduct.isPending ||
                                              selectiveChooseProduct.isPending ||
                                              isLoadBlockedByCrew
                                            }
                                            title={
                                              isLoadBlockedByCrew
                                                ? loadBlockedMessage
                                                : "Muat sisa barang"
                                            }
                                          >
                                            <Package className="mr-2 w-4 h-4" />
                                            Muat Sisa (
                                            {totalCount - chosenCount})
                                          </Button>
                                        );
                                      }

                                      if (
                                        weighingMethod === "MANUAL" &&
                                        hasPengirimanWeighAccess &&
                                        chosenCount > 0
                                      ) {
                                        const chosenItems =
                                          shipment.shipmentItems.filter(
                                            (si) =>
                                              si.productId === product.id &&
                                              si.chosenProduct &&
                                              si.status !== "CANCELLED"
                                          );
                                        const unweighedCount =
                                          chosenItems.filter(
                                            (si) => si.status !== "COMPLETED"
                                          ).length;

                                        if (unweighedCount > 0) {
                                          buttons.push(
                                            <Button
                                              key="timbang"
                                              variant="outline"
                                              size="sm"
                                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                              onClick={() =>
                                                handleOpenWeighingDOSelection(
                                                  product.id
                                                )
                                              }
                                              disabled={
                                                bulkWeighItems.isPending
                                              }
                                            >
                                              <Scale className="mr-2 w-4 h-4" />
                                              Timbang ({unweighedCount})
                                            </Button>
                                          );
                                        }
                                      } else if (
                                        weighingMethod === "VENDOR" &&
                                        chosenCount > 0
                                      ) {
                                        const chosenItems =
                                          shipment.shipmentItems.filter(
                                            (si) =>
                                              si.productId === product.id &&
                                              si.chosenProduct &&
                                              si.status !== "CANCELLED"
                                          );
                                        const unweighedCount =
                                          chosenItems.filter(
                                            (si) => si.status !== "COMPLETED"
                                          ).length;

                                        if (unweighedCount > 0) {
                                          buttons.push(
                                            <Button
                                              key="sedang-dimuat"
                                              variant="outline"
                                              size="sm"
                                              className="text-purple-600 border-purple-200 bg-purple-50 cursor-not-allowed"
                                              disabled={true}
                                            >
                                              <Scale className="mr-2 w-4 h-4" />
                                              Sedang Dimuat ({unweighedCount})
                                            </Button>
                                          );
                                        }
                                      }

                                      return buttons.length > 0
                                        ? buttons
                                        : null;
                                    })()}
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
                          chosenCount: number;
                          totalCount: number;
                          hasPendingItems: boolean;
                        }
                      >();

                      shipment.shipmentItems.forEach((item) => {
                        const productId = item.productId;
                        // Track all items for display, but don't count CANCELLED items for status/actions
                        const isCancelled = item.status === "CANCELLED";

                        if (!productMap.has(productId)) {
                          productMap.set(productId, {
                            id: productId,
                            name: item.product.name,
                            satuan: item.product.satuan,
                            warehouseId: item.warehouseId,
                            warehouse: item.warehouse,
                            doIds: new Set([item.deliveryOrderId]),
                            totalQuantity: isCancelled
                              ? 0
                              : item.requestedQuantity,
                            chosenCount:
                              !isCancelled && item.chosenProduct ? 1 : 0,
                            totalCount: !isCancelled ? 1 : 0,
                            hasPendingItems:
                              !isCancelled && !item.chosenProduct,
                          });
                        } else {
                          const product = productMap.get(productId)!;
                          product.doIds.add(item.deliveryOrderId);
                          // Only add to total if not cancelled
                          if (!isCancelled) {
                            product.totalQuantity += item.requestedQuantity;
                          }
                          if (!isCancelled) {
                            product.totalCount += 1;
                            if (item.chosenProduct) {
                              product.chosenCount += 1;
                            } else {
                              product.hasPendingItems = true;
                            }
                          }
                        }
                      });

                      return Array.from(productMap.values()).map((product) => (
                        <div
                          key={product.id}
                          className="p-4 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              {/* <div className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                                    {index + 1}
                                  </div> */}
                              <Link
                                to={`/barang/${product.id}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {product.name}
                              </Link>
                            </div>
                            {(() => {
                              // Check if all items for this product are cancelled
                              const allCancelled = shipment.shipmentItems
                                .filter((si) => si.productId === product.id)
                                .every((si) => si.status === "CANCELLED");

                              if (allCancelled) {
                                return (
                                  <Badge
                                    variant="outline"
                                    className="text-red-700 bg-red-50 border-red-200 whitespace-nowrap text-center"
                                  >
                                    Dibatalkan
                                  </Badge>
                                );
                              }

                              if (product.chosenCount === 0) {
                                return (
                                  <Badge
                                    variant="outline"
                                    className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap text-center"
                                  >
                                    Belum Dimuat
                                  </Badge>
                                );
                              } else if (
                                product.chosenCount === product.totalCount
                              ) {
                                return (
                                  <Badge
                                    variant="outline"
                                    className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap text-center"
                                  >
                                    Sudah Dimuat
                                  </Badge>
                                );
                              } else {
                                return (
                                  <div className="flex flex-col items-end space-y-1">
                                    <Badge
                                      variant="outline"
                                      className="text-blue-700 bg-blue-50 border-blue-200 whitespace-nowrap"
                                    >
                                      Sebagian Dimuat
                                    </Badge>
                                    <p className="text-xs text-gray-500">
                                      {product.chosenCount}/{product.totalCount}{" "}
                                      item
                                    </p>
                                  </div>
                                );
                              }
                            })()}
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
                              {formatInputNumber(product.totalQuantity)}{" "}
                              {product.satuan}
                            </p>
                            {(() => {
                              const weighingMethod = getProductWeighingMethod(
                                product.id
                              );
                              const chosenItems = shipment.shipmentItems.filter(
                                (si) =>
                                  si.productId === product.id &&
                                  si.chosenProduct &&
                                  si.status !== "CANCELLED"
                              );
                              const chosenCount = chosenItems.length;
                              const hasWeighedItems = chosenItems.some(
                                (si) => si.status === "COMPLETED"
                              );

                              if (chosenCount === 0) return null;

                              return (
                                <div className="flex items-center gap-2 pt-1">
                                  <span className="font-medium">Tipe:</span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      weighingMethod === "MANUAL"
                                        ? "text-indigo-700 bg-indigo-50 border-indigo-200"
                                        : "text-orange-700 bg-orange-50 border-orange-200"
                                    )}
                                  >
                                    {weighingMethod === "MANUAL"
                                      ? "Manual"
                                      : "Vendor"}
                                  </Badge>
                                  {hasPengirimanUpdateAccess &&
                                    weighingMethod &&
                                    !hasWeighedItems && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 px-1.5 text-[10px] text-gray-500 hover:text-gray-700"
                                        onClick={() =>
                                          handleToggleWeighingMethod(
                                            product.id,
                                            weighingMethod
                                          )
                                        }
                                        disabled={updateWeighingMethod.isPending}
                                      >
                                        <RefreshCw className="w-2.5 h-2.5 mr-0.5" />
                                        Ubah
                                      </Button>
                                    )}
                                </div>
                              );
                            })()}
                          </div>
                          {(hasPengirimanUpdateAccess ||
                            hasPengirimanWeighAccess) && (
                            <div className="pt-3 mt-3 space-y-2 border-t border-gray-100">
                              {(() => {
                                // Check if all items for this product are cancelled
                                const allCancelled = shipment.shipmentItems
                                  .filter((si) => si.productId === product.id)
                                  .every((si) => si.status === "CANCELLED");

                                // If all items are cancelled, don't show any buttons
                                if (allCancelled) {
                                  return null;
                                }

                                // Use the pre-calculated counts from the product object
                                const chosenCount = product.chosenCount;
                                const totalCount = product.totalCount;
                                const allWeighed = shipment.shipmentItems
                                  .filter(
                                    (si) =>
                                      si.productId === product.id &&
                                      si.chosenProduct &&
                                      si.status !== "CANCELLED"
                                  )
                                  .every((si) => si.status === "COMPLETED");

                                const weighingMethod = getProductWeighingMethod(
                                  product.id
                                );

                                // If no items chosen yet
                                if (chosenCount === 0) {
                                  return hasPengirimanUpdateAccess ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={
                                        isLoadBlockedByCrew
                                          ? "w-full text-gray-400 border-gray-200 cursor-not-allowed"
                                          : "w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                      }
                                      onClick={() =>
                                        handleOpenLoadingMethodModal(product.id)
                                      }
                                      disabled={
                                        chooseProduct.isPending ||
                                        selectiveChooseProduct.isPending ||
                                        isLoadBlockedByCrew
                                      }
                                      title={
                                        isLoadBlockedByCrew
                                          ? loadBlockedMessage
                                          : undefined
                                      }
                                    >
                                      <Package className="mr-2 w-4 h-4" />
                                      Muat Barang
                                    </Button>
                                  ) : null;
                                }

                                // If all items chosen
                                if (chosenCount === totalCount) {
                                  // All chosen, check if all weighed
                                  if (allWeighed) {
                                    return (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-green-600 bg-green-50 border-green-200 cursor-not-allowed"
                                        disabled
                                      >
                                        <Check className="mr-2 w-4 h-4" />
                                        Sudah Ditimbang
                                      </Button>
                                    );
                                  } else if (
                                    weighingMethod === "MANUAL" &&
                                    hasPengirimanWeighAccess
                                  ) {
                                    return (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                                        onClick={() =>
                                          handleOpenWeighingDOSelection(
                                            product.id
                                          )
                                        }
                                        disabled={bulkWeighItems.isPending}
                                      >
                                        <Scale className="mr-2 w-4 h-4" />
                                        Timbang
                                      </Button>
                                    );
                                  } else if (weighingMethod === "VENDOR") {
                                    return (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-purple-600 border-purple-200 bg-purple-50 cursor-not-allowed"
                                        disabled={true}
                                      >
                                        <Scale className="mr-2 w-4 h-4" />
                                        Sedang Dimuat
                                      </Button>
                                    );
                                  } else {
                                    return (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-green-600 border-green-200 hover:bg-green-50"
                                        disabled={true}
                                      >
                                        <Check className="mr-2 w-4 h-4" />
                                        Semua Dimuat
                                      </Button>
                                    );
                                  }
                                }

                                // Partial chosen - show both buttons
                                const buttons = [];
                                if (hasPengirimanUpdateAccess) {
                                  buttons.push(
                                    <Button
                                      key="muat"
                                      variant="outline"
                                      size="sm"
                                      className={
                                        isLoadBlockedByCrew
                                          ? "w-full text-gray-400 border-gray-200 cursor-not-allowed"
                                          : "w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                      }
                                      onClick={() =>
                                        handleOpenLoadingMethodModal(product.id)
                                      }
                                      disabled={
                                        chooseProduct.isPending ||
                                        selectiveChooseProduct.isPending ||
                                        isLoadBlockedByCrew
                                      }
                                      title={
                                        isLoadBlockedByCrew
                                          ? loadBlockedMessage
                                          : undefined
                                      }
                                    >
                                      <Package className="mr-2 w-4 h-4" />
                                      Muat Sisa ({totalCount - chosenCount})
                                    </Button>
                                  );
                                }

                                if (
                                  weighingMethod === "MANUAL" &&
                                  hasPengirimanWeighAccess &&
                                  chosenCount > 0
                                ) {
                                  const chosenItems =
                                    shipment.shipmentItems.filter(
                                      (si) =>
                                        si.productId === product.id &&
                                        si.chosenProduct &&
                                        si.status !== "CANCELLED"
                                    );
                                  const unweighedCount = chosenItems.filter(
                                    (si) => si.status !== "COMPLETED"
                                  ).length;

                                  if (unweighedCount > 0) {
                                    buttons.push(
                                      <Button
                                        key="timbang"
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                                        onClick={() =>
                                          handleOpenWeighingDOSelection(
                                            product.id
                                          )
                                        }
                                        disabled={bulkWeighItems.isPending}
                                      >
                                        <Scale className="mr-2 w-4 h-4" />
                                        Timbang ({unweighedCount})
                                      </Button>
                                    );
                                  }
                                } else if (
                                  weighingMethod === "VENDOR" &&
                                  chosenCount > 0
                                ) {
                                  const chosenItems =
                                    shipment.shipmentItems.filter(
                                      (si) =>
                                        si.productId === product.id &&
                                        si.chosenProduct &&
                                        si.status !== "CANCELLED"
                                    );
                                  const unweighedCount = chosenItems.filter(
                                    (si) => si.status !== "COMPLETED"
                                  ).length;

                                  if (unweighedCount > 0) {
                                    buttons.push(
                                      <Button
                                        key="sedang-dimuat"
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-purple-600 border-purple-200 bg-purple-50 cursor-not-allowed"
                                        disabled={true}
                                      >
                                        <Scale className="mr-2 w-4 h-4" />
                                        Sedang Dimuat ({unweighedCount})
                                      </Button>
                                    );
                                  }
                                }

                                return buttons.length > 0 ? buttons : null;
                              })()}
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Accordion untuk delivery order */}
                <DeliveryOrderAccordion
                  shipmentItems={shipment.shipmentItems}
                  shipmentStatus={shipment.status}
                  hasChangeCustomerAfterWeighAccess={
                    hasChangeCustomerAfterWeighAccess
                  }
                  hasReviseDoAfterWeighAccess={hasReviseDoAfterWeighAccess}
                  isLoadingFullDOHook={isLoadingFullDOHook}
                  onOpenChangeCustomerModal={handleOpenChangeCustomerModal}
                  onOpenReviseModal={handleOpenReviseModal}
                  selectedTransferItems={selectedTransferItems}
                  onTransferItemSelect={handleTransferItemSelect}
                  onOpenTransferItemsModal={handleOpenTransferItemsModal}
                  hasTransferItemsAccess={hasTransferItemsAccess}
                  onOpenReduceQuantityModal={handleOpenReduceQuantityModal}
                  hasReduceQuantityAccess={hasReduceQuantityAccess}
                  onOpenCancelItemModal={handleOpenCancelItemModal}
                  hasCancelItemAccess={hasCancelItemAccess}
                />
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
                    <div className="hidden rounded-lg border border-gray-200 sm:block">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
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
                              <TableHead className="px-2 py-3 text-sm font-semibold text-right text-gray-700">
                                Kuantitas
                              </TableHead>
                              <TableHead className="px-2 py-3 text-sm font-semibold text-center text-gray-700">
                                Status Timbangan
                              </TableHead>
                              <TableHead className="px-2 py-3 text-sm font-semibold text-center text-gray-700">
                                Nota Timbangan
                              </TableHead>
                              <TableHead className="px-2 py-3 text-sm font-semibold text-center text-gray-700">
                                Aksi
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(() => {
                              // Filter out products with all items cancelled
                              const activeProducts = chosenProducts?.filter((item) => {
                                const activeItems = item.shipmentItems.filter(
                                  (si) => si.status !== "CANCELLED"
                                );
                                return activeItems.length > 0;
                              }) || [];

                              if (activeProducts.length === 0) {
                                return (
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
                                );
                              }

                              return activeProducts.map((item) => (
                                <TableRow key={item.id}>
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
                                    {(() => {
                                      // Calculate total excluding cancelled items
                                      const totalQty = item.shipmentItems
                                        .filter(
                                          (si) => si.status !== "CANCELLED"
                                        )
                                        .reduce(
                                          (sum, si) =>
                                            sum + si.requestedQuantity,
                                          0
                                        );
                                      return `${formatInputNumber(totalQty)} ${
                                        item.product.satuan
                                      }`;
                                    })()}
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                    {(() => {
                                      // Exclude cancelled items from weighing status calculation
                                      const activeItems =
                                        item.shipmentItems.filter(
                                          (si) => si.status !== "CANCELLED"
                                        );
                                      const completedItems = activeItems.filter(
                                        (si) => si.status === "COMPLETED"
                                      );
                                      const totalItems = activeItems.length;

                                      if (
                                        totalItems > 0 &&
                                        completedItems.length === totalItems
                                      ) {
                                        // All items completed
                                        return (
                                          <Badge
                                            variant="outline"
                                            className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap text-center"
                                          >
                                            Sudah Ditimbang
                                          </Badge>
                                        );
                                      } else if (completedItems.length > 0) {
                                        // Some items completed (partial)
                                        return (
                                          <Badge
                                            variant="outline"
                                            className="text-blue-700 bg-blue-50 border-blue-200 whitespace-nowrap text-center"
                                          >
                                            Sebagian Ditimbang
                                          </Badge>
                                        );
                                      } else {
                                        // No items completed
                                        return (
                                          <Badge
                                            variant="outline"
                                            className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap text-center"
                                          >
                                            Belum Ditimbang
                                          </Badge>
                                        );
                                      }
                                    })()}
                                  </TableCell>
                                  <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                    {item.weighings &&
                                    item.weighings.length > 0 &&
                                    item.weighings.some(
                                      (w) => w.notaTimbangan
                                    ) ? (
                                      <>
                                        {item.weighings.filter(
                                          (w) => w.notaTimbangan
                                        ).length === 1 ? (
                                          <button
                                            type="button"
                                            className="text-blue-600 hover:underline"
                                            onClick={() => {
                                              const firstNota =
                                                item.weighings.find(
                                                  (w) => w.notaTimbangan
                                                )?.notaTimbangan;
                                              if (firstNota) {
                                                handlePreviewNotaTimbangan({
                                                  ticketNumber:
                                                    firstNota.ticketNumber,
                                                  documentPath:
                                                    firstNota.documentPath,
                                                });
                                              }
                                            }}
                                          >
                                            Lihat Dokumen
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            className="text-blue-600 hover:underline"
                                            onClick={() =>
                                              handleOpenNotaTimbanganModal(item)
                                            }
                                          >
                                            Lihat Semua (
                                            {
                                              item.weighings.filter(
                                                (w) => w.notaTimbangan
                                              ).length
                                            }
                                            )
                                          </button>
                                        )}
                                      </>
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
                              ));
                            })()}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Mobile view */}
                    <div className="block sm:hidden">
                      <div className="space-y-4">
                        {(() => {
                          // Filter out products with all items cancelled
                          const activeProducts = chosenProducts?.filter((item) => {
                            const activeItems = item.shipmentItems.filter(
                              (si) => si.status !== "CANCELLED"
                            );
                            return activeItems.length > 0;
                          }) || [];

                          if (activeProducts.length === 0) {
                            return (
                              <div className="p-4 text-center rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-500">
                                  Tidak ada item yang dipilih dalam pengiriman ini.
                                  Muat Barang di tab "Delivery Orders & Barang".
                                </p>
                              </div>
                            );
                          }

                          return activeProducts.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center">
                                  {/* <div className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                                    {index + 1}
                                  </div> */}
                                  <Link
                                    to={`/barang/${item.productId}`}
                                    className="font-medium text-blue-600 hover:underline"
                                  >
                                    {item.product.name}
                                  </Link>
                                </div>
                                {(() => {
                                  // Exclude cancelled items from weighing status calculation
                                  const activeItems = item.shipmentItems.filter(
                                    (si) => si.status !== "CANCELLED"
                                  );
                                  const completedItems = activeItems.filter(
                                    (si) => si.status === "COMPLETED"
                                  );
                                  const totalItems = activeItems.length;

                                  if (
                                    totalItems > 0 &&
                                    completedItems.length === totalItems
                                  ) {
                                    // All items completed
                                    return (
                                      <Badge
                                        variant="outline"
                                        className="text-green-700 bg-green-50 border-green-200 whitespace-nowrap text-center"
                                      >
                                        Sudah Ditimbang
                                      </Badge>
                                    );
                                  } else if (completedItems.length > 0) {
                                    // Some items completed (partial)
                                    return (
                                      <Badge
                                        variant="outline"
                                        className="text-blue-700 bg-blue-50 border-blue-200 whitespace-nowrap text-center"
                                      >
                                        Sebagian Ditimbang
                                      </Badge>
                                    );
                                  } else {
                                    // No items completed
                                    return (
                                      <Badge
                                        variant="outline"
                                        className="text-yellow-700 bg-yellow-50 border-yellow-200 whitespace-nowrap text-center"
                                      >
                                        Belum Ditimbang
                                      </Badge>
                                    );
                                  }
                                })()}
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
                                    {(() => {
                                      // Calculate total excluding cancelled items
                                      const totalQty = item.shipmentItems
                                        .filter(
                                          (si) => si.status !== "CANCELLED"
                                        )
                                        .reduce(
                                          (sum, si) =>
                                            sum + si.requestedQuantity,
                                          0
                                        );
                                      return `${formatInputNumber(totalQty)} ${
                                        item.product.satuan
                                      }`;
                                    })()}
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
                                <div className="flex items-baseline">
                                  <span className="w-20 font-medium">
                                    Nota Timbangan:
                                  </span>
                                  <div className="flex-1 flex items-end">
                                    {item.weighings &&
                                    item.weighings.length > 0 &&
                                    item.weighings.some(
                                      (w) => w.notaTimbangan
                                    ) ? (
                                      <>
                                        {item.weighings.filter(
                                          (w) => w.notaTimbangan
                                        ).length === 1 ? (
                                          <button
                                            type="button"
                                            className="text-blue-600 hover:underline"
                                            onClick={() => {
                                              const firstNota =
                                                item.weighings.find(
                                                  (w) => w.notaTimbangan
                                                )?.notaTimbangan;
                                              if (firstNota) {
                                                handlePreviewNotaTimbangan({
                                                  ticketNumber:
                                                    firstNota.ticketNumber,
                                                  documentPath:
                                                    firstNota.documentPath,
                                                });
                                              }
                                            }}
                                          >
                                            Lihat Dokumen
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            className="text-blue-600 hover:underline"
                                            onClick={() =>
                                              handleOpenNotaTimbanganModal(item)
                                            }
                                          >
                                            Lihat Semua (
                                            {
                                              item.weighings.filter(
                                                (w) => w.notaTimbangan
                                              ).length
                                            }
                                            )
                                          </button>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-400">
                                        Belum tersedia
                                      </span>
                                    )}
                                  </div>
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
                          ));
                        })()}
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
                              Customer
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
                                  {spmb.deliveryOrder?.customer?.name || "-"}
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
                              <span className="font-medium">Customer: </span>
                              {spmb.deliveryOrder?.customer?.name || "-"}
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

            {activeTab === "truck-weighing" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Timbang Truk</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pre-Weighing */}
                  <div className="p-4 rounded-lg border border-gray-200">
                    <h4 className="mb-4 text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Timbang Awal (Truk Kosong)
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <div className="flex items-center gap-2">
                          {shipment?.preWeighingWeight ? (
                            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selesai
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
                              Belum Ditimbang
                            </Badge>
                          )}
                          {shipment?.isPreWeighingManual && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-orange-700 bg-orange-50 border-orange-200 cursor-help">
                                  Manual
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{shipment.preWeighingManualReason || "Timbangan manual"}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Berat</span>
                        <span className="font-medium text-gray-700">
                          {shipment?.preWeighingWeight
                            ? `${formatInputNumber(shipment.preWeighingWeight)} kg`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Waktu</span>
                        <span className="text-sm text-gray-700">
                          {shipment?.preWeighingAt
                            ? formatDate(shipment.preWeighingAt)
                            : "-"}
                        </span>
                      </div>
                      {hasManualWeighingOverrideAccess && (
                        <div className="pt-3 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setManualWeighType('PRE');
                              setManualWeighModalOpen(true);
                            }}
                          >
                            <Scale className="h-4 w-4 mr-2" />
                            Input Manual Berat Awal
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post-Weighing */}
                  <div className="p-4 rounded-lg border border-gray-200">
                    <h4 className="mb-4 text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Timbang Akhir (Truk Muat)
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <div className="flex items-center gap-2">
                          {shipment?.postWeighingWeight ? (
                            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Selesai
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
                              Belum Ditimbang
                            </Badge>
                          )}
                          {shipment?.isPostWeighingManual && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-orange-700 bg-orange-50 border-orange-200 cursor-help">
                                  Manual
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{shipment.postWeighingManualReason || "Timbangan manual"}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Berat</span>
                        <span className="font-medium text-gray-700">
                          {shipment?.postWeighingWeight
                            ? `${formatInputNumber(shipment.postWeighingWeight)} kg`
                            : "-"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Waktu</span>
                        <span className="text-sm text-gray-700">
                          {shipment?.postWeighingAt
                            ? formatDate(shipment.postWeighingAt)
                            : "-"}
                        </span>
                      </div>
                      {hasManualWeighingOverrideAccess && allItemsCompleted && (
                        <div className="pt-3 border-t border-gray-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setManualWeighType('POST');
                              setManualWeighModalOpen(true);
                            }}
                          >
                            <Scale className="h-4 w-4 mr-2" />
                            Input Manual Berat Akhir
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Net Weight Calculation */}
                {shipment?.preWeighingWeight && shipment?.postWeighingWeight && (
                  <div className="p-4 rounded-lg border border-gray-200">
                    <h4 className="mb-4 text-lg font-medium text-gray-900">Selisih Berat</h4>
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-sm text-gray-500">Berat Muatan</span>
                      <span className="font-bold text-blue-600">
                        {formatInputNumber(
                          shipment.postWeighingWeight -
                            shipment.preWeighingWeight
                        )}{" "}
                        kg
                      </span>
                    </div>
                  </div>
                )}

                {/* Weighing Method Selector - Manual Override */}
                {hasManualWeighingOverrideAccess &&
                  chosenProducts.length > 0 &&
                  shipment?.status !== "SELESAI" &&
                  shipment?.status !== "COMPLETED" &&
                  shipment?.status !== "CANCEL" && (() => {
                    const vendorProducts = chosenProducts.filter((product) => {
                      const weighingMethod = getProductWeighingMethod(product.productId);
                      const hasChosenItems = shipment.shipmentItems.some(
                        (si) =>
                          si.productId === product.productId &&
                          si.chosenProduct &&
                          si.status !== "CANCELLED"
                      );
                      return hasChosenItems && weighingMethod !== "MANUAL";
                    });

                    return (
                    <div className="p-4 rounded-lg border border-gray-200">
                      <h4 className="mb-4 text-lg font-medium text-gray-900">
                        Tipe Penimbangan
                      </h4>
                      {vendorProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <Scale className="w-8 h-8 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-500">
                            Tidak ada produk vendor yang perlu ditimbang
                          </p>
                        </div>
                      ) : (
                      <div className="space-y-3">
                        {vendorProducts.map((product) => {
                          const chosenItems = shipment.shipmentItems.filter(
                            (si) =>
                              si.productId === product.productId &&
                              si.chosenProduct &&
                              si.status !== "CANCELLED"
                          );
                          const hasWeighedItems = chosenItems.some(
                            (si) => si.status === "COMPLETED"
                          );
                          const readyToWeighItems = shipment.shipmentItems.filter(
                            (si) =>
                              si.productId === product.productId &&
                              si.chosenProduct &&
                              si.status === "CHOSEN"
                          );

                          return (
                            <div
                              key={product.productId}
                              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                            >
                              <span className="text-sm text-gray-700">
                                {product.product.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="whitespace-nowrap text-orange-700 bg-orange-50 border-orange-200"
                                >
                                  Vendor
                                </Badge>
                                {!hasWeighedItems && readyToWeighItems.length > 0 && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 px-2 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() =>
                                      handleOpenTruckWeighingModal(product.productId)
                                    }
                                    disabled={updateWeighingMethod.isPending || bulkWeighItems.isPending}
                                  >
                                    <Scale className="w-3 h-3 mr-1" />
                                    Timbang
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      )}
                    </div>
                  );
                  })()}
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
        pagination={
          previewFile?.name?.includes("Nota Timbangan") && notaTimbanganData
            ? {
                currentIndex: currentNotaIndex,
                totalCount: notaTimbanganData.notaTimbanganList.length,
                onNext: handleNextNota,
                onPrevious: handlePrevNota,
                itemType: "Nota Timbangan",
              }
            : undefined
        }
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
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[85vh] bg-white border-0 p-0 rounded-lg shadow-lg">
          <div className="flex flex-col max-h-[85vh]">
            <DialogHeader className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
                <Package className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Detail Barang untuk Pengiriman
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-gray-600">
                Pilih Barang untuk dimuat dalam pengiriman
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {selectedProductDOs.length > 0 && (
                <>
                  <h3 className="mb-3 text-base font-medium text-gray-800">
                    Informasi Barang
                  </h3>
                  <div className="p-3 sm:p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <p className="text-sm sm:text-base font-medium text-blue-800">
                      {selectedProductDOs[0].product.name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 text-sm text-gray-700">
                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          Total Kuantitas
                        </p>
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">
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
                            className="font-medium text-blue-700 bg-blue-50 border-blue-200 text-xs sm:text-sm"
                          >
                            {selectedProductDOs.length} DO
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    // Get existing method directly in the render to ensure it's always current
                    const existingMethod =
                      getProductWeighingMethod(selectedProductId);
                    const currentMethod =
                      existingMethod || selectedWeighingMethod;

                    return (
                      <div className="p-3 sm:p-4 mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <h3 className="mb-3 text-sm sm:text-base font-medium text-green-800">
                          Pilih Metode Penimbangan
                          {existingMethod ? (
                            <span className="ml-2 text-xs text-gray-600">
                              (Metode sudah dipilih sebelumnya)
                            </span>
                          ) : null}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <input
                              id="manual-weighing"
                              name="weighing-method"
                              type="radio"
                              value="MANUAL"
                              checked={currentMethod === "MANUAL"}
                              onChange={(e) =>
                                setSelectedWeighingMethod(
                                  e.target.value as "MANUAL" | "VENDOR"
                                )
                              }
                              disabled={!!existingMethod}
                              className="w-4 h-4 text-green-600 border-gray-300 mt-0.5 disabled:opacity-90 disabled:cursor-not-allowed"
                            />
                            <label
                              htmlFor="manual-weighing"
                              className={`ml-3 text-sm ${
                                existingMethod ? "opacity-90" : ""
                              }`}
                            >
                              <span className="font-medium text-gray-900 text-sm sm:text-base">
                                Penimbangan Manual
                              </span>
                              <p className="text-xs text-gray-600 mt-1">
                                Penimbangan dilakukan secara manual melalui
                                sistem internal
                              </p>
                            </label>
                          </div>
                          <div className="flex items-start">
                            <input
                              id="vendor-weighing"
                              name="weighing-method"
                              type="radio"
                              value="VENDOR"
                              checked={currentMethod === "VENDOR"}
                              onChange={(e) =>
                                setSelectedWeighingMethod(
                                  e.target.value as "MANUAL" | "VENDOR"
                                )
                              }
                              disabled={!!existingMethod}
                              className="w-4 h-4 text-green-600 border-gray-300 mt-0.5 disabled:opacity-90 disabled:cursor-not-allowed"
                            />
                            <label
                              htmlFor="vendor-weighing"
                              className={`ml-3 text-sm ${
                                existingMethod ? "opacity-90" : ""
                              }`}
                            >
                              <span className="font-medium text-gray-900 text-sm sm:text-base">
                                Penimbangan Vendor (API)
                              </span>
                              <p className="text-xs text-gray-600 mt-1">
                                Penimbangan dilakukan melalui sistem vendor
                                pihak ketiga
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <h3 className="mb-3 text-base font-medium text-gray-800">
                    Delivery Orders Terkait
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {selectedProductDOs.map((doItem, index) => (
                      <div
                        key={doItem.doId}
                        className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200 transition-colors duration-200 hover:border-gray-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="flex justify-center items-center mr-2 w-5 h-5 sm:w-6 sm:h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
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
                            <p className="mt-1 ml-7 sm:ml-8 text-xs text-gray-500">
                              Pelanggan: {doItem.customer.name}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-gray-500">Kuantitas</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {formatInputNumber(doItem.product.quantity)}{" "}
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

            <DialogFooter className="p-6 pt-4 border-t border-gray-100 flex-shrink-0">
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
                      // Store the data we need for the confirmation
                      const currentMethod =
                        selectedWeighingMethod ||
                        getProductWeighingMethod(selectedProductId);
                      const methodText =
                        currentMethod === "MANUAL" ? "Manual" : "Vendor";
                      const productName = selectedProductDOs[0].product.name;
                      const productId = selectedProductId;
                      const weighingMethod = currentMethod;

                      // Check if this is a selective loading case
                      // We need to track the loading method that was selected
                      // selectedProductDOs is populated from handleDOSelectionConfirm which is only called for selective loading
                      const isSelectiveLoading =
                        selectedProductDOs.length > 0 &&
                        selectedProductDOs.some(
                          (deliveryOrder) => deliveryOrder.doId
                        );

                      // Close modal first to avoid z-index issues
                      setProductModalOpen(false);

                      // Show confirmation dialog after modal is closed
                      setTimeout(() => {
                        const confirmMessage = isSelectiveLoading
                          ? `Apakah Anda yakin ingin memuat barang "${productName}" dari ${selectedProductDOs.length} delivery order dengan metode penimbangan ${methodText}? Pilihan ini tidak dapat diubah setelah dikonfirmasi.`
                          : `Apakah Anda yakin ingin memuat barang "${productName}" dengan metode penimbangan ${methodText}? Pilihan ini tidak dapat diubah setelah dikonfirmasi.`;

                        showConfirmationAlert(
                          "Konfirmasi Metode Penimbangan",
                          confirmMessage,
                          "Ya, Muat Barang!",
                          "Batal"
                        ).then((result) => {
                          if (isConfirmed(result)) {
                            if (isSelectiveLoading) {
                              // Call selective choose product API
                              const deliveryOrderIds = selectedProductDOs.map(
                                function (deliveryOrder) {
                                  return deliveryOrder.doId;
                                }
                              );
                              selectiveChooseProduct.mutate({
                                shipmentId,
                                productId,
                                weighingMethod: weighingMethod as
                                  | "MANUAL"
                                  | "VENDOR",
                                deliveryOrderIds,
                              });
                            } else {
                              // Call regular choose product API (single DO)
                              const doId = selectedProductDOs[0].doId;
                              handleChooseProduct(
                                doId,
                                productId,
                                weighingMethod as "MANUAL" | "VENDOR"
                              );
                            }
                          } else {
                            // If user cancels, reopen the modal
                            setProductModalOpen(true);
                          }
                        });
                      }, 100); // Small delay to ensure modal is closed
                    }
                  }}
                  disabled={
                    chooseProduct.isPending ||
                    selectiveChooseProduct.isPending ||
                    !(
                      selectedWeighingMethod ||
                      getProductWeighingMethod(selectedProductId)
                    )
                  }
                  className="flex-1 text-white bg-blue-600 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  {chooseProduct.isPending ||
                  selectiveChooseProduct.isPending ? (
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
        <DialogContent className="sm:max-w-[600px] bg-white border-0 p-0 rounded-lg shadow-lg">
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
              {/* Product Information */}
              {weighingProductId && shipment && (
                <>
                  {(() => {
                    // Find all chosen items for this product (items that were loaded into the shipment)
                    // Filter by selected loading group if one is selected
                    // Exclude cancelled shipment items
                    const chosenItems = shipment.shipmentItems.filter(
                      (item) =>
                        item.productId === weighingProductId &&
                        item.chosenProduct &&
                        item.status !== "CANCELLED" &&
                        // Filter by loading group if selected (for group-based weighing)
                        (!selectedLoadingGroupId ||
                          item.loadingGroupId === selectedLoadingGroupId) &&
                        // Fallback to DO filter for backward compatibility
                        (selectedDOsForWeighing.length === 0 ||
                          selectedDOsForWeighing.includes(item.deliveryOrderId))
                    );

                    // Find unweighed items (those that need weighing)
                    const unweighedItems = chosenItems.filter(
                      (item) =>
                        item.status !== "COMPLETED" &&
                        item.status !== "CANCELLED"
                    );

                    if (chosenItems.length === 0) return null;

                    const productName = chosenItems[0].product.name;
                    const productSatuan = chosenItems[0].product.satuan;

                    // Calculate total quantities
                    // const totalChosenQuantity = chosenItems.reduce(
                    //   (sum, item) => sum + item.requestedQuantity,
                    //   0
                    // );
                    const totalUnweighedQuantity = unweighedItems.reduce(
                      (sum, item) => sum + item.requestedQuantity,
                      0
                    );

                    return (
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <h3 className="text-base font-medium text-blue-800 mb-3">
                          {productName} - Total:{" "}
                          {formatInputNumber(totalUnweighedQuantity)}{" "}
                          {productSatuan}
                        </h3>

                        {/* Show delivery orders involved */}
                        {unweighedItems.length > 0 && (
                          <div className="space-y-2">
                            {(() => {
                              // Group unweighed items by DO
                              const doGroups = unweighedItems.reduce(
                                (acc, item) => {
                                  const doId = item.deliveryOrderId;
                                  if (!acc[doId]) {
                                    acc[doId] = {
                                      doNumber: item.deliveryOrder.doNumber,
                                      quantity: 0,
                                    };
                                  }
                                  acc[doId].quantity += item.requestedQuantity;
                                  return acc;
                                },
                                {} as Record<
                                  string,
                                  { doNumber: string; quantity: number }
                                >
                              );

                              return Object.entries(doGroups).map(
                                ([doId, doInfo]) => (
                                  <div
                                    key={doId}
                                    className="flex items-center justify-between p-2 bg-white rounded border border-blue-200"
                                  >
                                    <span className="text-sm font-medium text-gray-800">
                                      {doInfo.doNumber}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">
                                      {formatInputNumber(doInfo.quantity)}{" "}
                                      {productSatuan}
                                    </span>
                                  </div>
                                )
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Berat Kotor (kg)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan berat kotor"
                    value={grossWeightDisplay}
                    onChange={handleGrossWeightChange}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Berat Bersih (kg){" "}
                    <span className="text-xs text-gray-500">
                      (Otomatis: Kotor - Tare)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    placeholder="Dihitung otomatis"
                    value={netWeightDisplay}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Berat Tare (kg)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan berat tare"
                    value={tareWeightDisplay}
                    onChange={handleTareWeightChange}
                    onFocus={(e) => e.target.select()}
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
                  disabled={
                    bulkWeighItems.isPending || !grossWeight || !tareWeight
                  }
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

      {/* Vendor Waiting Modal */}
      <Dialog
        open={vendorWaitingModalOpen}
        onOpenChange={setVendorWaitingModalOpen}
      >
        <DialogContent className="sm:max-w-[500px] bg-white border-0 p-0 rounded-lg shadow-lg">
          <div className="p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center text-xl font-semibold text-gray-900">
                <Package className="mr-2 w-5 h-5 text-orange-600" />
                Penimbangan Vendor (API)
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Produk ini menggunakan sistem penimbangan vendor pihak ketiga
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Package className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-orange-900">
                      Menunggu Penimbangan Vendor
                    </h4>
                    <div className="mt-2 text-sm text-orange-800">
                      <p>
                        Produk <strong>"{selectedVendorProduct}"</strong> telah
                        dimuat dan sedang menunggu proses penimbangan dari
                        sistem vendor pihak ketiga.
                      </p>
                      <ul className="mt-3 list-disc list-inside space-y-1">
                        <li>
                          Data penimbangan akan diproses secara otomatis oleh
                          vendor
                        </li>
                        <li>
                          Status akan diperbarui ketika vendor menyelesaikan
                          penimbangan
                        </li>
                        <li>
                          Anda dapat memantau status di tab "Item Pengiriman"
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 mt-4 border-t border-gray-100">
              <div className="flex gap-3 w-full">
                <Button
                  type="button"
                  onClick={() => setVendorWaitingModalOpen(false)}
                  className="flex-1 text-white bg-orange-600 shadow-md transition-all duration-200 hover:bg-orange-700 hover:shadow-lg"
                >
                  Mengerti
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weighing Method Selection Modal */}
      {/* Individual Weighing Modal */}
      <IndividualWeighingModal
        open={individualWeighingModalOpen}
        setOpen={setIndividualWeighingModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseIndividualWeighingModal();
          }
        }}
        items={individualWeighingItems}
        productName={individualWeighingItems[0]?.productName || ""}
        currentIndex={currentWeighingIndex}
        onIndexChange={setCurrentWeighingIndex}
        onWeighItem={handleIndividualWeighItem}
        onItemWeighed={(shipmentItemId) => {
          // Additional cleanup can be done here if needed
          console.log("Item weighed:", shipmentItemId);
        }}
        isLoading={individualWeighItem.isPending}
      />

      {/* Weighing DO Selection Modal */}
      {selectedProductForDOSelection && weighingDOSelectionOpen && (
        <LoadingGroupSelectionModal
          isOpen={weighingDOSelectionOpen}
          onClose={() => {
            setWeighingDOSelectionOpen(false);
            setSelectedProductForDOSelection(null);
          }}
          productName={selectedProductForDOSelection.name}
          productUnit={selectedProductForDOSelection.satuan}
          loadingGroups={
            selectedProductForDOSelection.deliveryOrders as LoadingGroup[]
          }
          onConfirm={handleWeighingDOSelectionConfirm}
        />
      )}

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
          {shipment && (
            <ReviseDOModal
              isOpen={showReviseModal}
              onClose={handleCloseReviseModal}
              deliveryOrder={fullDeliveryOrder}
              shipment={shipment}
              onSuccess={() => {
                refetch();
                refetchChosenProducts();
              }}
            />
          )}
        </>
      )}

      {/* Transfer Items Modal */}
      <TransferItemsModal
        isOpen={transferItemsModalOpen}
        onClose={handleCloseTransferItemsModal}
        transferItems={selectedTransferItems}
        onTransfer={handleTransferSubmit}
        isLoading={transferItems.isPending}
      />

      {/* Reduce Quantity Modal */}
      {selectedReduceQuantityItem && (
        <ReduceQuantityModal
          isOpen={reduceQuantityModalOpen}
          onOpenChange={handleCloseReduceQuantityModal}
          shipmentItemId={selectedReduceQuantityItem.shipmentItem.id}
          currentQuantity={
            selectedReduceQuantityItem.shipmentItem.requestedQuantity
          }
          productName={selectedReduceQuantityItem.product.name}
          customerName={selectedReduceQuantityItem.deliveryOrder.customer.name}
          doNumber={selectedReduceQuantityItem.deliveryOrder.doNumber}
          productUnit={selectedReduceQuantityItem.product.satuan}
          onSuccess={(message) => {
            showSuccessAlert("Berhasil!", message);
            refetch(); // Refetch shipment data to show updated quantities
          }}
          onError={(message) => {
            showErrorAlert("Gagal Mengurangi Kuantitas", message);
          }}
        />
      )}

      {/* Cancel Item Modal */}
      {selectedCancelItem && (
        <CancelItemModal
          isOpen={cancelItemModalOpen}
          onClose={handleCloseCancelItemModal}
          onConfirm={handleCancelItemConfirm}
          productName={selectedCancelItem.product.name}
          customerName={selectedCancelItem.deliveryOrder.customer.name}
          quantity={selectedCancelItem.shipmentItem.requestedQuantity}
          unit={selectedCancelItem.product.satuan}
          isLoading={
            cancelItemReflected.isPending || cancelItemShipmentOnly.isPending
          }
        />
      )}

      {/* Tally Assignment Modal */}
      <Dialog open={tallyModalOpen} onOpenChange={setTallyModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-0 p-0 rounded-lg shadow-lg">
          <div className="p-6">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center text-xl font-semibold text-gray-900">
                <User className="mr-2 w-5 h-5 text-blue-600" />
                {shipment?.tally ? "Edit Tally" : "Tambah Tally"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {shipment?.tally
                  ? "Perbarui nama tally untuk pengiriman ini"
                  : "Tambahkan nama tally untuk pengiriman ini"}
              </DialogDescription>
            </DialogHeader>

            <Form {...tallyForm}>
              <form
                onSubmit={tallyForm.handleSubmit(handleTallySubmit)}
                className="space-y-4"
              >
                <FormField
                  control={tallyForm.control}
                  name="tally"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Tally</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nama tally"
                          {...field}
                          disabled={updateTally.isPending}
                          maxLength={255}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4 mt-4 border-t border-gray-100">
                  <div className="flex gap-3 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTallyModalOpen(false)}
                      disabled={updateTally.isPending}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateTally.isPending}
                      className="flex-1 text-white bg-blue-600 shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                    >
                      {updateTally.isPending ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          {shipment?.tally
                            ? "Memperbarui..."
                            : "Menambahkan..."}
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 w-4 h-4" />
                          {shipment?.tally ? "Perbarui" : "Tambah"}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Method Selection Modal */}
      {selectedProductForLoading && (
        <LoadingMethodSelectionModal
          isOpen={loadingMethodModalOpen}
          onClose={() => {
            setLoadingMethodModalOpen(false);
            setSelectedProductForLoading(null);
          }}
          productName={selectedProductForLoading.name}
          onSelectMethod={handleLoadingMethodSelect}
        />
      )}

      {/* DO Selection Modal */}
      {selectedProductForDOSelection && doSelectionModalOpen && (
        <DOSelectionModal
          isOpen={doSelectionModalOpen}
          onClose={() => {
            setDoSelectionModalOpen(false);
            setSelectedProductForDOSelection(null);
          }}
          productName={selectedProductForDOSelection.name}
          productUnit={selectedProductForDOSelection.satuan}
          deliveryOrders={
            selectedProductForDOSelection.deliveryOrders as DeliveryOrderForSelection[]
          }
          onConfirm={handleDOSelectionConfirm}
          isLoading={selectiveChooseProduct.isPending}
        />
      )}

      {/* Manual Truck Weighing Modal */}
      {shipment && (
        <ManualTruckWeighModal
          isOpen={manualWeighModalOpen}
          onOpenChange={setManualWeighModalOpen}
          shipmentId={shipment.id}
          type={manualWeighType}
          existingWeight={manualWeighType === 'PRE' ? shipment.preWeighingWeight : shipment.postWeighingWeight}
          onSuccess={(message) => {
            showSuccessAlert("Berhasil", message);
          }}
          onError={(message) => {
            showErrorAlert("Gagal", message);
          }}
        />
      )}

      {/* Truck Weighing Modal for Tipe Penimbangan section */}
      <TruckWeighingModal
        open={truckWeighingModalOpen}
        onOpenChange={(open) => {
          setTruckWeighingModalOpen(open);
          if (!open) setTruckWeighingProduct(null);
        }}
        productId={truckWeighingProduct?.productId || ""}
        productName={truckWeighingProduct?.productName || ""}
        productUnit={truckWeighingProduct?.productUnit || ""}
        onSubmit={handleTruckWeighingSubmit}
        isLoading={updateWeighingMethod.isPending || bulkWeighItems.isPending}
      />
    </div>
  );
}
