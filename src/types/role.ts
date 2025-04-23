export interface Role {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  users?: UserSchema[];
}

import { UserSchema } from "./user";
