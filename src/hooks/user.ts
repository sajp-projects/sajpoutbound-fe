import { ApiResponse, ApiErrorResult } from "@/types/api";
import { CreateUserInput, UserWithRole, UsersResponse } from "@/types/user";
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { fetchApi } from "@/utils/api";
import { handleApiError, createErrorResponse } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";

// Type for user update input based on backend Joi schema
export interface UserUpdateInput {
  name?: string;
  email?: string;
  roleId?: string;
}

// Query keys for caching
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  archived: () => [...userKeys.all, "archived"] as const,
};

export function useUser({ id }: { id: string }, options?: Omit<UseQueryOptions<UserWithRole, Error, UserWithRole, ReturnType<typeof userKeys.detail>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/users/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole> = await response.json();

      if (!result.success) {
        handleApiError(result, "An error occurred");
      }

      if (!result.data) {
        throw new Error("User data is missing");
      }

      return result.data;
    },
    ...options,
  });
}

// Hook untuk mendapatkan daftar pengguna dengan pagination dari server
export function useUsers(options?: Omit<UseQueryOptions<UsersResponse, Error, UsersResponse, ReturnType<typeof userKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
    search: searchParams.get("search") || "",
    roleId: searchParams.get("roleId") || "",
  };

  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/users`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }

      const result: ApiResponse<UsersResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "An error occurred");
      }

      if (!result.data) {
        throw new Error("Users data is missing");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

// Create a new user
export function useCreateUser(options?: UseMutationOptions<UserWithRole, Error, CreateUserInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await fetchApi(
        `${BASE_URL}/users`,
        {},
        {
          method: "POST",
          body: JSON.stringify(userData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(JSON.stringify(createErrorResponse(result, "Gagal membuat pengguna")));
      }

      if (!result.data) {
        throw new Error(JSON.stringify({ message: "Data pengguna tidak ditemukan" }));
      }

      return result.data as UserWithRole;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    ...options,
  });
}

// Update an existing user
export function useUpdateUser(options?: UseMutationOptions<UserWithRole, Error, { id: string } & UserUpdateInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      if (Object.keys(updateData).length === 0) {
        throw new Error(JSON.stringify({ message: "At least one field must be provided for update" }));
      }

      const response = await fetchApi(
        `${BASE_URL}/users/${id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(JSON.stringify(createErrorResponse(result, "Gagal memperbarui pengguna")));
      }

      if (!result.data) {
        throw new Error(JSON.stringify({ message: "Data pengguna yang diperbarui tidak ditemukan" }));
      }

      return result.data as UserWithRole;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    ...options,
  });
}

// Delete a user
export function useDeleteUser(options?: UseMutationOptions<void, Error, { id: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(`${BASE_URL}/users/${id}`, {}, { method: "DELETE" });

      if (!response.ok) {
        throw new Error(`Error deleting user: ${response.statusText}`);
      }

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        handleApiError(result, "Failed to delete user");
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
    ...options,
  });
}

export function useArchivedUsers(options?: Omit<UseQueryOptions<UserWithRole[], Error, UserWithRole[], ReturnType<typeof userKeys.archived>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: userKeys.archived(),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/users/archived`);

      if (!response.ok) {
        throw new Error(`Error fetching archived users: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole[]> = await response.json();

      if (!result.success) {
        handleApiError(result, "An error occurred");
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
export function useRestoreUser(options?: UseMutationOptions<UserWithRole, Error, { id: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(`${BASE_URL}/users/${id}/unarchived`, {}, { method: "PATCH" });

      if (!response.ok) {
        throw new Error(`Error restoring user: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole> = await response.json();

      if (!result.success) {
        handleApiError(result, "Failed to restore user");
      }

      if (!result.data) {
        throw new Error("Restored user data is missing");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.archived() });
    },
    ...options,
  });
}
