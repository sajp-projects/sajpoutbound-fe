import { Layers, Package, Scale } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface WeighingMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMethod: (method: "combined" | "individual") => void;
  productName: string;
  unweighedCount: number;
}

export function WeighingMethodModal({
  open,
  onOpenChange,
  onSelectMethod,
  productName,
  unweighedCount,
}: WeighingMethodModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] bg-white border-0 p-0 rounded-lg shadow-lg overflow-y-auto">
        <div className="p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
              <Scale className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="hidden sm:inline">Pilih Metode Penimbangan</span>
              <span className="sm:hidden">Metode Penimbangan</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Pilih cara penimbangan untuk produk:{" "}
              <span className="font-semibold break-words">{productName}</span>
              <br />
              <span className="text-xs sm:text-sm text-gray-500">
                {unweighedCount} item belum ditimbang
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-4">
            {/* Combined Weighing Option */}
            <div
              className="border border-gray-200 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 group"
              onClick={() => onSelectMethod("combined")}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 group-hover:text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-900">
                    Timbang Gabungan
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Menimbang semua item dari berbagai DO sekaligus dalam satu
                    penimbangan. Berat akan didistribusikan secara proporsional
                    berdasarkan kuantitas masing-masing item.
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Rekomendasi - Lebih Cepat
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Weighing Option */}
            <div
              className="border border-gray-200 rounded-lg p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 group"
              onClick={() => onSelectMethod("individual")}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover:text-purple-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-purple-900">
                    Timbang Satu per Satu
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Menimbang setiap item dari DO yang berbeda secara terpisah.
                    Memberikan kontrol lebih detail untuk setiap penimbangan.
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Detail - Lebih Teliti
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
