export interface Driver {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DriverCreateInput {
  name: string;
}

export interface DriverUpdateInput {
  name?: string;
}

export interface DriversResponse {
  drivers: Driver[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ActiveDriversResponse {
  drivers: Driver[];
}