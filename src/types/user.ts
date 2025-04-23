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

// Tipe yang menyertakan role dalam user
export type UserWithRole = User & {
  role: Role;
};

// Tipe untuk input pembuatan user baru
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

// Tipe untuk pagination
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Tipe untuk response yang berisi users dan pagination
export interface UsersResponse {
  users: UserWithRole[];
  pagination: Pagination;
}
