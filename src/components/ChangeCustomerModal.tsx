import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChangeCustomerAfterWeighing } from "@/hooks/shipment";
import { useStableCustomerSearch } from "@/hooks/useStableCustomerSearch";
import { Customer } from "@/types/customer";
import { DeliveryOrder } from "@/types/do";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { memo, useEffect, useMemo, useState } from "react";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { Combobox } from "./ui/combobox";

interface ChangeCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryOrder: DeliveryOrder;
  onSuccess?: () => void;
}

export const ChangeCustomerModal = memo(function ChangeCustomerModal({
  isOpen,
  onClose,
  deliveryOrder,
  onSuccess,
}: ChangeCustomerModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // Use stable customer search hook
  const {
    customers: allCustomers,
    isLoading: isLoadingCustomers,
    isSearching,
    error: customersError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    onSearch: handleSearch,
    resetSearch,
  } = useStableCustomerSearch({
    enabled: isOpen,
    limit: 20,
  });

  const changeCustomerMutation = useChangeCustomerAfterWeighing({
    onSuccess: () => {
      showSuccessAlert(
        "Berhasil!",
        "Customer berhasil diubah setelah penimbangan"
      );
      onSuccess?.(); // Call parent callback to trigger refetch
      onClose();
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Mengubah Customer",
        error.message || "Terjadi kesalahan saat mengubah customer"
      );
    },
  });

  const handleSubmit = () => {
    if (!selectedCustomerId) {
      showErrorAlert("Error", "Silakan pilih customer");
      return;
    }

    if (selectedCustomerId === deliveryOrder.customerId) {
      showErrorAlert(
        "Informasi",
        "Customer yang dipilih sama dengan customer saat ini. Tidak ada perubahan yang akan dibuat."
      );
      return;
    }

    // Get selected customer name for confirmation
    const selectedCustomer = allCustomers.find(
      (c) => c.id === selectedCustomerId
    );
    const selectedCustomerName = selectedCustomer?.name || "Customer";

    // Close modal first to show SweetAlert properly
    onClose();

    showConfirmationAlert(
      "Konfirmasi Ubah Customer",
      `Apakah Anda yakin ingin mengubah customer DO ini ke "${selectedCustomerName}"?`,
      "Ya, Ubah!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        changeCustomerMutation.mutate({
          deliveryOrderId: deliveryOrder.id,
          customerId: selectedCustomerId,
        });
      }
      // Note: If user cancels, modal stays closed (acceptable UX)
    });
  };

  // Use stable allCustomers state instead of reactive query data
  const customerItems = useMemo(() => {
    return allCustomers.map((customer: Customer) => ({
      label: customer.name,
      value: customer.id,
      secondary: customer.address,
    }));
  }, [allCustomers]);

  // Keep current customer stable - don't depend on search results
  const currentCustomer = useMemo(() => {
    // Always use the customer info from deliveryOrder, not from search results
    if (deliveryOrder.customer) {
      return {
        id: deliveryOrder.customerId,
        name: deliveryOrder.customer.name,
        address: deliveryOrder.customer.address,
      } as Customer;
    }

    // Fallback: try to find in allCustomers if deliveryOrder.customer is missing
    return allCustomers.find(
      (c: Customer) => c.id === deliveryOrder.customerId
    );
  }, [deliveryOrder.customerId, deliveryOrder.customer, allCustomers]);

  // Set current customer as default selection when modal opens
  useEffect(() => {
    if (isOpen && deliveryOrder.customerId && !selectedCustomerId) {
      setSelectedCustomerId(deliveryOrder.customerId);
    }
  }, [isOpen, deliveryOrder.customerId, selectedCustomerId]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetSearch();
    }
  }, [isOpen, resetSearch]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[550px] sm:w-[480px] sm:h-[520px] max-w-none bg-white">
        <DialogHeader>
          <DialogTitle>Ubah Customer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Customer Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Customer Saat Ini:
            </h4>
            <p className="text-sm text-gray-700">
              {currentCustomer?.name ||
                deliveryOrder.customer?.name ||
                "Unknown"}
            </p>
            {currentCustomer?.address && (
              <p className="text-sm text-gray-500 mt-1">
                {currentCustomer.address}
              </p>
            )}
          </div>

          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Pilih Customer Baru:
            </label>

            <div>
              {isLoadingCustomers && allCustomers.length === 0 ? (
                <LoadingState text="Memuat daftar customer..." />
              ) : customersError ? (
                <ErrorState
                  title="Gagal Memuat Customer"
                  message="Terjadi kesalahan saat memuat daftar customer"
                  onRetry={() => window.location.reload()}
                  retryButtonText="Coba Lagi"
                />
              ) : (
                <Combobox
                  items={customerItems}
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                  placeholder="Pilih customer baru..."
                  searchPlaceholder="Cari customer..."
                  isLoading={isSearching}
                  name="customerId"
                  onClear={() => setSelectedCustomerId("")}
                  useServerSearch={true}
                  onSearch={handleSearch}
                  hasMore={hasNextPage}
                  onLoadMore={fetchNextPage}
                  isLoadingMore={isFetchingNextPage}
                />
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-1">⚠️ Peringatan:</h4>
            <p className="text-sm text-amber-700">
              Mengubah customer akan mempengaruhi semua pengiriman terkait DO
              ini. Pastikan perubahan ini sudah sesuai dengan kebijakan
              perusahaan.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={changeCustomerMutation.isPending}
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={changeCustomerMutation.isPending || !selectedCustomerId}
          >
            {changeCustomerMutation.isPending ? "Mengubah..." : "Ubah Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
