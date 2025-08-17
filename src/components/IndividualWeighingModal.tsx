import { ChevronLeft, ChevronRight, Loader2, Scale } from "lucide-react";
import React, { useEffect, useState } from "react";
import { handleDecimalInput } from "../utils/formatNumber";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Label } from "./ui/label";

interface IndividualItem {
  shipmentItemId: string;
  deliveryOrderId: string;
  deliveryOrderNumber: string;
  customerName: string;
  requestedQuantity: number;
  productName: string;
  productUnit: string;
}

interface IndividualWeighingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: IndividualItem[];
  productName: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onWeighItem: (data: {
    shipmentItemId: string;
    grossWeight: number;
    netWeight?: number;
    tareWeight?: number;
  }) => void;
  onItemWeighed?: (shipmentItemId: string) => void;
  isLoading?: boolean;
}

export function IndividualWeighingModal({
  open,
  onOpenChange,
  items,
  productName,
  currentIndex,
  onIndexChange,
  onWeighItem,
  onItemWeighed,
  isLoading = false,
}: IndividualWeighingModalProps) {
  // State to persist input data for each item
  const [itemInputData, setItemInputData] = useState<{
    [key: string]: {
      grossWeight: string;
      netWeight: string;
      tareWeight: string;
      grossWeightDisplay: string;
      netWeightDisplay: string;
      tareWeightDisplay: string;
    };
  }>({});

  const [grossWeight, setGrossWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [tareWeight, setTareWeight] = useState("");

  // Formatted display states for weight inputs
  const [grossWeightDisplay, setGrossWeightDisplay] = useState("");
  const [netWeightDisplay, setNetWeightDisplay] = useState("");
  const [tareWeightDisplay, setTareWeightDisplay] = useState("");

  const currentItem = items[currentIndex];
  const totalItems = items.length;
  const isFirstItem = currentIndex === 0;
  const isLastItem = currentIndex === totalItems - 1;

  // Save current item's input data before switching
  const saveCurrentItemData = () => {
    if (currentItem) {
      setItemInputData((prev) => ({
        ...prev,
        [currentItem.shipmentItemId]: {
          grossWeight,
          netWeight,
          tareWeight,
          grossWeightDisplay,
          netWeightDisplay,
          tareWeightDisplay,
        },
      }));
    }
  };

  // Load saved data for current item
  const loadCurrentItemData = () => {
    if (currentItem) {
      const savedData = itemInputData[currentItem.shipmentItemId];
      if (savedData) {
        setGrossWeight(savedData.grossWeight);
        setNetWeight(savedData.netWeight);
        setTareWeight(savedData.tareWeight);
        setGrossWeightDisplay(savedData.grossWeightDisplay);
        setNetWeightDisplay(savedData.netWeightDisplay);
        setTareWeightDisplay(savedData.tareWeightDisplay);
      } else {
        resetWeights();
      }
    }
  };

  const resetWeights = () => {
    setGrossWeight("");
    setNetWeight("");
    setTareWeight("");
    setGrossWeightDisplay("");
    setNetWeightDisplay("");
    setTareWeightDisplay("");
  };

  // Save data when switching items or modal opens/closes
  useEffect(() => {
    if (open && currentItem) {
      loadCurrentItemData();
    }
    return () => {
      if (currentItem) {
        saveCurrentItemData();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentIndex]);

  // Save data before navigation
  useEffect(() => {
    return () => {
      saveCurrentItemData();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    grossWeight,
    netWeight,
    tareWeight,
    grossWeightDisplay,
    netWeightDisplay,
    tareWeightDisplay,
  ]);

  // Handler functions for formatted weight inputs
  const handleGrossWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const result = handleDecimalInput(inputValue);

    if (result.numericValue !== undefined) {
      setGrossWeight(result.numericValue.toString());
      setGrossWeightDisplay(result.displayValue);
    } else {
      setGrossWeight("");
      setGrossWeightDisplay(result.displayValue);
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
      setTareWeightDisplay(result.displayValue);
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
        setNetWeightDisplay(netValue.toLocaleString("id-ID"));
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

  const handleNext = () => {
    if (!isLastItem) {
      saveCurrentItemData();
      onIndexChange(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstItem) {
      saveCurrentItemData();
      onIndexChange(currentIndex - 1);
    }
  };

  const handleWeighSubmit = () => {
    if (!currentItem) return;

    // Validate required fields (gross and tare)
    if (!grossWeight || parseFloat(grossWeight) <= 0) {
      alert("Berat kotor harus diisi dan lebih dari 0");
      return;
    }
    if (!tareWeight || parseFloat(tareWeight) < 0) {
      alert("Berat tare harus diisi dan tidak boleh negatif");
      return;
    }

    const weighData = {
      shipmentItemId: currentItem.shipmentItemId,
      grossWeight: parseFloat(grossWeight),
      netWeight: netWeight ? parseFloat(netWeight) : undefined,
      tareWeight: parseFloat(tareWeight),
    };

    // Clear saved data for this item since it's being weighed
    setItemInputData((prev) => {
      const updated = { ...prev };
      delete updated[currentItem.shipmentItemId];
      return updated;
    });

    // Reset current input fields
    resetWeights();

    // Call the weighing callback
    onWeighItem(weighData);

    // Notify parent that item was weighed (for additional cleanup if needed)
    if (onItemWeighed) {
      onItemWeighed(currentItem.shipmentItemId);
    }
  };

  const isSubmitDisabled =
    !grossWeight ||
    parseFloat(grossWeight) <= 0 ||
    !tareWeight ||
    parseFloat(tareWeight) < 0 ||
    isLoading;

  if (!currentItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] bg-white border-0 p-0 rounded-lg shadow-lg overflow-y-auto">
        <div className="p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
              <Scale className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span className="hidden sm:inline">Timbang Item Individual</span>
              <span className="sm:hidden">Timbang Individual</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Menimbang item satu per satu dari DO yang berbeda
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Progress Indicator */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">
                  Item {currentIndex + 1} dari {totalItems}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm text-purple-700 bg-purple-50 border-purple-200"
                >
                  {Math.round(((currentIndex + 1) / totalItems) * 100)}% Selesai
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / totalItems) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Current Item Information */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                    Produk
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-900 mt-1 break-words">
                    {productName}
                  </p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                    DO Number
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-900 mt-1 break-words">
                    {currentItem.deliveryOrderNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                    Customer
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-900 mt-1 break-words">
                    {currentItem.customerName}
                  </p>
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                    Kuantitas
                  </Label>
                  <p className="text-xs sm:text-sm text-gray-900 mt-1">
                    {currentItem.requestedQuantity.toLocaleString("id-ID")}{" "}
                    {currentItem.productUnit}
                  </p>
                </div>
              </div>
            </div>

            {/* Weight Input Fields */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  Berat Kotor (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  id="grossWeight"
                  type="text"
                  placeholder="Masukkan berat kotor"
                  value={grossWeightDisplay}
                  onChange={handleGrossWeightChange}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  Berat Bersih (kg){" "}
                  <span className="text-xs text-gray-500">
                    (Otomatis: Kotor - Tare)
                  </span>
                </label>
                <input
                  id="netWeight"
                  type="text"
                  placeholder="Dihitung otomatis"
                  value={netWeightDisplay}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  Berat Tare (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  id="tareWeight"
                  type="text"
                  placeholder="Masukkan berat tare"
                  value={tareWeightDisplay}
                  onChange={handleTareWeightChange}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-3 sm:gap-0">
              {/* Navigation Controls */}
              <div className="flex gap-2 justify-center sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isFirstItem}
                  className="flex-1 sm:flex-none text-xs sm:text-sm text-gray-700 border-gray-300 h-9 sm:h-auto"
                >
                  <ChevronLeft className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Sebelumnya</span>
                  <span className="xs:hidden">Prev</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNext}
                  disabled={isLastItem}
                  className="flex-1 sm:flex-none text-xs sm:text-sm text-gray-700 border-gray-300 h-9 sm:h-auto"
                >
                  <span className="hidden xs:inline">Selanjutnya</span>
                  <span className="xs:hidden">Next</span>
                  <ChevronRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>

              {/* Action Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={handleWeighSubmit}
                  disabled={isSubmitDisabled}
                  className="w-full sm:w-auto text-xs sm:text-sm text-white bg-purple-600 hover:bg-purple-700 h-9 sm:h-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      <span className="hidden xs:inline">Memproses...</span>
                      <span className="xs:hidden">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Scale className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Timbang Item Ini</span>
                      <span className="xs:hidden">Timbang</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
