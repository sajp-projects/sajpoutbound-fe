import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingGroup } from "@/types/shipment";
import { formatInputNumber } from "@/utils/formatNumber";
import { Package, Scale, User, X } from "lucide-react";
import { useState } from "react";

interface LoadingGroupSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productUnit: string;
  loadingGroups: LoadingGroup[];
  onConfirm: (loadingGroupId: string) => void;
  isLoading?: boolean;
}

export function LoadingGroupSelectionModal({
  isOpen,
  onClose,
  productName,
  productUnit,
  loadingGroups,
  onConfirm,
  isLoading = false,
}: LoadingGroupSelectionModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleGroupSelection = (groupId: string) => {
    setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
  };

  const handleConfirm = () => {
    if (!selectedGroupId) return;
    const selectedGroup = loadingGroups.find((g) => g.id === selectedGroupId);
    if (!selectedGroup) return;

    onConfirm(selectedGroup.id);
    setSelectedGroupId(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedGroupId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[85vh] bg-white border-0 p-0 rounded-lg shadow-lg">
        <div className="flex flex-col max-h-[75vh]">
          <DialogHeader className="p-6 pb-4 border-b border-gray-100 flex-shrink-0">
            <DialogTitle className="flex items-center text-lg sm:text-xl font-semibold text-gray-900">
              <Scale className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              Pilih Grup Pemuatan - {productName}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600">
              Pilih grup pemuatan yang akan ditimbang. Grup dibentuk berdasarkan
              DO yang dimuat bersamaan.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {/* Info banner */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs sm:text-sm text-purple-900">
                <span className="font-medium">Catatan:</span> Anda hanya dapat
                menimbang DO yang dimuat bersamaan sebagai satu grup.
              </p>
            </div>

            {/* Loading Group List */}
            <div className="space-y-3">
              {!loadingGroups || loadingGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">
                    Tidak ada grup pemuatan yang tersedia
                  </p>
                </div>
              ) : (
                loadingGroups.map((group, index) => {
                  const isSelected = selectedGroupId === group.id;
                  const totalQuantity =
                    group.items?.reduce(
                      (sum, item) => sum + item.requestedQuantity,
                      0
                    ) || 0;
                  const doCount = group.doNumbers?.length || 0;

                  return (
                    <div
                      key={group.id}
                      className={`border rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
                        isSelected
                          ? "border-purple-300 bg-purple-50 ring-2 ring-purple-200"
                          : "border-gray-200 hover:border-purple-200 hover:bg-purple-25"
                      }`}
                      onClick={() => handleGroupSelection(group.id)}
                    >
                      <div className="space-y-3">
                        {/* Group Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">
                                Grup Pemuatan {index + 1}
                              </h4>
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap text-blue-700 bg-blue-50 border-blue-200"
                              >
                                {doCount} DO
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {group.items.length} item
                            </p>
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            <Badge
                              variant="outline"
                              className={`whitespace-nowrap text-xs sm:text-sm ${
                                isSelected
                                  ? "text-purple-700 bg-purple-100 border-purple-300"
                                  : "text-green-700 bg-green-50 border-green-200"
                              }`}
                            >
                              {formatInputNumber(totalQuantity)} {productUnit}
                            </Badge>
                          </div>
                        </div>

                        {/* DO List */}
                        <div className="space-y-2 pl-3 border-l-2 border-gray-200">
                          {group.doNumbers?.map((doNumber, doIndex) => (
                            <div
                              key={doIndex}
                              className="flex items-center gap-2"
                            >
                              <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 font-medium">
                                {doNumber}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Customer List */}
                        {group.customers && group.customers.length > 0 && (
                          <div className="flex items-start gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm">
                              {group.customers.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
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
                disabled={!selectedGroupId || isLoading}
                className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Scale className="mr-2 w-4 h-4" />
                    Timbang Grup Ini
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
