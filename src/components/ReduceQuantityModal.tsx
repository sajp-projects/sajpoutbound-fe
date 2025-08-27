import { MinusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReduceQuantity } from "@/hooks/shipment";
import { formatInputNumber } from "@/utils/formatNumber";

interface ReduceQuantityModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentItemId: string;
  currentQuantity: number;
  productName: string;
  customerName: string;
  doNumber: string;
  productUnit: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ReduceQuantityModal({
  isOpen,
  onOpenChange,
  shipmentItemId,
  currentQuantity,
  productName,
  customerName,
  doNumber,
  productUnit,
  onSuccess,
  onError,
}: ReduceQuantityModalProps) {
  const [newQuantity, setNewQuantity] = useState<number>(currentQuantity);
  const [inputValue, setInputValue] = useState<string>(
    currentQuantity.toString()
  );

  const { mutate: reduceQuantity, isPending } = useReduceQuantity({
    onSuccess: (data) => {
      const message = data.data?.message || "Kuantitas berhasil dikurangi";
      if (onSuccess) {
        onSuccess(message);
      }
      onOpenChange(false);
      // Reset form
      setNewQuantity(currentQuantity);
      setInputValue(currentQuantity.toString());
    },
    onError: (error) => {
      console.error("Error reducing quantity:", error);
      const message = error.message || "Terjadi kesalahan saat mengurangi kuantitas";
      if (onError) {
        onError(message);
      }
    },
  });

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Convert to number, handling empty string and invalid input
    const numValue = parseFloat(value) || 0;
    setNewQuantity(numValue);
  };

  const handleSubmit = () => {
    // Validation
    if (newQuantity <= 0) {
      if (onError) {
        onError("Kuantitas baru harus lebih dari 0");
      }
      return;
    }

    if (newQuantity >= currentQuantity) {
      if (onError) {
        onError(
          `Kuantitas baru harus lebih kecil dari kuantitas saat ini (${formatInputNumber(
            currentQuantity
          )})`
        );
      }
      return;
    }

    reduceQuantity({
      shipmentItemId,
      newQuantity,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form
    setNewQuantity(currentQuantity);
    setInputValue(currentQuantity.toString());
  };

  const reductionAmount = currentQuantity - newQuantity;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MinusCircle className="w-5 h-5 text-orange-600" />
            Kurangi Kuantitas Item
          </DialogTitle>
          <DialogDescription>
            Mengurangi kuantitas item yang sudah dimuat. Kuantitas yang dikurangi
            akan dikembalikan ke status pending di DO asli.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Produk
              </Label>
              <p className="text-sm font-semibold">{productName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Customer
              </Label>
              <p className="text-sm">{customerName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                DO Number
              </Label>
              <p className="text-sm">{doNumber}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">
                Kuantitas Saat Ini
              </Label>
              <p className="text-sm font-semibold">
                {formatInputNumber(currentQuantity)} {productUnit}
              </p>
            </div>
          </div>

          {/* New Quantity Input */}
          <div className="space-y-2">
            <Label htmlFor="newQuantity" className="text-sm font-medium">
              Kuantitas Baru *
            </Label>
            <Input
              id="newQuantity"
              type="number"
              min="0"
              max={currentQuantity - 0.01}
              step="0.01"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Masukkan kuantitas baru"
              className="text-left"
            />
            <p className="text-xs text-gray-500">
              Harus lebih kecil dari kuantitas saat ini ({formatInputNumber(currentQuantity)} {productUnit})
            </p>
          </div>

          {/* Reduction Summary */}
          {reductionAmount > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-orange-800">
                  Jumlah Pengurangan:
                </span>
                <span className="text-sm font-semibold text-orange-900">
                  {formatInputNumber(reductionAmount)} {productUnit}
                </span>
              </div>
              <p className="text-xs text-orange-700 mt-1">
                Kuantitas ini akan dikembalikan ke status pending di DO asli
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              isPending ||
              newQuantity <= 0 ||
              newQuantity >= currentQuantity ||
              reductionAmount <= 0
            }
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isPending ? "Memproses..." : `Kurangi ${formatInputNumber(reductionAmount)} ${productUnit}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}