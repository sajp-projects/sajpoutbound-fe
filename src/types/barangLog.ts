import { Pagination } from "./user";
import { UserMinimal } from "./gudang";
import { Product } from "./barang";

export interface ProductLog {
  id: string;
  productId: string;
  performedById: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | string;
  entityType: "PRODUCT" | string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  description: string;
  createdAt: string;
  product: Partial<Product>;
  performedBy: UserMinimal;
}

export interface ProductLogsResponse {
  logs: ProductLog[];
  pagination: Pagination;
}
