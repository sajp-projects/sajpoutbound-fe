
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
