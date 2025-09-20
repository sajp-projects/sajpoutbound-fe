import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReviseShipmentItemAfterWeighing } from "@/hooks/shipment";
import { DeliveryOrder, RevisedItem } from "@/types/do";
import { Shipment } from "@/types/shipment";
import { formatInputNumber, handleDecimalInput } from "@/utils/formatNumber";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import Joi from "joi";
import { useEffect, useState } from "react";

// Joi schema for revised item validation
const revisedItemSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "Item ID is required",
    "any.required": "Item ID is required",
  }),
  revisedQuantity: Joi.number().min(0).required().messages({
    "number.min": "Quantity harus lebih dari atau sama dengan 0",
    "any.required": "Quantity harus diisi",
  }),
  productName: Joi.string().optional(),
});

const reviseFormSchema = Joi.object({
  items: Joi.array().items(revisedItemSchema).min(1).required().messages({
    "array.min": "Minimal ada satu item untuk direvisi",
    "any.required": "Items harus diisi",
  }),
});

interface ReviseDOModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryOrder: DeliveryOrder;
  shipment: Shipment; // Full shipment data containing the items to revise
  onSuccess?: () => void;
}

export function ReviseDOModal({
  isOpen,
  onClose,
  deliveryOrder,
  shipment,
  onSuccess,
}: ReviseDOModalProps) {
  const [revisedItems, setRevisedItems] = useState<RevisedItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [quantityDisplays, setQuantityDisplays] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);



  const reviseShipmentItemMutation = useReviseShipmentItemAfterWeighing({
    onSuccess: () => {
      // Will be handled after all revisions complete
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Merevisi Shipment Item",
        error.message || "Terjadi kesalahan saat merevisi shipment item"
      );
    },
  });

  // Initialize revised items when modal opens - focus on shipment items, not DO items
  useEffect(() => {
    if (isOpen && shipment?.shipmentItems) {
      // Filter shipment items that belong to this delivery order
      const relevantShipmentItems = shipment.shipmentItems.filter(
        (si) => si.deliveryOrderId === deliveryOrder.id
      );

      const items: RevisedItem[] = relevantShipmentItems.map((shipmentItem) => {
        // Find corresponding DO item for additional context
        const doItem = deliveryOrder.items?.find(
          (item) => item.productId === shipmentItem.productId
        );

        return {
          id: shipmentItem.id, // Use shipment item ID
          productId: shipmentItem.productId,
          productName: shipmentItem.product?.name || doItem?.product?.name || "Unknown Product",
          originalQuantity: shipmentItem.requestedQuantity, // Current shipment item quantity
          revisedQuantity: shipmentItem.requestedQuantity, // Start with current shipment quantity
          completedQuantity: doItem?.completedQuantity || 0,
          processingQuantity: doItem?.processingQuantity || 0,
          pendingQuantity: doItem?.pendingQuantity || 0,
          unit: shipmentItem.product?.satuan || doItem?.product?.satuan || "pcs",
          estimatedWeight: shipmentItem.weightedQuantity ?? 0, // Current weighted quantity
        };
      });

      setRevisedItems(items);
      setHasChanges(false);

      // Initialize display values with properly formatted quantities (including decimals)
      const displays: Record<string, string> = {};
      items.forEach((item) => {
        if (item.revisedQuantity > 0) {
          displays[item.id] = formatInputNumber(item.revisedQuantity);
        } else {
          displays[item.id] = ""; // Empty for 0 values
        }
      });
      setQuantityDisplays(displays);
    }
  }, [isOpen, shipment, deliveryOrder]);

  const handleQuantityChange = (itemId: string, newQuantity: string) => {
    // Use handleDecimalInput with the current value for proper decimal handling
    const result = handleDecimalInput(newQuantity);
    const quantity = result.numericValue || 0;

    // Update display value with the formatted result
    setQuantityDisplays(prev => ({
      ...prev,
      [itemId]: result.displayValue
    }));

    setRevisedItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const revisedItem = {
            ...item,
            revisedQuantity: quantity,
          };
          return revisedItem;
        }
        return item;
      })
    );

    // Check if there are changes compared to original shipment item quantities
    const hasItemChanges = revisedItems.some(
      (item) => {
        if (item.id === itemId) {
          return quantity !== item.originalQuantity;
        }
        return item.revisedQuantity !== item.originalQuantity;
      }
    );
    setHasChanges(hasItemChanges);
  };

  const validateChanges = (): string | null => {
    const { error } = reviseFormSchema.validate(
      {
        items: revisedItems.map((item) => ({
          id: item.id,
          revisedQuantity: item.revisedQuantity,
          productName: item.productName,
        })),
      },
      { abortEarly: true }
    );

    if (error) {
      // Extract the first validation error
      const firstError = error.details[0];
      const errorPath = firstError.path;

      // If error is on a specific item's revisedQuantity
      if (
        errorPath.includes("items") &&
        errorPath.includes("revisedQuantity")
      ) {
        const itemIndex = errorPath[1] as number;
        const itemName = revisedItems[itemIndex]?.productName || "Item";
        return `${itemName}: ${firstError.message}`;
      }

      return firstError.message;
    }

    return null; // No validation errors
  };

  const handleSubmit = async () => {
    const validationError = validateChanges();
    if (validationError) {
      showErrorAlert("Validasi Error", validationError);
      return;
    }

    if (!hasChanges) {
      showErrorAlert(
        "Tidak Ada Perubahan",
        "Tidak ada perubahan yang dibuat pada shipment items"
      );
      return;
    }

    // Show confirmation with changes summary
    const changedItems = revisedItems.filter(
      (item) => item.revisedQuantity !== item.originalQuantity
    );

    // Close modal first to show SweetAlert properly
    onClose();

    const result = await showConfirmationAlert(
      "Konfirmasi Revisi Shipment Items",
      `Apakah Anda yakin ingin merevisi ${changedItems.length} item(s) dalam shipment ini?\n\n• Quantity DO asli tetap sama\n• Distribusi Pending/Proses akan berubah\n• Berat akan dihitung ulang\n• SPMB dan nota timbangan akan dibuat ulang`,
      "Ya, Revisi!",
      "Batal"
    );

    if (isConfirmed(result)) {
      setIsProcessing(true);

      // Process each changed item sequentially
      let successCount = 0;
      const errorMessages: string[] = [];

      for (const item of changedItems) {
        try {
          // The item.id is now the shipment item ID directly
          // Call the new API for this specific shipment item
          await reviseShipmentItemMutation.mutateAsync({
            shipmentId: shipment.id,
            shipmentItemId: item.id, // This is now the shipment item ID
            newQuantity: item.revisedQuantity,
          });

          successCount++;
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorMessages.push(`${item.productName}: ${(error as any).message || 'Unknown error'}`);
          continue;
        }
      }

      // Show final result
      setIsProcessing(false);

      if (successCount === changedItems.length) {
        showSuccessAlert(
          "Berhasil!",
          `Berhasil merevisi ${successCount} shipment item(s) dengan perhitungan ulang berat`
        );
        onSuccess?.(); // Call parent callback to trigger refetch
      } else if (successCount > 0) {
        showErrorAlert(
          "Sebagian Berhasil",
          `${successCount} dari ${changedItems.length} item berhasil direvisi.\n\nError:\n${errorMessages.join('\n')}`
        );
        onSuccess?.(); // Still trigger refetch for successful items
      } else {
        showErrorAlert(
          "Gagal Merevisi",
          `Tidak ada item yang berhasil direvisi.\n\nError:\n${errorMessages.join('\n')}`
        );
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto bg-white border-0 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Revisi Shipment Items</DialogTitle>
          <div className="text-sm text-gray-600 mt-2">
            <p><strong>Shipment:</strong> {shipment.armada?.plateNumber || 'N/A'} - {shipment.driver?.name || 'N/A'}</p>
            <p><strong>DO:</strong> {deliveryOrder.doNumber} - {deliveryOrder.customer?.name}</p>
            <p className="text-xs text-amber-600 mt-1">
              💡 Merevisi item shipment akan mempengaruhi distribusi quantity di DO terkait
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Weight Recalculation Info */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">
              💡 Informasi Revisi Shipment Item:
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>
                • Merevisi quantity shipment item akan mempengaruhi distribusi quantity di DO
              </li>
              <li>• Quantity DO asli tetap sama, hanya distribusi Pending/Proses yang berubah</li>
              <li>
                • Berat akan dihitung ulang berdasarkan rasio penimbangan sebelumnya
              </li>
              <li>• Item dengan quantity 0 akan dihapus dari shipment</li>
              <li>• SPMB dan nota timbangan akan dibuat ulang untuk shipment ini</li>
            </ul>
          </div>

          {/* Desktop Table View */}
          <div className="hidden border border-gray-200 rounded-lg sm:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                    Produk
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    Qty Shipment Saat Ini
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    Qty Shipment Baru
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    Berat Saat Ini (Bruto)
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    DO Selesai
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    DO Proses
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    DO Pending
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revisedItems.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className={`border-b border-gray-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-100`}
                  >
                    <TableCell className="px-4 py-3 text-sm text-gray-600 font-medium">
                      {item.productName}
                      <div className="text-xs text-gray-500">
                        Unit: {item.unit}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                      <span className="font-medium">{formatInputNumber(item.originalQuantity)}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                      <div className="flex justify-center">
                        <Input
                          type="text"
                          value={quantityDisplays[item.id] || (item.revisedQuantity > 0 ? item.revisedQuantity.toString() : "")}
                          onChange={(e) =>
                            handleQuantityChange(item.id, e.target.value)
                          }
                          onFocus={(e) => e.target.select()}
                          className="w-20 text-center"
                          disabled={isProcessing}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                      <span className="text-xs">
                        {item.estimatedWeight ? `${formatInputNumber(item.estimatedWeight)} kg` : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-500">
                      {formatInputNumber(item.completedQuantity)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-500">
                      {formatInputNumber(item.processingQuantity)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-500">
                      {formatInputNumber(item.pendingQuantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="block space-y-3 sm:hidden">
            {revisedItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border border-gray-200 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-1">Qty Shipment Saat Ini</p>
                    <p className="font-semibold text-gray-800">{formatInputNumber(item.originalQuantity)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-1">Qty Shipment Baru</p>
                    <div className="flex justify-center">
                      <Input
                        type="text"
                        value={quantityDisplays[item.id] || (item.revisedQuantity > 0 ? item.revisedQuantity.toString() : "")}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                        onFocus={(e) => e.target.select()}
                        className="w-20 text-center text-sm"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                  <div className="text-center col-span-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Berat Saat Ini</p>
                    <p className="font-semibold text-gray-800">
                      {item.estimatedWeight ? `${formatInputNumber(item.estimatedWeight)} kg` : '-'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">DO: Selesai</p>
                    <p className="text-gray-600">{formatInputNumber(item.completedQuantity)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">DO: Proses</p>
                    <p className="text-gray-600">{formatInputNumber(item.processingQuantity)}</p>
                  </div>
                  <div className="text-center col-span-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">DO: Pending</p>
                    <p className="text-gray-600">{formatInputNumber(item.pendingQuantity)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isProcessing ||
              !hasChanges ||
              validateChanges() !== null
            }
          >
            {isProcessing ? "Merevisi..." : "Revisi Shipment Items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
