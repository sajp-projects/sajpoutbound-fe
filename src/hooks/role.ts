import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";
import { Role } from "@/types/role";
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

// Query keys for caching
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

// Type for role update input based on backend Joi schema
export interface RoleUpdateInput {
  name?: string;
  description?: string;
}

type ErrorData = JoiValidationError | CustomError;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Hook for fetching a single role
export function useRole({ id }: { id: number }, options?: Omit<UseQueryOptions<Role, Error, Role, ReturnType<typeof roleKeys.detail>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`);

      const result: ApiResponse<Role> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        // Jika tipe error adalah ROLE_NOT_FOUND, berikan pesan yang lebih spesifik
        if (errorData.errorType === "ROLE_NOT_FOUND") {
          throw new Error("Role not found");
        }
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Role data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

// Hook for fetching all roles
export function useRoles(options?: Omit<UseQueryOptions<Role[], Error, Role[], ReturnType<typeof roleKeys.lists>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/roles`);
      if (!response.ok) {
        throw new Error(`Error fetching roles: ${response.statusText}`);
      }

      const result: ApiResponse<Role[]> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Roles data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

// Hook for creating a new role
export interface CreateRoleInput {
  name: string;
  description: string;
}

// Create a new role
export function useCreateRole(options?: UseMutationOptions<Role, Error, CreateRoleInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: CreateRoleInput) => {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      });
      if (!response.ok) {
        throw new Error(`Error creating role: ${response.statusText}`);
      }

      const result: ApiResponse<Role> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Created role data is missing");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(roleKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    ...options,
  });
}

// Update a role
export function useUpdateRole(options?: UseMutationOptions<Role, Error, { id: number } & RoleUpdateInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number } & RoleUpdateInput) => {
      const { id, ...updateData } = payload;

      // Validate that at least one field is provided
      if (Object.keys(updateData).length === 0) {
        throw new Error("At least one field must be provided for update");
      }

      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error(`Error updating role: ${response.statusText}`);
      }

      const result: ApiResponse<Role> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Updated role data is missing");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(roleKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    ...options,
  });
}

// Delete a role
export function useDeleteRole(options?: UseMutationOptions<Role, Error, { id: number }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse<Role> = await response.json();

      if (!response.ok || !result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "Gagal menghapus peran");
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
