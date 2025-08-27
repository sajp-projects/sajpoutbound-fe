import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { ArrowRightLeft, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/hooks/customer";
import { TransferItem } from "@/types/shipment";
import { formatInputNumber } from "@/utils/formatNumber";
import React from "react";

interface TransferItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferItems: TransferItem[];
  onTransfer: (targetCustomerId: string, items: TransferItem[]) => void;
  isLoading?: boolean;
}

interface TransferFormData {
  targetCustomerId: string;
}

const transferFormSchema = Joi.object<TransferFormData>({
  targetCustomerId: Joi.string().required().uuid().messages({
    "string.empty": "Customer tujuan harus dipilih",
    "string.guid": "Customer ID tidak valid",
    "any.required": "Customer tujuan harus dipilih",
  }),
});

export function TransferItemsModal({
  isOpen,
  onClose,
  transferItems,
  onTransfer,
  isLoading = false,
}: TransferItemsModalProps) {
  const [itemQuantities, setItemQuantities] = useState<Record<string, string>>({});
  const hasInitialized = React.useRef(false);

  // Fetch customers for selection
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers();
  const customers = customersData?.customers || [];

  const form = useForm<TransferFormData>({
    resolver: joiResolver(transferFormSchema),
    defaultValues: {
      targetCustomerId: "",
    },
  });

  // Initialize quantities only once when modal opens
    useEffect(() => {
    if (!hasInitialized.current && transferItems.length > 0) {
      const initialQuantities: Record<string, string> = {};
      transferItems.forEach((item) => {
        const key = `${item.deliveryOrderId}-${item.productId}`;
        initialQuantities[key] = "0";
      });
      setItemQuantities(initialQuantities);
      hasInitialized.current = true;
    }
  }, [transferItems]);

  // Reset initialization flag when modal closes
    useEffect(() => {
    if (!isOpen) {
      hasInitialized.current = false;
    }
  }, [isOpen]);

  const handleQuantityChange = (deliveryOrderId: string, productId: string, value: string) => {
    const key = `${deliveryOrderId}-${productId}`;

    console.log('handleQuantityChange called:', { deliveryOrderId, productId, value, key });

    // Allow any input while typing, including empty string
    setItemQuantities(prev => {
      console.log('Previous state:', prev);
      const newState = {
        ...prev,
        [key]: value,
      };
      console.log('New state:', newState);
      return newState;
    });
  };

  const handleSubmit = (data: TransferFormData) => {
    // Create updated transfer items with user-specified quantities
    const updatedItems = transferItems.map((item) => {
      const key = `${item.deliveryOrderId}-${item.productId}`;
      const quantityStr = itemQuantities[key] ?? item.quantity.toString();
      const quantity = parseFloat(quantityStr);

      return {
        ...item,
        quantity: isNaN(quantity) ? 0 : quantity, // Use 0 if NaN, otherwise use the parsed value
      };
    }).filter(item => item.quantity > 0); // Only include items with quantity > 0

    if (updatedItems.length === 0) {
      // Show error - no items to transfer
      return;
    }

    onTransfer(data.targetCustomerId, updatedItems);
  };

  // Check if there are any valid quantities to transfer
  const hasValidQuantities = transferItems.every((item) => {
    const key = `${item.deliveryOrderId}-${item.productId}`;
    const quantityStr = itemQuantities[key] ?? "0";
    const quantity = parseFloat(quantityStr);
    console.log('Validation check:', { key, quantityStr, quantity, isValid: !isNaN(quantity) && quantity > 0 });
    return !isNaN(quantity) && quantity > 0;
  });

  console.log('hasValidQuantities result:', hasValidQuantities);
  console.log('Current itemQuantities state:', itemQuantities);

  const handleClose = () => {
    form.reset();
    setItemQuantities({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto bg-white border-0 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            Transfer Items ke Customer Baru
          </DialogTitle>
          <DialogDescription>
            Transfer {transferItems.length} item dari pengiriman selesai ke customer yang berbeda.
            Atur kuantitas yang akan ditransfer untuk setiap item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label htmlFor="targetCustomerId" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Tujuan
            </Label>
            <Select
              value={form.watch("targetCustomerId")}
              onValueChange={(value) => form.setValue("targetCustomerId", value)}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoadingCustomers ? "Loading customers..." : "Pilih customer tujuan"
                } />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                    {customer.address && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {customer.address}
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.targetCustomerId && (
              <p className="text-sm text-red-600">
                {form.formState.errors.targetCustomerId.message}
              </p>
            )}
          </div>

          {/* Transfer Items Table */}
          <div className="space-y-2">
            <Label>Items yang akan ditransfer:</Label>
            <div className="border border-gray-200 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                      DO Number
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                      Customer Asal
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                      Produk
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                      Tersedia
                    </TableHead>
                    <TableHead className="px-4 py-3 text-sm font-semibold text-center text-gray-700">
                      Transfer
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferItems.map((item, index) => {
                    const key = `${item.deliveryOrderId}-${item.productId}`;
                    const currentQuantity = itemQuantities[key] ?? "0";

                    return (
                      <TableRow
                        key={key}
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100`}
                      >
                        <TableCell className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {item.doNumber}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600">
                          {item.customerName}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-gray-600 font-medium">
                          {item.productName}
                          <div className="text-xs text-gray-500">
                            Unit: {item.satuan}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                          {formatInputNumber(item.availableQuantity)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-sm text-center text-gray-600">
                          <div className="flex justify-center">
                            <Input
                              type="text"
                              value={currentQuantity}
                              onChange={(e) =>
                                handleQuantityChange(item.deliveryOrderId, item.productId, e.target.value)
                              }
                              min={0}
                              max={item.availableQuantity}
                              step="0.01"
                              className="w-20 text-center text-sm"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !form.watch("targetCustomerId") || !hasValidQuantities}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {isLoading ? "Processing..." : "Transfer Items"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}