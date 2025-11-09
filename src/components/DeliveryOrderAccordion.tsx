import {
  ArrowRightLeft,
  Loader2,
  MapPin,
  MinusCircle,
  Pencil,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, SimpleCheckbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GroupedDeliveryOrder,
  ProductItem,
  ShipmentItem,
  TransferItem,
} from "@/types/shipment";
import { formatInputNumber } from "@/utils/formatNumber";

interface DeliveryOrderAccordionProps {
  shipmentItems: ShipmentItem[];
  shipmentStatus: string;
  hasChangeCustomerAfterWeighAccess: boolean;
  hasReviseDoAfterWeighAccess: boolean;
  isLoadingFullDOHook: boolean;
  onOpenChangeCustomerModal: (deliveryOrder: GroupedDeliveryOrder) => void;
  onOpenReviseModal: (deliveryOrder: GroupedDeliveryOrder) => void;
  // Transfer items props
  selectedTransferItems: TransferItem[];
  onTransferItemSelect: (item: TransferItem, checked: boolean) => void;
  onOpenTransferItemsModal: () => void;
  hasTransferItemsAccess?: boolean;
  // Reduce quantity props
  onOpenReduceQuantityModal?: (
    shipmentItem: ShipmentItem,
    product: ProductItem,
    deliveryOrder: GroupedDeliveryOrder
  ) => void;
  hasReduceQuantityAccess?: boolean;
  // Cancel item props
  onOpenCancelItemModal?: (
    shipmentItem: ShipmentItem,
    product: ProductItem,
    deliveryOrder: GroupedDeliveryOrder
  ) => void;
  hasCancelItemAccess?: boolean;
}

export function DeliveryOrderAccordion({
  shipmentItems,
  shipmentStatus,
  hasChangeCustomerAfterWeighAccess,
  hasReviseDoAfterWeighAccess,
  isLoadingFullDOHook,
  onOpenChangeCustomerModal,
  onOpenReviseModal,
  selectedTransferItems,
  onTransferItemSelect,
  onOpenTransferItemsModal,
  hasTransferItemsAccess = false,
  onOpenReduceQuantityModal,
  hasReduceQuantityAccess = false,
  onOpenCancelItemModal,
  hasCancelItemAccess = false,
}: DeliveryOrderAccordionProps) {
  // Group items by delivery order
  // Include all items (even cancelled) to display them with "Dibatalkan" badge
  const doMap = new Map<string, GroupedDeliveryOrder>();

  shipmentItems.forEach((item) => {
    const doId = item.deliveryOrderId;
    if (!doMap.has(doId)) {
      doMap.set(doId, {
        id: doId,
        doNumber: item.deliveryOrder.doNumber,
        customer: item.deliveryOrder.customer,
        products: [],
      });
    }

    doMap.get(doId)?.products.push({
      id: item.productId,
      name: item.product.name,
      satuan: item.product.satuan,
      quantity: item.requestedQuantity,
      warehouseId: item.warehouseId,
      chosenProduct: item.chosenProduct,
      locationType: item.locationType,
      warehouse: item.warehouse,
    });
  });

  const groupedDeliveryOrders = Array.from(doMap.values());

  // Helper function to check if an item is selected for transfer
  const isItemSelected = (
    deliveryOrderId: string,
    productId: string
  ): boolean => {
    return selectedTransferItems.some(
      (item) =>
        item.deliveryOrderId === deliveryOrderId && item.productId === productId
    );
  };

  // Helper function to create transfer item from product data
  const createTransferItem = (
    deliveryOrder: GroupedDeliveryOrder,
    product: ProductItem,
    shipmentItem: ShipmentItem
  ): TransferItem => {
    // For completed shipments, we'll use the requestedQuantity as available quantity
    // In a real implementation, you'd want to get the completedQuantity from the backend
    const availableQuantity = shipmentItem.requestedQuantity;

    return {
      deliveryOrderId: deliveryOrder.id,
      productId: product.id,
      productName: product.name,
      doNumber: deliveryOrder.doNumber,
      customerName: deliveryOrder.customer.name,
      availableQuantity,
      quantity: availableQuantity, // Default to transfer all available
      satuan: product.satuan,
    };
  };

  // Helper function to check if an item can be transferred
  // Items cannot be transferred if they are cancelled or have cancelledQuantity > 0
  const canItemBeTransferred = (shipmentItem: ShipmentItem): boolean => {
    // Check if item status is CANCELLED
    if (shipmentItem.status === "CANCELLED") {
      return false;
    }
    
    // Check if item has been cancelled in the delivery order
    // This requires checking the delivery order items for cancelledQuantity
    // Since we don't have direct access to DO items here, we rely on status
    // The backend will validate this on transfer anyway
    
    return true;
  };

  // Check if there are any items that can be transferred
  const hasTransferableItems =
    shipmentStatus === "SELESAI" &&
    groupedDeliveryOrders.some((deliveryOrder) =>
      deliveryOrder.products.some((product) => product.chosenProduct)
    );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          Daftar Delivery Order
        </h4>
        {/* Transfer Items button - only show for completed shipments with selected items */}
        {hasTransferItemsAccess &&
          hasTransferableItems &&
          selectedTransferItems.length > 0 && (
            <Button
              onClick={onOpenTransferItemsModal}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfer {selectedTransferItems.length} Item
              {selectedTransferItems.length > 1 ? "s" : ""}
            </Button>
          )}
      </div>
      <Accordion type="multiple" className="space-y-4">
        {groupedDeliveryOrders.map(
          (deliveryOrder: GroupedDeliveryOrder, doIndex: number) => (
            <AccordionItem
              key={deliveryOrder.id}
              value={`do-${doIndex}`}
              className="overflow-hidden rounded-lg border border-gray-200"
            >
              <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100 hover:no-underline">
                <div className="flex items-center justify-between w-full text-left">
                  <div className="min-w-0 flex-1 mr-2">
                    <h4 className="font-medium text-gray-900">
                      <Link
                        to={`/do/${deliveryOrder.id}`}
                        className="text-blue-600 hover:underline inline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {deliveryOrder.customer.name.length > 25
                          ? deliveryOrder.customer.name.slice(0, 20) + "..."
                          : deliveryOrder.customer.name}
                      </Link>
                    </h4>
                    <p className="hidden sm:block text-sm text-gray-500 truncate">
                      {deliveryOrder.customer.name}
                    </p>
                  </div>

                  {/* Action buttons for customer change and DO revision */}
                  {(shipmentStatus === "PROSES" ||
                    shipmentStatus === "SELESAI") &&
                    deliveryOrder.products.some(
                      (product) => product.chosenProduct
                    ) && (
                      <div
                        className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hasChangeCustomerAfterWeighAccess && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-shrink-0 min-w-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenChangeCustomerModal(deliveryOrder);
                            }}
                            disabled={isLoadingFullDOHook}
                            title="Ubah Customer"
                          >
                            {isLoadingFullDOHook ? (
                              <Loader2 className="w-3 h-3 animate-spin sm:mr-1" />
                            ) : (
                              <UserCheck className="w-3 h-3 sm:mr-1" />
                            )}
                            <span className="hidden sm:inline ml-1">
                              {isLoadingFullDOHook
                                ? "Loading..."
                                : "Ubah Customer"}
                            </span>
                          </Button>
                        )}
                        {hasReviseDoAfterWeighAccess &&
                          !shipmentItems
                            .filter(
                              (item) => item.deliveryOrderId === deliveryOrder.id
                            )
                            .every((item) => item.status === "CANCELLED") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50 flex-shrink-0 min-w-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenReviseModal(deliveryOrder);
                              }}
                              disabled={isLoadingFullDOHook}
                              title="Revisi DO"
                            >
                              {isLoadingFullDOHook ? (
                                <Loader2 className="w-3 h-3 animate-spin sm:mr-1" />
                              ) : (
                                <Pencil className="w-3 h-3 sm:mr-1" />
                              )}
                              <span className="hidden sm:inline ml-1">
                                {isLoadingFullDOHook
                                  ? "Loading..."
                                  : "Revisi DO"}
                              </span>
                            </Button>
                          )}
                      </div>
                    )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="hidden overflow-x-auto sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        {/* Transfer checkbox column - only show for completed shipments */}
                        {hasTransferItemsAccess && hasTransferableItems && (
                          <TableHead className="w-[50px] py-3 px-4 text-center font-semibold text-gray-700 text-sm">
                            Transfer
                          </TableHead>
                        )}
                        <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                          No
                        </TableHead>
                        <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                          Barang
                        </TableHead>
                        <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                          Gudang
                        </TableHead>
                        <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                          Lokasi
                        </TableHead>
                        <TableHead className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                          Kuantitas
                        </TableHead>
                        <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                          Status
                        </TableHead>
                        {/* Actions column for reduce quantity or cancel - only show for chosen items */}
                        {(hasReduceQuantityAccess || hasCancelItemAccess) && (
                          <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                            Aksi
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryOrder.products.map(
                        (product: ProductItem, index: number) => {
                          // Find the corresponding shipment item
                          const shipmentItem = shipmentItems.find(
                            (item) =>
                              item.deliveryOrderId === deliveryOrder.id &&
                              item.productId === product.id
                          );

                          const isSelected = isItemSelected(
                            deliveryOrder.id,
                            product.id
                          );
                          const canBeTransferred =
                            product.chosenProduct &&
                            hasTransferItemsAccess &&
                            hasTransferableItems &&
                            shipmentItem &&
                            canItemBeTransferred(shipmentItem);
                          const isDisabled =
                            shipmentItem?.requestedQuantity === 0 ||
                            shipmentItem?.status === "CANCELLED";

                          return (
                            <TableRow
                              key={`${deliveryOrder.id}-${product.id}`}
                              className={
                                isDisabled ? "opacity-50 bg-gray-50" : ""
                              }
                            >
                              {/* Transfer checkbox column */}
                              {hasTransferItemsAccess &&
                                hasTransferableItems && (
                                  <TableCell className="pl-2 pr-2 py-3 text-center">
                                    {canBeTransferred &&
                                    shipmentItem &&
                                    !isDisabled ? (
                                      <SimpleCheckbox
                                        checked={isSelected}
                                        onCheckedChange={(checked: boolean) => {
                                          const transferItem =
                                            createTransferItem(
                                              deliveryOrder,
                                              product,
                                              shipmentItem
                                            );
                                          onTransferItemSelect(
                                            transferItem,
                                            checked
                                          );
                                        }}
                                      />
                                    ) : (
                                      <div className="w-4 h-4" /> // Empty space for items that can't be transferred
                                    )}
                                  </TableCell>
                                )}
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                {index + 1}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                <Link
                                  to={`/barang/${product.id}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {product.name}
                                </Link>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                {product.warehouse.name}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                  {product.locationType || "GUDANG"}
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                                {formatInputNumber(product.quantity)}{" "}
                                {product.satuan}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                                {shipmentItem?.status === "CANCELLED" ? (
                                  <Badge
                                    variant="outline"
                                    className="text-red-700 bg-red-50 border-red-200"
                                  >
                                    Dibatalkan
                                  </Badge>
                                ) : product.chosenProduct ? (
                                  <Badge
                                    variant="outline"
                                    className="text-green-700 bg-green-50 border-green-200"
                                  >
                                    Sudah Dimuat
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-yellow-700 bg-yellow-50 border-yellow-200 text-center"
                                  >
                                    Belum Dimuat
                                  </Badge>
                                )}
                              </TableCell>

                              <TableCell className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  {/* Reduce quantity button - show for chosen items that aren't weighted yet */}
                                  {hasReduceQuantityAccess &&
                                    shipmentItem &&
                                    shipmentItem.chosenProduct &&
                                    !shipmentItem.weightedQuantity &&
                                    shipmentItem.status !== "CANCELLED" &&
                                    onOpenReduceQuantityModal &&
                                    !isDisabled && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenReduceQuantityModal(
                                            shipmentItem,
                                            product,
                                            deliveryOrder
                                          );
                                        }}
                                        title="Kurangi Kuantitas"
                                      >
                                        <MinusCircle className="w-3 h-3" />
                                        <span className="hidden sm:inline ml-1">
                                          Kurangi
                                        </span>
                                      </Button>
                                    )}

                                  {/* Cancel button */}
                                  {hasCancelItemAccess &&
                                    shipmentItem?.status !== "CANCELLED" &&
                                    onOpenCancelItemModal && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onOpenCancelItemModal(
                                            shipmentItem!,
                                            product,
                                            deliveryOrder
                                          );
                                        }}
                                        title="Batalkan Item"
                                      >
                                        <XCircle className="w-3 h-3" />
                                        <span className="hidden sm:inline ml-1">
                                          Batalkan
                                        </span>
                                      </Button>
                                    )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile view untuk product dalam DO */}
                <div className="sm:hidden">
                  <div className="p-4 space-y-3">
                    {deliveryOrder.products.map((product: ProductItem) => {
                      // Find the corresponding shipment item for mobile view too
                      const shipmentItem = shipmentItems.find(
                        (item) =>
                          item.deliveryOrderId === deliveryOrder.id &&
                          item.productId === product.id
                      );

                      const isSelected = isItemSelected(
                        deliveryOrder.id,
                        product.id
                      );
                      const canBeTransferred =
                        product.chosenProduct &&
                        hasTransferItemsAccess &&
                        hasTransferableItems &&
                        shipmentItem &&
                        canItemBeTransferred(shipmentItem);
                      const isDisabled =
                        shipmentItem?.requestedQuantity === 0 ||
                        shipmentItem?.status === "CANCELLED";

                      return (
                        <div
                          key={`${deliveryOrder.id}-${product.id}`}
                          className={`p-3 rounded-lg border border-gray-200 ${
                            isDisabled ? "opacity-50 bg-gray-50" : ""
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              {/* Transfer checkbox for mobile */}
                              {hasTransferItemsAccess &&
                                hasTransferableItems &&
                                canBeTransferred &&
                                shipmentItem &&
                                !isDisabled && (
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked: boolean) => {
                                      const transferItem = createTransferItem(
                                        deliveryOrder,
                                        product,
                                        shipmentItem
                                      );
                                      onTransferItemSelect(
                                        transferItem,
                                        checked
                                      );
                                    }}
                                    className="mr-3"
                                  />
                                )}
                              <Link
                                to={`/barang/${product.id}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {product.name}
                              </Link>
                            </div>
                            {shipmentItem?.status === "CANCELLED" ? (
                              <Badge
                                variant="outline"
                                className="text-red-700 bg-red-50 border-red-200 text-center text-xs whitespace-nowrap px-1"
                              >
                                Dibatalkan
                              </Badge>
                            ) : product.chosenProduct ? (
                              <Badge
                                variant="outline"
                                className="text-green-700 bg-green-50 border-green-200 text-center text-xs whitespace-nowrap px-1"
                              >
                                Sudah Dimuat
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-yellow-700 bg-yellow-50 border-yellow-200 text-center text-xs whitespace-nowrap px-1"
                              >
                                Belum Dimuat
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>
                              <span className="font-medium">Gudang: </span>
                              {product.warehouse.name}
                            </p>
                            <p>
                              <span className="font-medium">Lokasi: </span>
                              <span className="flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                {product.locationType || "GUDANG"}
                              </span>
                            </p>
                            <p>
                              <span className="font-medium">Kuantitas: </span>
                              {formatInputNumber(product.quantity)}{" "}
                              {product.satuan}
                            </p>
                          </div>

                          {/* Action buttons for mobile - reduce quantity and cancel */}
                          {(hasReduceQuantityAccess || hasCancelItemAccess) &&
                            product.chosenProduct &&
                            shipmentItem &&
                            !isDisabled && (
                              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                {/* Reduce quantity button for mobile - show for chosen items that aren't weighted yet */}
                                {hasReduceQuantityAccess &&
                                  !shipmentItem.weightedQuantity &&
                                  onOpenReduceQuantityModal && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-orange-600 border-orange-200 hover:bg-orange-50 w-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenReduceQuantityModal(
                                          shipmentItem,
                                          product,
                                          deliveryOrder
                                        );
                                      }}
                                    >
                                      <MinusCircle className="w-3 h-3 mr-2" />
                                      Kurangi Kuantitas
                                    </Button>
                                  )}

                                {/* Cancel button for mobile - only show for items that have been CHOSEN (loaded) but not yet COMPLETED or CANCELLED */}
                                {hasCancelItemAccess &&
                                  product.chosenProduct &&
                                  shipmentItem.status === "CHOSEN" &&
                                  onOpenCancelItemModal && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-200 hover:bg-red-50 w-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenCancelItemModal(
                                          shipmentItem,
                                          product,
                                          deliveryOrder
                                        );
                                      }}
                                    >
                                      <XCircle className="w-3 h-3 mr-2" />
                                      Batalkan Item
                                    </Button>
                                  )}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        )}
      </Accordion>
    </>
  );
}
