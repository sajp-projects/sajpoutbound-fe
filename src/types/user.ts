export interface UserSchema {
  id: number;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  roleId: number;
}

export type User = Omit<UserSchema, "roleId" | "password">;

// Tipe untuk input pembuatan user baru
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: number;
}
