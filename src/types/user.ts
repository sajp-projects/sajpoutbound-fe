import { Role } from "./role";

export interface UserSchema {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  roleId: string;
  warehouseId?: string | null;
}

export type User = Omit<UserSchema, "roleId" | "password">;

export type UserWithRole = User & {
  role: Role;
  warehouseId?: string | null;
};

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
  warehouseId?: string | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsersResponse {
  users: UserWithRole[];
  pagination: Pagination;
}
