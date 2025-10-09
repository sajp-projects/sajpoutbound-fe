import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeliveryOrderForSelection } from "@/types/shipment";
import { formatInputNumber } from "@/utils/formatNumber";
import { Check, Package, User, X } from "lucide-react";
import { useEffect, useState } from "react";

interface DOSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productUnit: string;
  deliveryOrders: DeliveryOrderForSelection[];
  onConfirm: (selectedDOIds: string[]) => void;
  isLoading?: boolean;
}

export function DOSelectionModal({
  isOpen,
  onClose,
  productName,
  productUnit,
  deliveryOrders,
  onConfirm,
  isLoading = false,
}: DOSelectionModalProps) {
  const [selectedDOIds, setSelectedDOIds] = useState<string[]>([]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDOIds([]);
    }
  }, [isOpen]);

  const handleDOSelection = (doId: string, checked: boolean) => {
    if (checked) {
      setSelectedDOIds(prev => [...prev, doId]);
    } else {
      setSelectedDOIds(prev => prev.filter(id => id !== doId));
    }
  };

  const handleSelectAll = () => {
    if (selectedDOIds.length === deliveryOrders.length) {
      setSelectedDOIds([]);
    } else {
      setSelectedDOIds(deliveryOrders.map(deliveryOrder => deliveryOrder.id));
    }
  };

  const handleConfirm = () => {
    if (selectedDOIds.length === 0) return;
    onConfirm(selectedDOIds);
    setSelectedDOIds([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedDOIds([]);
    onClose();
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[85vh] bg-white border-0 p-0 rounded-lg shadow-lg">
        <div className="flex flex-col max-h-[75vh]">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
              <Package className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Pilih Delivery Order - {productName}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Pilih delivery order yang ingin dimuat untuk produk {productName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {/* Select All */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedDOIds.length === deliveryOrders.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                  Pilih Semua ({deliveryOrders.length} DO)
                </label>
              </div>
              {selectedDOIds.length > 0 && (
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="whitespace-nowrap text-blue-700 bg-blue-50 border-blue-200 text-xs sm:text-sm">
                    {selectedDOIds.length} dipilih
                  </Badge>
                </div>
              )}
            </div>

            {/* Delivery Order List */}
            <div className="space-y-3">
              {deliveryOrders.map((deliveryOrder) => {
                const isSelected = selectedDOIds.includes(deliveryOrder.id);
                const productItems = deliveryOrder.items.filter(
                  item => item.productId === deliveryOrders[0]?.items[0]?.productId
                );
                const totalQuantity = productItems.reduce(
                  (sum, item) => sum + item.pendingQuantity, 0
                );

                return (
                  <div
                    key={deliveryOrder.id}
                    className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleDOSelection(deliveryOrder.id, !isSelected)}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleDOSelection(deliveryOrder.id, !!checked)
                        }
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 truncate">
                            {deliveryOrder.doNumber}
                          </h4>
                          <div className="flex-shrink-0 ml-2">
                            <Badge
                              variant="outline"
                              className={`whitespace-nowrap text-xs sm:text-sm ${
                                totalQuantity > 0
                                  ? "text-green-700 bg-green-50 border-green-200"
                                  : "text-gray-500 bg-gray-50 border-gray-200"
                              }`}
                            >
                              {formatInputNumber(totalQuantity)} {productUnit}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="mr-1 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="truncate text-xs sm:text-sm">{deliveryOrder.customer.name}</span>
                        </div>
                        {deliveryOrder.customer.address && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {deliveryOrder.customer.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>




          </div>

          <DialogFooter className="p-6 pt-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                <X className="mr-2 w-4 h-4" />
                Batal
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                disabled={selectedDOIds.length === 0 || isLoading}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 w-4 h-4" />
                    Muat Barang ({selectedDOIds.length} DO)
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}