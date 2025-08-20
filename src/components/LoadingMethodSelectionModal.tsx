import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, List, Package, X } from "lucide-react";
import { useState } from "react";

export type LoadingMethod = "ALL" | "SELECTIVE";

interface LoadingMethodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  onSelectMethod: (method: LoadingMethod) => void;
}

export function LoadingMethodSelectionModal({
  isOpen,
  onClose,
  productName,
  onSelectMethod,
}: LoadingMethodSelectionModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<LoadingMethod | null>(null);

  const handleConfirm = () => {
    if (!selectedMethod) return;
    onSelectMethod(selectedMethod);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    onClose();
  };

  const methods = [
    {
      id: "ALL" as LoadingMethod,
      title: "Muat Semua DO",
      description: "Muat semua delivery order untuk produk ini sekaligus",
      icon: Package,
      color: "blue",
      recommended: false,
    },
    {
      id: "SELECTIVE" as LoadingMethod,
      title: "Muat Selektif",
      description: "Pilih delivery order tertentu yang ingin dimuat",
      icon: List,
      color: "green",
      recommended: true,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] bg-white border-0 p-0 rounded-lg shadow-lg">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
              <Package className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Pilih Metode Pemuatan
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Pilih bagaimana Anda ingin memuat barang <strong>{productName}</strong> yang memiliki beberapa DO
            </DialogDescription>
          </DialogHeader>

                    <div className="space-y-3 mb-6">
            {methods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;

              return (
                <div
                  key={method.id}
                  className={`relative border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                    isSelected
                      ? method.color === "blue"
                        ? "border-blue-300 bg-blue-50 shadow-md"
                        : "border-green-300 bg-green-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  {method.recommended && (
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Direkomendasikan
                      </span>
                    </div>
                  )}

                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      isSelected
                        ? method.color === "blue" ? "bg-blue-100" : "bg-green-100"
                        : "bg-gray-100"
                    }`}>
                      <Icon
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          isSelected
                            ? method.color === "blue" ? "text-blue-600" : "text-green-600"
                            : "text-gray-500"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-medium text-sm sm:text-base ${
                          isSelected
                            ? method.color === "blue" ? "text-blue-900" : "text-green-900"
                            : "text-gray-900"
                        }`}>
                          {method.title}
                        </h3>
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${method.color === "blue" ? "text-blue-600" : "text-green-600"}`} />
                        )}
                      </div>
                      <p className={`text-xs sm:text-sm ${
                        isSelected
                          ? method.color === "blue" ? "text-blue-700" : "text-green-700"
                          : "text-gray-600"
                      }`}>
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

                    <DialogFooter>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                <X className="mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedMethod}
                className={`flex-1 text-white shadow-md transition-all duration-200 hover:shadow-lg ${
                  selectedMethod === "ALL"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : selectedMethod === "SELECTIVE"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <Check className="mr-2 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {selectedMethod === "ALL"
                  ? "Muat Semua"
                  : selectedMethod === "SELECTIVE"
                  ? "Lanjut ke Pemilihan"
                  : "Pilih Metode"
                }
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}