import { Pagination } from "./user";

export interface UserLog {
  id: string;
  userId: string;
  performedById: string;
  createdAt: string;
  updatedAt: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | string;
  entityType: "USER" | "ROLE" | string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  description: string;
  performedBy: {
    id: string;
    name: string;
    email: string;
  };
}

// Interface untuk response log dengan pagination
export interface UserLogsResponse {
  logs: UserLog[];
  pagination: Pagination;
}
