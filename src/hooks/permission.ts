import { BASE_URL } from "@/constant/baseUrl";
import { ApiErrorResponse, ApiResponse } from "@/types/api";
import {
  Permission,
  PermissionsResponse,
  RolePermission,
} from "@/types/permission";
import { fetchApi } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router";

export const permissionKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...permissionKeys.lists(), { filters }] as const,
  rolePermissions: (roleId: string) =>
    [...permissionKeys.all, "role", roleId] as const,
};

export function usePermissions(
  options?: Omit<
    UseQueryOptions<
      PermissionsResponse,
      Error,
      PermissionsResponse,
      ReturnType<typeof permissionKeys.list>
    >,
    "queryKey" | "queryFn"
  >
) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
    search: searchParams.get("search") || "",
  };

  return useQuery({
    queryKey: permissionKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/permissions`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching permissions: ${response.statusText}`);
      }

      const result: ApiResponse<PermissionsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "An error occurred");
      }

      if (!result.data?.permissions) {
        throw new Error("Permissions data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

export function useRolePermissions(
  roleId: string,
  options?: Omit<
    UseQueryOptions<
      Permission[],
      Error,
      Permission[],
      ReturnType<typeof permissionKeys.rolePermissions>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: permissionKeys.rolePermissions(roleId),
    queryFn: async () => {
      if (!roleId) return [];

      const response = await fetchApi(`${BASE_URL}/role-permissions/${roleId}`);

      if (!response.ok) {
        throw new Error(
          `Error fetching role permissions: ${response.statusText}`
        );
      }

      const result: ApiResponse<Permission[]> = await response.json();

      if (!result.success) {
        handleApiError(result, "An error occurred");
      }

      return result.data || [];
    },
    enabled: !!roleId,
    ...options,
  });
}

export function useUpdateRolePermissions(
  options?: UseMutationOptions<
    RolePermission[],
    Error,
    { roleId: string; permissionIds: string[] }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, permissionIds }) => {
      const response = await fetchApi(
        `${BASE_URL}/role-permissions/${roleId}/update-all`,
        {},
        {
          method: "PUT",
          body: JSON.stringify({ permissionIds }),
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
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: permissionKeys.rolePermissions(roleId),
      });
    },
    ...options,
  });
}
