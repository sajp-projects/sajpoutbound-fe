// Type untuk data log armada

import { Pagination } from "./user";
import { UserMinimal } from "./gudang";
import { Armada } from "./armada";

export interface ArmadaLog {
  id: string;
  armadaId: string;
  performedById: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | string;
  entityType: "ARMADA" | string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  description: string;
  createdAt: string;
  armada?: Partial<Armada>;
  performedBy: UserMinimal;
}

export interface ArmadaLogsResponse {
  armadaLogs: ArmadaLog[];
  pagination: Pagination;
}
