import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";
import { CreateUserInput, UserWithRole, UsersResponse } from "@/types/user";
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { fetchWithAuth } from "@/utils/fetch";
import { useSearchParams } from "react-router";

// Type for user update input based on backend Joi schema
export interface UserUpdateInput {
  name?: string;
  email?: string;
  roleId?: string;
}

type ErrorData = JoiValidationError | CustomError;

// Query keys for caching
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  archived: () => [...userKeys.all, "archived"] as const,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export function useUser({ id }: { id: string }, options?: Omit<UseQueryOptions<UserWithRole, Error, UserWithRole, ReturnType<typeof userKeys.detail>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}`);
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

// Hook untuk mendapatkan daftar pengguna dengan pagination dari server
export function useUsers(options?: Omit<UseQueryOptions<UsersResponse, Error, UsersResponse, ReturnType<typeof userKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "name";
  const sortDirection = searchParams.get("sortDirection") || "asc";

  // Buat objek filters dengan semua parameter URL untuk digunakan sebagai bagian dari queryKey
  const filters = {
    page,
    limit,
    search,
    sort,
    sortDirection,
  };

  return useQuery({
    // Gunakan queryKey yang mencakup semua filter agar React Query dapat memantau perubahan
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      // Build URL with search params
      const url = new URL(`${API_BASE_URL}/users`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", limit);

      if (search) {
        url.searchParams.append("search", search);
      }

      // Tambahkan parameter sorting jika tersedia
      if (sort) {
        url.searchParams.append("sort", sort);
      }

      if (sortDirection) {
        url.searchParams.append("sortDirection", sortDirection);
      }

      // Debug log untuk troubleshooting
      console.log(`Fetching users with URL: ${url.toString()}`);
      console.log(`Query key: ${JSON.stringify(userKeys.list(filters))}`);

      const response = await fetchWithAuth(url.toString());
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.statusText}`);
      }

      const result: ApiResponse<UsersResponse> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "An error occurred");
      }

      if (!result.data) {
        throw new Error("Users data is missing");
      }

      // Log untuk memastikan data diterima dengan benar
      console.log(`Received ${result.data.users.length} users on page ${result.data.pagination.page}`);

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
    mutationFn: async (userData: CreateUserInput) => {
      const response = await fetchWithAuth(`${API_BASE_URL}/users`, {
        method: "POST",
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!result.success) {
        // Throw error dengan informasi lengkap dari backend
        const errorResponse = {
          message: result.message || "Gagal membuat pengguna",
          errorType: result.errorType,
          details: result.details,
        };
        throw new Error(JSON.stringify(errorResponse));
      }

      if (!result.data) {
        throw new Error(JSON.stringify({ message: "Data pengguna tidak ditemukan" }));
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      // Invalidate all user lists regardless of filters
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    ...options,
  });
}

// Update an existing user
export function useUpdateUser(options?: UseMutationOptions<UserWithRole, Error, { id: string } & UserUpdateInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string } & UserUpdateInput) => {
      const { id, ...updateData } = payload;

      // Validate that at least one field is provided
      if (Object.keys(updateData).length === 0) {
        throw new Error(JSON.stringify({ message: "At least one field must be provided for update" }));
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!result.success) {
        // Throw error dengan informasi lengkap dari backend
        const errorResponse = {
          message: result.message || "Gagal memperbarui pengguna",
          errorType: result.errorType,
          details: result.details,
        };
        throw new Error(JSON.stringify(errorResponse));
      }

      if (!result.data) {
        throw new Error(JSON.stringify({ message: "Data pengguna yang diperbarui tidak ditemukan" }));
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      // Invalidate all user lists regardless of filters
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    ...options,
  });
}

// Delete a user
export function useDeleteUser(options?: UseMutationOptions<void, Error, { id: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}`, {
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
      // Invalidate all user lists regardless of filters
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
      // Buat URL untuk API arsip
      const url = new URL(`${API_BASE_URL}/users/archived`);

      const response = await fetchWithAuth(url.toString());
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
export function useRestoreUser(options?: UseMutationOptions<UserWithRole, Error, { id: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetchWithAuth(`${API_BASE_URL}/users/${id}/unarchived`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Error restoring user: ${response.statusText}`);
      }

      const result: ApiResponse<UserWithRole> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "Failed to restore user");
      }

      if (!result.data) {
        throw new Error("Restored user data is missing");
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.id), data);
      // Invalidate all user lists
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate archived users list
      queryClient.invalidateQueries({ queryKey: userKeys.archived() });
    },
    ...options,
  });
}
