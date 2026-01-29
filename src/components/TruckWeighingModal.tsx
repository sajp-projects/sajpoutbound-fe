import { Loader2, Scale, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { isConfirmed, showConfirmationAlert } from "@/utils/sweetAlert";
import { handleDecimalInput } from "../utils/formatNumber";
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

interface TruckWeighingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  productUnit: string;
  onSubmit: (data: {
    productId: string;
    grossWeight: number;
    netWeight: number;
    tareWeight: number;
  }) => void;
  isLoading?: boolean;
}

export function TruckWeighingModal({
  open,
  onOpenChange,
  productId,
  productName,
  productUnit,
  onSubmit,
  isLoading = false,
}: TruckWeighingModalProps) {
  const [grossWeight, setGrossWeight] = useState("");
  const [netWeight, setNetWeight] = useState("");
  const [tareWeight, setTareWeight] = useState("");

  const [grossWeightDisplay, setGrossWeightDisplay] = useState("");
  const [netWeightDisplay, setNetWeightDisplay] = useState("");
  const [tareWeightDisplay, setTareWeightDisplay] = useState("");

  useEffect(() => {
    if (open) {
      resetWeights();
    }
  }, [open]);

  const resetWeights = () => {
    setGrossWeight("");
    setNetWeight("");
    setTareWeight("");
    setGrossWeightDisplay("");
    setNetWeightDisplay("");
    setTareWeightDisplay("");
  };

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
      setNetWeight(grossWeight);
      setNetWeightDisplay(grossWeightDisplay);
    } else {
      setNetWeight("");
      setNetWeightDisplay("");
    }
  }, [grossWeight, tareWeight, grossWeightDisplay]);

  const handleSubmit = () => {
    if (!grossWeight || parseFloat(grossWeight) <= 0) {
      alert("Berat kotor harus diisi dan lebih dari 0");
      return;
    }
    if (!tareWeight || parseFloat(tareWeight) < 0) {
      alert("Berat tare harus diisi dan tidak boleh negatif");
      return;
    }

    onOpenChange(false);

    showConfirmationAlert(
      "Konfirmasi Penimbangan Truk",
      "Apakah Anda yakin ingin menyimpan hasil penimbangan truk ini?"
    ).then((result) => {
      if (isConfirmed(result)) {
        const submitData = {
          productId,
          grossWeight: parseFloat(grossWeight),
          netWeight: netWeight ? parseFloat(netWeight) : parseFloat(grossWeight) - parseFloat(tareWeight),
          tareWeight: parseFloat(tareWeight),
        };

        resetWeights();
        onSubmit(submitData);
      } else {
        onOpenChange(true);
      }
    });
  };

  const isSubmitDisabled =
    !grossWeight ||
    parseFloat(grossWeight) <= 0 ||
    !tareWeight ||
    parseFloat(tareWeight) < 0 ||
    isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] bg-white border-0 p-0 rounded-lg shadow-lg overflow-y-auto">
        <div className="p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
              <Truck className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span className="hidden sm:inline">Penimbangan Truk</span>
              <span className="sm:hidden">Timbang Truk</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Masukkan berat timbangan untuk produk ini
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-purple-100">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full shrink-0">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-xs sm:text-sm font-semibold text-purple-800">
                    Produk
                  </Label>
                  <p className="text-sm sm:text-base text-gray-900 mt-1 font-medium break-words">
                    {productName}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                    Satuan: {productUnit}
                  </p>
                </div>
              </div>
            </div>

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
                  disabled={isLoading}
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total berat truk + produk
                </p>
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
                  disabled={isLoading}
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Berat kosong truk
                </p>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">
                  Berat Bersih (kg){" "}
                  <span className="text-xs text-purple-600 font-medium">
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
                  className="w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed font-medium text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Berat produk yang sebenarnya
                </p>
              </div>
            </div>

            {netWeight && parseFloat(netWeight) > 0 && (
              <div className="mt-4 sm:mt-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-medium text-purple-800">
                    Total Berat Bersih:
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-purple-700">
                    {parseFloat(netWeight).toLocaleString("id-ID")} kg
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="w-full sm:w-auto text-xs sm:text-sm text-gray-700 border-gray-300 h-10 sm:h-auto order-2 sm:order-1"
              >
                Batal
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="w-full sm:w-auto text-xs sm:text-sm text-white bg-purple-600 hover:bg-purple-700 h-10 sm:h-auto order-1 sm:order-2 sm:ml-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Scale className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Simpan Penimbangan</span>
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
