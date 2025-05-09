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
  products?: Product[];
}

export interface WarehousesResponse {
  warehouses: Warehouse[];
  pagination: Pagination;
}

export interface CreateWarehouseInput {
  name: string;
  description: string;
  userId?: string;
}

export interface UpdateWarehouseInput {
  name?: string;
  description?: string;
  userId?: string | null;
}

// Interface untuk produk yang ada di gudang
export interface Product {
  id: string;
  name: string;
  id_sl: string | null;
  description: string;
  satuan: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
}
