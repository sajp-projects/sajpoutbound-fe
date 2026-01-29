import { Scale } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useManualTruckWeigh } from "@/hooks/shipment";
import { formatInputNumber, handleDecimalInput } from "@/utils/formatNumber";
import { showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";

interface ManualTruckWeighModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentId: string;
  type: 'PRE' | 'POST';
  existingWeight?: number | null;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ManualTruckWeighModal({
  isOpen,
  onOpenChange,
  shipmentId,
  type,
  existingWeight,
  onSuccess,
  onError,
}: ManualTruckWeighModalProps) {
  const [weight, setWeight] = useState<number>(0);
  const [weightInputValue, setWeightInputValue] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const { mutate: manualTruckWeigh, isPending } = useManualTruckWeigh({
    onSuccess: (data) => {
      const message = data.data?.message || `Berat ${type === 'PRE' ? 'awal' : 'akhir'} berhasil diinput manual`;
      if (onSuccess) {
        onSuccess(message);
      }
      onOpenChange(false);
      // Reset form
      setWeight(0);
      setWeightInputValue("");
      setReason("");
    },
    onError: (error) => {
      console.error("Error manual truck weigh:", error);
      const message = error.message || "Terjadi kesalahan saat input manual berat truk";
      if (onError) {
        onError(message);
      }
    },
  });

  const handleWeightChange = (value: string) => {
    const result = handleDecimalInput(value);
    // Prevent negative values
    if (result.numericValue !== undefined && result.numericValue < 0) {
      setWeightInputValue("");
      setWeight(0);
      return;
    }
    setWeightInputValue(result.displayValue);
    setWeight(result.numericValue ?? 0);
  };

  const handleSubmit = async () => {
    // Validation
    if (weight <= 0) {
      if (onError) {
        onError("Berat harus lebih dari 0");
      }
      return;
    }

    if (reason.trim().length < 5) {
      if (onError) {
        onError("Alasan harus minimal 5 karakter");
      }
      return;
    }

    // Close modal first before showing confirmation
    onOpenChange(false);

    // Show confirmation alert
    const result = await showConfirmationAlert(
      "Konfirmasi Input Manual Berat Truk",
      `Anda akan menginput berat ${type === 'PRE' ? 'awal' : 'akhir'} sebesar ${formatInputNumber(weight)} kg. ${existingWeight ? `Berat yang sudah ada (${formatInputNumber(existingWeight)} kg) akan ditimpa. ` : ""}Apakah Anda yakin?`,
      "Ya, Simpan",
      "Batal"
    );

    if (isConfirmed(result)) {
      manualTruckWeigh({
        shipmentId,
        type,
        weight,
        reason: reason.trim(),
      });
    } else {
      // If user cancels, reopen the modal
      onOpenChange(true);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form
    setWeight(0);
    setWeightInputValue("");
    setReason("");
  };

  const isValid = weight > 0 && reason.trim().length >= 5;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            Input Manual Berat {type === 'PRE' ? 'Awal' : 'Akhir'} Truk
          </DialogTitle>
          <DialogDescription>
            Masukkan berat truk secara manual. Fitur ini hanya untuk pengguna dengan izin khusus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Tipe Penimbangan
              </span>
              <span className="text-sm font-semibold text-blue-900">
                {type === 'PRE' ? 'Timbang Awal (Truk Kosong)' : 'Timbang Akhir (Truk Muat)'}
              </span>
            </div>
            {existingWeight && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    Berat Saat Ini
                  </span>
                  <span className="text-sm font-semibold text-blue-900">
                    {formatInputNumber(existingWeight)} kg
                  </span>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  * Berat yang sudah ada akan ditimpa
                </p>
              </div>
            )}
          </div>

          {/* Weight Input */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium">
              Berat (kg) *
            </Label>
            <Input
              id="weight"
              type="text"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={weightInputValue}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder="Masukkan berat dalam kg"
              className="text-left"
            />
            {(() => {
              const result = handleDecimalInput(weightInputValue);
              if (result.numericValue !== undefined && result.numericValue < 0) {
                return (
                  <span className="text-xs text-red-600 block mt-1">Berat tidak boleh kurang dari 0</span>
                );
              }
              if (result.numericValue !== undefined && result.numericValue === 0 && weightInputValue !== "") {
                return (
                  <span className="text-xs text-red-600 block mt-1">Berat harus lebih dari 0</span>
                );
              }
              return null;
            })()}
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Alasan Input Manual *
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan alasan mengapa perlu input manual (minimal 5 karakter)"
              className="min-h-[100px] resize-none"
            />
            {reason.trim().length > 0 && reason.trim().length < 5 && (
              <span className="text-xs text-red-600 block mt-1">
                Alasan harus minimal 5 karakter
              </span>
            )}
            <p className="text-xs text-gray-500">
              Minimal 5 karakter. Alasan ini akan tercatat untuk audit trail.
            </p>
          </div>
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
            disabled={isPending || !isValid}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Memproses..." : `Simpan Berat ${type === 'PRE' ? 'Awal' : 'Akhir'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
