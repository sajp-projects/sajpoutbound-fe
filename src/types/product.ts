import { Pagination } from "./user";

export interface Warehouse {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  id_sl: string;
  description: string;
  satuan: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  warehouse: Warehouse;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface CreateProductInput {
  name: string;
  id_sl?: string;
  description: string;
  satuan: string;
  warehouseId: string;
}

export interface UpdateProductInput {
  name?: string;
  id_sl?: string;
  description?: string;
  satuan?: string;
  warehouseId?: string;
}
