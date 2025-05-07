import { Pagination } from "./user";
import { Customer } from "./pelanggan";

export interface CustomerLog {
  id: string;
  customerId: string;
  performedById: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | string;
  entityType: "CUSTOMER" | string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  description: string;
  createdAt: string;
  customer: Customer;
  performedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CustomerLogsResponse {
  customerLogs: CustomerLog[];
  pagination: Pagination;
}
