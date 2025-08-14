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
import { useReviseDeliveryOrderAfterWeighing } from "@/hooks/shipment";
import { DeliveryOrder, RevisedItem } from "@/types/do";
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
  onSuccess?: () => void;
}

export function ReviseDOModal({
  isOpen,
  onClose,
  deliveryOrder,
  onSuccess,
}: ReviseDOModalProps) {
  const [revisedItems, setRevisedItems] = useState<RevisedItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [quantityDisplays, setQuantityDisplays] = useState<Record<string, string>>({});



  const reviseDoMutation = useReviseDeliveryOrderAfterWeighing({
    onSuccess: () => {
      showSuccessAlert(
        "Berhasil!",
        "DO berhasil direvisi dengan perhitungan ulang berat"
      );
      onSuccess?.(); // Call parent callback to trigger refetch
      onClose();
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Merevisi DO",
        error.message || "Terjadi kesalahan saat merevisi DO"
      );
    },
  });

  // Initialize revised items when modal opens
  useEffect(() => {
    if (isOpen && deliveryOrder?.items) {
      const items: RevisedItem[] = deliveryOrder.items.map((item) => ({
        id: item.id,
        productName: item.product?.name || "Unknown Product",
        originalQuantity: item.quantity, // Current DO quantity
        revisedQuantity: item.quantity, // Start with current DO quantity
        completedQuantity: item.completedQuantity,
        processingQuantity: item.processingQuantity,
        pendingQuantity: item.pendingQuantity,
        unit: item.product?.satuan || "pcs",
        estimatedWeight: undefined, // Will be calculated by backend
      }));
      setRevisedItems(items);
      setHasChanges(false);

      // Initialize display values with properly formatted quantities (including decimals)
      const displays: Record<string, string> = {};
      items.forEach((item) => {
        if (item.revisedQuantity > 0) {
          // Use formatInputNumber to match how Qty Asli is displayed
          displays[item.id] = formatInputNumber(item.revisedQuantity);
        } else {
          displays[item.id] = ""; // Empty for 0 values
        }
      });
      setQuantityDisplays(displays);
    }
  }, [isOpen, deliveryOrder]);

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

    // Check if there are changes
    const originalItem = deliveryOrder.items?.find(
      (item) => item.id === itemId
    );
    const hasItemChanges = revisedItems.some(
      (item) => item.revisedQuantity !== item.originalQuantity
    );
    setHasChanges(hasItemChanges || quantity !== (originalItem?.quantity || 0));
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

  const handleSubmit = () => {
    const validationError = validateChanges();
    if (validationError) {
      showErrorAlert("Validasi Error", validationError);
      return;
    }

    if (!hasChanges) {
      showErrorAlert(
        "Tidak Ada Perubahan",
        "Tidak ada perubahan yang dibuat pada DO"
      );
      return;
    }

    // Show confirmation with changes summary
    const changedItems = revisedItems.filter(
      (item) => item.revisedQuantity !== item.originalQuantity
    );

    // Close modal first to show SweetAlert properly
    onClose();

    showConfirmationAlert(
      "Konfirmasi Revisi DO",
      `Apakah Anda yakin ingin merevisi DO ini? Berat akan dihitung ulang berdasarkan rasio penimbangan sebelumnya.`,
      "Ya, Revisi!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        const revisedItemsData = changedItems.map((item) => ({
          id: item.id,
          quantity: item.revisedQuantity,
        }));

        reviseDoMutation.mutate({
          deliveryOrderId: deliveryOrder.id,
          items: revisedItemsData,
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto bg-white border-0 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>Revisi DO</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Weight Recalculation Info */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">
              💡 Informasi Perhitungan Berat:
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>
                • Berat akan dihitung ulang berdasarkan berat rata-rata per unit
                dari penimbangan sebelumnya
              </li>
              <li>• Contoh: Jika 300 unit = 300kg, maka 1 unit = 1kg</li>
              <li>
                • Jika quantity diubah menjadi 200 unit, berat otomatis menjadi
                200kg
              </li>
              <li>• Perubahan akan mempengaruhi pengiriman yang terkait</li>
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
                    Qty Asli
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    Qty Baru
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    Selesai
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    Proses
                  </TableHead>
                  <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                    Pending
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
                      {formatInputNumber(item.originalQuantity)}
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
                          disabled={reviseDoMutation.isPending}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                      {formatInputNumber(item.completedQuantity)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                      {formatInputNumber(item.processingQuantity)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
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
                    <p className="text-xs font-medium text-gray-600 mb-1">Qty Asli</p>
                    <p className="font-semibold text-gray-800">{formatInputNumber(item.originalQuantity)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-1">Qty Baru</p>
                    <div className="flex justify-center">
                      <Input
                        type="text"
                        value={quantityDisplays[item.id] || (item.revisedQuantity > 0 ? item.revisedQuantity.toString() : "")}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                        onFocus={(e) => e.target.select()}
                        className="w-20 text-center text-sm"
                        disabled={reviseDoMutation.isPending}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-1">Selesai</p>
                    <p className="font-semibold text-gray-800">{formatInputNumber(item.completedQuantity)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-1">Proses</p>
                    <p className="font-semibold text-gray-800">{formatInputNumber(item.processingQuantity)}</p>
                  </div>
                  <div className="text-center col-span-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">Pending</p>
                    <p className="font-semibold text-gray-800">{formatInputNumber(item.pendingQuantity)}</p>
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
            disabled={reviseDoMutation.isPending}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              reviseDoMutation.isPending ||
              !hasChanges ||
              validateChanges() !== null
            }
          >
            {reviseDoMutation.isPending ? "Merevisi..." : "Revisi DO"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
