import { Loader2, MapPin, Pencil, UserCheck } from "lucide-react";
import { Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
}

export function DeliveryOrderAccordion({
  shipmentItems,
  shipmentStatus,
  hasChangeCustomerAfterWeighAccess,
  hasReviseDoAfterWeighAccess,
  isLoadingFullDOHook,
  onOpenChangeCustomerModal,
  onOpenReviseModal,
}: DeliveryOrderAccordionProps) {
  // Group items by delivery order
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

  return (
    <>
      <h4 className="mb-4 text-lg font-medium text-gray-900">
        Daftar Delivery Order
      </h4>
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
                        {hasReviseDoAfterWeighAccess && (
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
                              {isLoadingFullDOHook ? "Loading..." : "Revisi DO"}
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryOrder.products.map(
                        (product: ProductItem, index: number) => (
                          <TableRow key={`${deliveryOrder.id}-${product.id}`}>
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
                              {product.chosenProduct ? (
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
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile view untuk product dalam DO */}
                <div className="sm:hidden">
                  <div className="p-4 space-y-3">
                    {deliveryOrder.products.map(
                      (product: ProductItem, index: number) => (
                        <div
                          key={`${deliveryOrder.id}-${product.id}`}
                          className="p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <div className="flex justify-center items-center mr-2 w-6 h-6 text-xs font-medium text-white bg-blue-600 rounded-full">
                                {index + 1}
                              </div>
                              <Link
                                to={`/barang/${product.id}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {product.name}
                              </Link>
                            </div>
                            {product.chosenProduct ? (
                              <Badge
                                variant="outline"
                                className="text-green-700 bg-green-50 border-green-200 text-center"
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
                        </div>
                      )
                    )}
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