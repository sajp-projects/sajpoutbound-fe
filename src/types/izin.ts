// Izin Type

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PermissionsResponse {
  permissions: Permission[];
  total: number;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
  updatedAt: string;
  permission?: Permission;
}
