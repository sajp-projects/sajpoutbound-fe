import { XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";

interface CancelItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: "reflected" | "shipment-only") => void;
  productName: string;
  customerName: string;
  quantity: number;
  unit: string;
  isLoading?: boolean;
}

export function CancelItemModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  customerName,
  quantity,
  unit,
  isLoading = false,
}: CancelItemModalProps) {
  const handleCancelClick = async (mode: "reflected" | "shipment-only") => {
    const modeText =
      mode === "reflected"
        ? "Batalkan & Refleksikan ke DO"
        : "Batalkan dari Pengiriman Saja";

    const modeDescription =
      mode === "reflected"
        ? "Item akan dibatalkan dari pengiriman dan Delivery Order. Item tidak akan tersedia untuk dimuat ke pengiriman lain."
        : "Item hanya dibatalkan dari pengiriman ini. Kuantitas dikembalikan ke DO sebagai 'pending' dan bisa dimuat ke pengiriman lain.";

    // Close the modal first so SweetAlert can be on top
    onClose();

    // Small delay to ensure modal is closed before showing SweetAlert
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result = await showConfirmationAlert(
      `Konfirmasi ${modeText}`,
      `${modeDescription}\n\nBarang: ${productName}\nPelanggan: ${customerName}\nKuantitas: ${quantity} ${unit}\n\nTindakan ini tidak dapat dibatalkan!`,
      "Ya, Batalkan",
      "Batal"
    );

    if (isConfirmed(result)) {
      onConfirm(mode);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white border-0 p-0 rounded-lg shadow-lg">
        <div className="p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center text-xl font-semibold text-red-900">
              <XCircle className="mr-2 w-5 h-5 text-red-600" />
              Batalkan Item Pengiriman
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Pilih mode pembatalan untuk item ini
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Item Information */}
            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
              <h3 className="text-base font-medium text-red-800 mb-2">
                Informasi Item
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Barang: </span>
                  {productName}
                </p>
                <p>
                  <span className="font-medium">Pelanggan: </span>
                  {customerName}
                </p>
                <p>
                  <span className="font-medium">Kuantitas: </span>
                  {quantity} {unit}
                </p>
              </div>
            </div>

            {/* Cancel mode options */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Pilih Mode Pembatalan:
              </h3>

              <div className="space-y-3">
                {/* Mode 1: Reflected to DO */}
                <div className="p-4 border-2 border-red-200 rounded-lg hover:border-red-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Mode 1: Batalkan & Refleksikan ke DO
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Item dibatalkan dari pengiriman dan juga dari Delivery
                    Order. Item tidak akan tersedia untuk dimuat ke pengiriman
                    lain.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 mb-3 ml-4 list-disc">
                    <li>Item dihapus dari pengiriman dan DO</li>
                    <li>SPMB diregenerasi dengan tanda "(CANCELLED)"</li>
                    <li>Nota Timbangan tetap sebagai arsip</li>
                  </ul>
                  <Button
                    onClick={() => handleCancelClick("reflected")}
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    Batalkan & Refleksikan
                  </Button>
                </div>

                {/* Mode 2: Shipment Only */}
                <div className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Mode 2: Batalkan dari Pengiriman Saja
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Item hanya dibatalkan dari pengiriman ini. Kuantitas
                    dikembalikan ke DO sebagai "pending" dan bisa dimuat ke
                    pengiriman lain.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1 mb-3 ml-4 list-disc">
                    <li>Item dihapus dari pengiriman, dikembalikan ke DO</li>
                    <li>SPMB diregenerasi dengan tanda "(CANCELLED)"</li>
                    <li>Nota Timbangan tetap sebagai arsip</li>
                  </ul>
                  <Button
                    onClick={() => handleCancelClick("shipment-only")}
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    size="sm"
                  >
                    Batalkan dari Pengiriman
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="w-full"
            >
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
