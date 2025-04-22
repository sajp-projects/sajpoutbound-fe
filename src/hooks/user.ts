import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";
import { Role } from "@/types/role";
import { User } from "@/types/user";
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

export type UserWithRole = User & {
  role: Role;
};

// Type for user update input based on backend Joi schema
export interface UserUpdateInput {
  name?: string;
  email?: string;
  roleId?: number;
}

type ErrorData = JoiValidationError | CustomError;

// Query keys for caching
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: Record<number, unknown>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  archived: () => [...userKeys.all, "archived"] as const,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export function useUser({ id }: { id: number }, options?: Omit<UseQueryOptions<UserWithRole, Error, UserWithRole, ReturnType<typeof userKeys.detail>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("User data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

export function useUsers(options?: Omit<UseQueryOptions<UserWithRole[], Error, UserWithRole[], ReturnType<typeof userKeys.lists>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole[]> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Users data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

// Create a new user
export function useCreateUser(options?: UseMutationOptions<UserWithRole, Error, import("@/types/user").CreateUserInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: import("@/types/user").CreateUserInput) => {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error(`Error creating user: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Created user data is missing");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      // Use the utility function to update cache
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    ...options,
  });
}

// Update an existing user
export function useUpdateUser(options?: UseMutationOptions<UserWithRole, Error, { id: number } & UserUpdateInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: number } & UserUpdateInput) => {
      const { id, ...updateData } = payload;

      // Validate that at least one field is provided
      if (Object.keys(updateData).length === 0) {
        throw new Error("At least one field must be provided for update");
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Updated user data is missing");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      // Use the utility function to update cache
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    ...options,
  });
}

// Delete a user
export function useDeleteUser(options?: UseMutationOptions<void, Error, { id: number }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Error deleting user: ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();

      // For delete operations, we just need to check success
      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "Failed to delete user");
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(variables.id) });
    },
    ...options,
  });
}

export function useArchivedUsers(options?: Omit<UseQueryOptions<UserWithRole[], Error, UserWithRole[], ReturnType<typeof userKeys.archived>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: userKeys.archived(),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/users/archived`);
      if (!response.ok) {
        throw new Error(`Error fetching archived users: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole[]> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Archived users data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

// Restore an archived user
export function useRestoreUser(options?: UseMutationOptions<void, Error, { id: number }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const response = await fetch(`${API_BASE_URL}/users/${id}/unarchived`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`Error restoring user: ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();

      // For restore operations, we just need to check success
      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "Failed to restore user");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.archived() });
    },
    ...options,
  });
}
