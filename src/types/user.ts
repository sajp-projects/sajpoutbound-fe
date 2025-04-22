export interface UserSchema {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  roleId: number;
}

export type User = Omit<UserSchema, 'roleId'>;
