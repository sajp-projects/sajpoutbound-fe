// type untuk barang
import { Pagination } from "./user";

export interface Warehouse {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number | string;
  quantity: number;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  warehouse: Warehouse;
}

// Tipe untuk response yang berisi products dan pagination
export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

// Tipe untuk input pembuatan barang baru
export interface CreateProductInput {
  name: string;
  sku: string;
  description: string;
  price: number;
  quantity: number;
  warehouseId: string;
}

// Tipe untuk update barang
export interface UpdateProductInput {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  quantity?: number;
  warehouseId?: string;
}
