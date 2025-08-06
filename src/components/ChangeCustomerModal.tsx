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
import { fetchApi } from "@/utils/api";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Base query for initial data load
  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    error: customersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCustomers({
    enabled: isOpen,
    limit: 20,
    searchQuery: "", // Keep empty for stable query
  });

  // Update allCustomers when base data changes
  const baseCustomers = useMemo(() => {
    return customersData?.pages.flatMap((page) => page.customers) || [];
  }, [customersData]);

  useEffect(() => {
    if (baseCustomers.length > 0 && !searchQuery) {
      setAllCustomers(baseCustomers);
    }
  }, [baseCustomers, searchQuery]);

  // Handle search with manual API call
  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        // Reset to original data when search is cleared
        setAllCustomers(baseCustomers);
        return;
      }

      setIsSearching(true);
      try {
        // Manual API call for search using fetchApi utility
        const response = await fetchApi("/customers", {
          search: query,
          limit: "50",
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setAllCustomers(result.data.customers);
          }
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [baseCustomers]
  );

  // Search handler for combobox
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      performSearch(query);
    },
    [performSearch]
  );

  const resetSearch = useCallback(() => {
    setSearchQuery("");
    setAllCustomers(baseCustomers);
  }, [baseCustomers]);

  useEffect(() => {
    if (!isOpen) {
      resetSearch();
    }
  }, [isOpen, resetSearch]);

  const changeCustomerMutation = useChangeCustomerAfterWeighing({
    onSuccess: () => {
      showSuccessAlert(
        "Berhasil!",
        "Customer berhasil diubah setelah penimbangan"
      );
      onSuccess?.();
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

    const selectedCustomer = allCustomers.find(
      (c) => c.id === selectedCustomerId
    );
    const selectedCustomerName = selectedCustomer?.name || "Customer";

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
    });
  };

  const customerItems = useMemo(() => {
    return allCustomers.map((customer: Customer) => ({
      label: customer.name,
      value: customer.id,
      secondary: customer.address,
    }));
  }, [allCustomers]);

  const currentCustomer = useMemo(() => {
    if (deliveryOrder.customer) {
      return {
        id: deliveryOrder.customerId,
        name: deliveryOrder.customer.name,
        address: deliveryOrder.customer.address,
      } as Customer;
    }
  }, [deliveryOrder.customerId, deliveryOrder.customer]);

  // Set current customer as default selection when modal opens
  useEffect(() => {
    if (isOpen && deliveryOrder.customerId && !selectedCustomerId) {
      setSelectedCustomerId(deliveryOrder.customerId);
    }
  }, [isOpen, deliveryOrder.customerId, selectedCustomerId]);

  // Ensure selected customer is always in the items list
  const finalCustomerItems = useMemo(() => {
    const items = [...customerItems];

    // If we have a selected customer that's not in the current items list,
    // add it to ensure the combobox can display the selected value
    if (
      selectedCustomerId &&
      !items.find((item) => item.value === selectedCustomerId)
    ) {
      const selectedCustomer =
        currentCustomer ||
        baseCustomers.find((c) => c.id === selectedCustomerId) ||
        allCustomers.find((c) => c.id === selectedCustomerId);

      if (selectedCustomer) {
        items.unshift({
          label: selectedCustomer.name,
          value: selectedCustomer.id,
          secondary: selectedCustomer.address,
        });
      }
    }

    return items;
  }, [
    customerItems,
    selectedCustomerId,
    currentCustomer,
    baseCustomers,
    allCustomers,
  ]);

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
                  items={finalCustomerItems}
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
