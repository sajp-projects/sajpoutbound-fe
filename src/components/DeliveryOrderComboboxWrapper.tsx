import { Combobox, ComboboxItem } from "@/components/ui/combobox";

interface DeliveryOrderComboboxWrapperProps {
  field: { value: string; onChange: (value: string) => void };
  index: number;
  deliveryOrders: ComboboxItem[];
  loadingDeliveryOrders: boolean;
  hasNextDeliveryOrders: boolean;
  isFetchingNextDeliveryOrders: boolean;
  onDeliveryOrderChange: (value: string, index: number) => void;
  onDeliveryOrderSearch: (query: string) => void;
  onLoadMore: () => void;
  onClear: (index: number) => void;
}

export function DeliveryOrderComboboxWrapper({
  field,
  index,
  deliveryOrders,
  loadingDeliveryOrders,
  hasNextDeliveryOrders,
  isFetchingNextDeliveryOrders,
  onDeliveryOrderChange,
  onDeliveryOrderSearch,
  onLoadMore,
  onClear,
}: DeliveryOrderComboboxWrapperProps) {
  const handleClear = () => {
    onClear(index);
  };

  return (
    <div className="relative">
      <Combobox
        items={deliveryOrders}
        value={field.value}
        onValueChange={(value) => onDeliveryOrderChange(value, index)}
        placeholder="Pilih Delivery Order"
        searchPlaceholder="Cari DO..."
        isLoading={loadingDeliveryOrders}
        name={`deliveryOrders.${index}.deliveryOrderId`}
        onClear={handleClear}
        onSearch={onDeliveryOrderSearch}
        useServerSearch
        hasMore={hasNextDeliveryOrders}
        onLoadMore={onLoadMore}
        isLoadingMore={isFetchingNextDeliveryOrders}
      />
    </div>
  );
}