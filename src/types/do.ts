import { Pagination } from "./user";

export type DeliveryOrderStatus = "PENDING" | "PROSES" | "COMPLETED";

export interface DeliveryOrderProduct {
  id: string;
  deliveryOrderId: string;
  productId: string;
  quantity: number;
  pendingQuantity: number;
  processingQuantity: number;
  completedQuantity: number;
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
  customerId: string;
  address: string;
  internalNote: string;
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
  items: CreateDeliveryOrderProduct[];
}

export interface UpdateDeliveryOrderInput {
  customerId?: string;
  address?: string;
  internalNote?: string;
  items?: CreateDeliveryOrderProduct[];
}
