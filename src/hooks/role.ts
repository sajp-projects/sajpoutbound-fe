import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";
import { Role } from "@/types/role";
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { fetchApi } from "@/utils/api";
import { useSearchParams } from "react-router";

// Interface untuk respons API roles dengan pagination
export interface RolesResponse {
  roles: Role[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query keys for caching
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

// Type for role update input based on backend Joi schema
export interface RoleUpdateInput {
  name?: string;
  description?: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
}

type ErrorData = JoiValidationError | CustomError;
type ApiErrorResponse = { message: string; errorType?: string; details?: Record<string, unknown> };

// Interface untuk respons API dengan errorType dan details
interface ApiErrorResult {
  success: boolean;
  message?: string;
  errorType?: string;
  details?: Record<string, unknown>;
  data?: Role | null;
}

// Helper functions
const handleApiError = (result: ApiResponse<unknown>, defaultMessage: string, specificErrors?: Record<string, string>): never => {
  const errorData = result.data as unknown as ErrorData;
  if (errorData.errorType && specificErrors?.[errorData.errorType]) {
    throw new Error(specificErrors[errorData.errorType]);
  }
  throw new Error(errorData.message || defaultMessage);
};

const createErrorResponse = (result: ApiErrorResult, defaultMessage: string): ApiErrorResponse => ({
  message: result.message || defaultMessage,
  errorType: result.errorType,
  details: result.details,
});

// Hook for fetching a single role
export function useRole({ id }: { id: string }, options?: Omit<UseQueryOptions<Role, Error, Role, ReturnType<typeof roleKeys.detail>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: roleKeys.detail(id.toString()),
    queryFn: async () => {
      const response = await fetchApi(`/roles/${id}`);
      const result: ApiResponse<Role> = await response.json();

      if (!result.success) {
        handleApiError(result, "An error occurred", { ROLE_NOT_FOUND: "Role not found" });
      }

      if (!result.data) {
        throw new Error("Role data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

// Hook for fetching roles with pagination
export function useRoles(options?: Omit<UseQueryOptions<RolesResponse, Error, RolesResponse, ReturnType<typeof roleKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return useQuery({
    queryKey: roleKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi("/roles", filters);

      if (!response.ok) {
        throw new Error(`Error fetching roles: ${response.statusText}`);
      }

      const result: ApiResponse<RolesResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "An error occurred");
      }

      if (!result.data?.roles) {
        throw new Error("Roles data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

// Create a new role
export function useCreateRole(options?: UseMutationOptions<Role, Error, CreateRoleInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData) => {
      const response = await fetchApi(
        "/roles",
        {},
        {
          method: "POST",
          body: JSON.stringify(roleData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(JSON.stringify(createErrorResponse(result, "Gagal membuat peran")));
      }

      if (!result.data) {
        throw new Error(JSON.stringify({ message: "Data peran tidak ditemukan" }));
      }

      return result.data as Role;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(roleKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    ...options,
  });
}

// Update a role
export function useUpdateRole(options?: UseMutationOptions<Role, Error, { id: string } & RoleUpdateInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      if (Object.keys(updateData).length === 0) {
        throw new Error(JSON.stringify({ message: "At least one field must be provided for update" }));
      }

      const response = await fetchApi(
        `/roles/${id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(JSON.stringify(createErrorResponse(result, "Gagal memperbarui peran")));
      }

      if (!result.data) {
        throw new Error(JSON.stringify({ message: "Data peran yang diperbarui tidak ditemukan" }));
      }

      return result.data as Role;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(roleKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    ...options,
  });
}

// Delete a role
export function useDeleteRole(options?: UseMutationOptions<Role, Error, { id: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(`/roles/${id}`, {}, { method: "DELETE" });
      const result: ApiResponse<Role> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus peran");
      }

      if (!result.data) {
        throw new Error("Data peran yang dihapus tidak ditemukan");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.removeQueries({ queryKey: roleKeys.detail(data.id) });
    },
    ...options,
  });
}
