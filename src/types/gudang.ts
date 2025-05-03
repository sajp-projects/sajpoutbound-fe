// type untuk gudang
import { Pagination } from './user';

export interface UserMinimal {
  id: string;
  name: string;
  email: string;
}

export interface Warehouse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: UserMinimal | null;
}

// Tipe untuk response yang berisi warehouses dan pagination
export interface WarehousesResponse {
  warehouses: Warehouse[];
  pagination: Pagination;
}

// Tipe untuk input pembuatan gudang baru
export interface CreateWarehouseInput {
  name: string;
  description: string;
  userId?: string;
}

// Tipe untuk update gudang
export interface UpdateWarehouseInput {
  name?: string;
  description?: string;
  userId?: string | null;
}
