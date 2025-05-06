// Type untuk data armada

import { Pagination } from "./user";

export interface Armada {
  id: string;
  model: string;
  id_sl: string;
  plateNumber: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArmadasResponse {
  armadas: Armada[];
  pagination: Pagination;
}

export interface CreateArmadaInput {
  model: string;
  id_sl: string;
  plateNumber: string;
  description: string;
}

export interface UpdateArmadaInput {
  model?: string;
  id_sl?: string;
  plateNumber?: string;
  description?: string;
}
