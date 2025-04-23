import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";
import { Role } from "@/types/role";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

// Query keys for caching
export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
};

type ErrorData = JoiValidationError | CustomError;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Hook for fetching a single role
export function useRole({ id }: { id: number }, options?: Omit<UseQueryOptions<Role, Error, Role, ReturnType<typeof roleKeys.detail>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching role: ${response.statusText}`);
      }

      const result: ApiResponse<Role> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
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
