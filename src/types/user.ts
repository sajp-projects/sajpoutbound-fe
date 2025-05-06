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
}

export type User = Omit<UserSchema, "roleId" | "password">;


export type UserWithRole = User & {
  role: Role;
};


export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
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
