import { Pagination } from "./user";

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
  users?: UserMinimal[];
  products?: Product[];
}

export interface WarehousesResponse {
  warehouses: Warehouse[];
  pagination: Pagination;
}

export interface CreateWarehouseInput {
  name: string;
  description: string;
}

export interface UpdateWarehouseInput {
  name?: string;
  description?: string;
}

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


export interface WarehouseProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface WarehouseUsersResponse {
  users: UserMinimal[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}