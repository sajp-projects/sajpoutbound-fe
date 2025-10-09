import { Pagination } from "./user";

export type DeliveryOrderStatus =
  | "PENDING"
  | "PROSES"
  | "COMPLETED"
  | "SELESAI";

export interface DeliveryOrderProduct {
  id: string;
  deliveryOrderId: string;
  productId: string;
  quantity: number;
  pendingQuantity: number;
  processingQuantity: number;
  completedQuantity: number;
  cancelledQuantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    satuan: string;
  };
}

export interface DeliveryOrder {
  id: string;
  doNumber: string;
  customerId: string;
  address: string;
  internalNote: string;
  deliverySchedule?: Date;
  status?: DeliveryOrderStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  customer: {
    id: string;
    name: string;
    address?: string;
  };
  items: DeliveryOrderProduct[];
}

export interface DeliveryOrdersResponse {
  deliveryOrders: DeliveryOrder[];
  pagination: Pagination;
}

export interface CreateDeliveryOrderProduct {
  productId: string;
  quantity: number;
}

export interface CreateDeliveryOrderInput {
  customerId: string;
  address: string;
  internalNote: string;
  deliverySchedule?: Date;
  items: CreateDeliveryOrderProduct[];
}

export interface UpdateDeliveryOrderInput {
  customerId?: string;
  address?: string;
  internalNote?: string;
  deliverySchedule?: Date;
  items?: CreateDeliveryOrderProduct[];
}

export interface RevisedItem {
  id: string;
  productId: string; // Add productId for mapping to shipment items
  productName: string;
  originalQuantity: number;
  revisedQuantity: number;
  completedQuantity: number;
  processingQuantity: number;
  pendingQuantity: number;
  unit: string;
  estimatedWeight?: number;
}
