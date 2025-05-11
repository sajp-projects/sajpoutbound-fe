import { ApiResponse, ApiErrorResult } from "@/types/api";
import { Role } from "@/types/role";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { fetchApi } from "@/utils/api";
import { useSearchParams } from "react-router";
import { handleApiError, createErrorResponse } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";

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

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...roleKeys.lists(), { filters }] as const,
  allRoles: () => [...roleKeys.all, "allRoles"] as const,
  details: () => [...roleKeys.all, "detail"] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

export interface RoleUpdateInput {
  name?: string;
  description?: string;
}

export interface CreateRoleInput {
  name: string;
  description: string;
}

export function useRole(
  { id }: { id: string },
  options?: Omit<
    UseQueryOptions<Role, Error, Role, ReturnType<typeof roleKeys.detail>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: roleKeys.detail(id.toString()),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/roles/${id}`);

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message || `Error fetching role: ${response.statusText}`
          );
        }

        const result: ApiResponse<Role> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil data peran"
          );
        }

        if (!result.data) {
          throw new Error("Data peran tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useRole:", error);
        throw error;
      }
    },
    ...options,
  });
}

export interface AllRolesResponse {
  roles: Role[];
}

export function useAllRoles(
  options?: Omit<
    UseQueryOptions<
      AllRolesResponse,
      Error,
      AllRolesResponse,
      ReturnType<typeof roleKeys.allRoles>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: roleKeys.allRoles(),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/roles`, {});

      if (!response.ok) {
        throw new Error(`Error fetching all roles: ${response.statusText}`);
      }

      const result: ApiResponse<RolesResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "An error occurred");
      }

      if (!result.data?.roles) {
        throw new Error("Roles data is missing");
      }

      return { roles: result.data.roles };
    },
    ...options,
  });
}

export function useRoles(
  options?: Omit<
    UseQueryOptions<
      RolesResponse,
      Error,
      RolesResponse,
      ReturnType<typeof roleKeys.list>
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
    queryKey: roleKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/roles`, filters);

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

export function useCreateRole(
  options?: UseMutationOptions<Role, Error, CreateRoleInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData) => {
      const response = await fetchApi(
        `${BASE_URL}/roles`,
        {},
        {
          method: "POST",
          body: JSON.stringify(roleData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(createErrorResponse(result, "Gagal membuat peran"))
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({ message: "Data peran tidak ditemukan" })
        );
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

export function useUpdateRole(
  options?: UseMutationOptions<Role, Error, { id: string } & RoleUpdateInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      if (Object.keys(updateData).length === 0) {
        throw new Error(
          JSON.stringify({
            message: "At least one field must be provided for update",
          })
        );
      }

      const response = await fetchApi(
        `${BASE_URL}/roles/${id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(createErrorResponse(result, "Gagal memperbarui peran"))
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({
            message: "Data peran yang diperbarui tidak ditemukan",
          })
        );
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

export function useDeleteRole(
  options?: UseMutationOptions<Role, Error, { id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(
        `${BASE_URL}/roles/${id}`,
        {},
        { method: "DELETE" }
      );
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
