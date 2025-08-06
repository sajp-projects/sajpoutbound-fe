import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInfiniteCustomers } from "@/hooks/customer";
import { useChangeCustomerAfterWeighing } from "@/hooks/shipment";
import { Customer } from "@/types/customer";
import { DeliveryOrder } from "@/types/do";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { useEffect, useState } from "react";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";
import { Combobox } from "./ui/combobox";

interface ChangeCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryOrder: DeliveryOrder;
  onSuccess?: () => void;
}

export function ChangeCustomerModal({
  isOpen,
  onClose,
  deliveryOrder,
  onSuccess,
}: ChangeCustomerModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    error: customersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCustomers({
    enabled: isOpen,
    limit: 10,
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
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
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

  // Flatten all customers from infinite query pages
  const customers =
    customersData?.pages.flatMap((page) => page.customers) || [];
  const customerItems = customers.map((customer: Customer) => ({
    label: customer.name,
    value: customer.id,
    secondary: customer.address,
  }));
  const currentCustomer = customers.find(
    (c: Customer) => c.id === deliveryOrder.customerId
  );

  // Set current customer as default selection when modal opens
  useEffect(() => {
    if (isOpen && deliveryOrder.customerId && !selectedCustomerId) {
      setSelectedCustomerId(deliveryOrder.customerId);
    }
  }, [isOpen, deliveryOrder.customerId, selectedCustomerId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] bg-white border-0 rounded-lg shadow-lg"
        onOpenAutoFocus={(e) => {
          // Prevent auto-focus on modal open to allow combobox to work properly
          e.preventDefault();
        }}
      >
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

            {isLoadingCustomers ? (
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
                isLoading={isLoadingCustomers}
                name="customerId"
                onClear={() => setSelectedCustomerId("")}
                useServerSearch={false}
                hasMore={hasNextPage}
                onLoadMore={fetchNextPage}
                isLoadingMore={isFetchingNextPage}
              />
            )}
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
}
