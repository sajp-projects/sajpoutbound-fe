import { Pagination } from "./user";
import { UserMinimal, Warehouse } from "./gudang";

export interface WarehouseLog {
  id: string;
  warehouseId: string;
  performedById: string;
  createdAt: string;
  updatedAt: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | string;
  entityType: "WAREHOUSE" | string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  description: string;
  warehouse: Partial<Warehouse>;
  performedBy: UserMinimal;
}

export interface WarehouseLogsResponse {
  logs: WarehouseLog[];
  pagination: Pagination;
}
