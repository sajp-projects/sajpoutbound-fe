import { Pagination } from "./user";

export interface Customer {
  id: string;
  name: string;
  id_sl: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  id_sl?: string;
  address: string;
}

export interface CustomerUpdateInput {
  name?: string;
  id_sl?: string;
  address?: string;
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: Pagination;
}
