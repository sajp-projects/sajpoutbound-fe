import { Pagination } from "./user";

export interface DeliveryOrderLog {
  id: string;
  deliveryOrderId: string;
  performedById: string;
  createdAt: string;
  updatedAt: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | string;
  entityType: "DELIVERY_ORDER" | string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  description: string;
  performedBy: {
    id: string;
    name: string;
    email: string;
  };
  deliveryOrder?: {
    id: string;
    customer: {
      name: string;
    };
  };
}

export interface DeliveryOrderLogsResponse {
  logs: DeliveryOrderLog[];
  pagination: Pagination;
}
