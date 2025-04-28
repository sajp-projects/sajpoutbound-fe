// Izin Hook

import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";
import { Permission, PermissionsResponse, RolePermission } from "@/types/izin";
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { fetchApi } from "@/utils/api";
import { useSearchParams } from "react-router";

// Query keys for caching
export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...permissionKeys.lists(), { filters }] as const,
  rolePermissions: (roleId: string) => [...permissionKeys.all, "role", roleId] as const,
};

type ErrorData = JoiValidationError | CustomError;
type ApiErrorResponse = { message: string; errorType?: string; details?: Record<string, unknown> };

// Hook untuk mengambil semua izin dengan pagination
export function usePermissions(options?: Omit<UseQueryOptions<PermissionsResponse, Error, PermissionsResponse, ReturnType<typeof permissionKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";

  // Buat objek filters untuk query key
  const filters = {
    page,
    limit,
    search,
  };

  return useQuery({
    queryKey: permissionKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi("/permissions", {
        page,
        limit,
        search: search || undefined,
      });

      if (!response.ok) {
        throw new Error(`Error fetching permissions: ${response.statusText}`);
      }

      const result: ApiResponse<PermissionsResponse> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data || !result.data.permissions) {
        throw new Error("Permissions data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

// Hook untuk mengambil izin yang dimiliki oleh peran tertentu
export function useRolePermissions(roleId: string, options?: Omit<UseQueryOptions<Permission[], Error, Permission[], ReturnType<typeof permissionKeys.rolePermissions>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: permissionKeys.rolePermissions(roleId),
    queryFn: async () => {
      if (!roleId) return [];

      const response = await fetchApi(`/role-permissions/${roleId}`);

      if (!response.ok) {
        throw new Error(`Error fetching role permissions: ${response.statusText}`);
      }

      const result: ApiResponse<Permission[]> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      return result.data || [];
    },
    enabled: !!roleId,
    ...options,
  });
}

// Hook untuk menambahkan izin ke peran
export function useAddRolePermission(options?: UseMutationOptions<RolePermission[], Error, { roleId: string; permissionIds: string[] }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      const response = await fetchApi(
        "/role-permissions",
        {},
        {
          method: "POST",
          body: JSON.stringify({
            roleId,
            permissionIds,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        const errorResponse: ApiErrorResponse = {
          message: result.message || "Gagal menambahkan izin ke peran",
          errorType: result.errorType,
          details: result.details,
        };
        throw new Error(JSON.stringify(errorResponse));
      }

      return (result.data as RolePermission[]) || [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.rolePermissions(variables.roleId) });
    },
    ...options,
  });
}

// Hook untuk memperbarui izin peran secara massal
export function useUpdateRolePermissions(options?: UseMutationOptions<RolePermission[], Error, { roleId: string; permissionIds: string[] }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) => {
      const response = await fetchApi(
        `/role-permissions/${roleId}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify({
            permissionIds,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        const errorResponse: ApiErrorResponse = {
          message: result.message || "Gagal memperbarui izin peran",
          errorType: result.errorType,
          details: result.details,
        };
        throw new Error(JSON.stringify(errorResponse));
      }

      return (result.data as RolePermission[]) || [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.rolePermissions(variables.roleId) });
    },
    ...options,
  });
}

// Hook untuk menghapus izin dari peran
export function useDeleteRolePermission(options?: UseMutationOptions<boolean, Error, { roleId: string; permissionId: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
      const response = await fetchApi(
        `/role-permissions/${roleId}/${permissionId}`,
        {},
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!result.success) {
        const errorResponse: ApiErrorResponse = {
          message: result.message || "Gagal menghapus izin dari peran",
          errorType: result.errorType,
          details: result.details,
        };
        throw new Error(JSON.stringify(errorResponse));
      }

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.rolePermissions(variables.roleId) });
    },
    ...options,
  });
}
