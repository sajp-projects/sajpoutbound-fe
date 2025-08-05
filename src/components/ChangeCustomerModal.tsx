import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInfiniteCustomers } from "@/hooks/pelanggan";
import { useChangeCustomerAfterWeighing } from "@/hooks/pengiriman";
import { cn } from "@/lib/utils";
import { DeliveryOrder } from "@/types/do";
import { Customer } from "@/types/pelanggan";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

// Specialized Combobox for modal use - avoids modal-in-modal conflicts
function ModalCombobox({
  items,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder = "Cari...",
  isLoading,
  name,
  onClear,
  onSearch,
  useServerSearch = false,
}: {
  items: { label: string; value: string; secondary?: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
  name: string;
  onClear?: () => void;
  onSearch?: (query: string) => void;
  useServerSearch?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find((item) => item.value === value);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (useServerSearch && onSearch) {
        setSearching(true);

        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current);
        }

        searchTimerRef.current = setTimeout(() => {
          onSearch(query);
          setSearching(false);
          searchTimerRef.current = null;
        }, 300);
      }
    },
    [useServerSearch, onSearch]
  );

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSelect = (item: {
    label: string;
    value: string;
    secondary?: string;
  }) => {
    onValueChange(item.value);
    setOpen(false);
    // Don't clear search query to preserve it for next open
  };

  const filteredItems = useServerSearch
    ? items
    : items.filter((item) => {
        if (searchQuery === "") return true;
        const lowercaseQuery = searchQuery.toLowerCase().trim();
        return (
          item.label.toLowerCase().includes(lowercaseQuery) ||
          (item.secondary &&
            item.secondary.toLowerCase().includes(lowercaseQuery)) ||
          item.value.toLowerCase().includes(lowercaseQuery)
        );
      });

  return (
    <div className="relative" ref={containerRef}>
      <Button
        id={name}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="w-full justify-between h-10 text-left font-normal"
        type="button"
      >
        {selectedItem ? selectedItem.label : placeholder}
        <div className="flex ml-2">
          {value && onClear && (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClear();
                setOpen(false);
              }}
              className="flex items-center justify-center w-4 h-4 p-0 mr-1 text-gray-400 cursor-pointer hover:text-gray-500"
            >
              <X className="w-4 h-4" />
            </div>
          )}
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin opacity-70" />
          ) : (
            <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
          )}
        </div>
      </Button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div
            className="flex items-center gap-2 px-3 py-2 border-b border-gray-100"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 text-sm outline-none border-none bg-transparent placeholder:text-gray-400"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (filteredItems.length > 0) {
                    handleSelect(filteredItems[0]);
                  }
                }
              }}
              onKeyPress={(e) => {
                e.stopPropagation();
              }}
              onKeyUp={(e) => {
                e.stopPropagation();
              }}
              onInput={(e) => {
                e.stopPropagation();
              }}
            />
            {searching && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>

          {/* Items List */}
          <div
            className="max-h-48 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memuat...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-4 text-sm text-center text-gray-500">
                Tidak ada data yang cocok
              </div>
            ) : (
              <div>
                {filteredItems.map((item) => (
                  <div
                    key={item.value}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors",
                      value === item.value && "bg-blue-50 text-blue-600"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      {item.secondary && (
                        <div className="text-xs text-gray-500">
                          {item.secondary}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
              <ModalCombobox
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
