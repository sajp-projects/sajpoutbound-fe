import { BASE_URL } from "@/constant/baseUrl";
import { ApiErrorResult, ApiResponse } from "@/types/api";
import {
  CreateWarehouseInput,
  UpdateWarehouseInput,
  Warehouse,
  WarehouseProductsResponse,
  WarehousesResponse,
  WarehouseUsersResponse,
} from "@/types/warehouse";
import { fetchApi } from "@/utils/api";
import { createErrorResponse, handleApiError } from "@/utils/errorHandler";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router";

// Import related keys for proper cache invalidation
import { userKeys } from "./user";

export const warehouseKeys = {
  all: ["warehouses"] as const,
  lists: () => [...warehouseKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...warehouseKeys.lists(), { filters }] as const,
  details: () => [...warehouseKeys.all, "detail"] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
  products: (id: string, filters: { page?: number; limit?: number; search?: string }) =>
    [...warehouseKeys.detail(id), "products", filters] as const,
  users: (id: string, filters: { page?: number; limit?: number; search?: string }) =>
    [...warehouseKeys.detail(id), "users", filters] as const,
  logs: () => [...warehouseKeys.all, "logs"] as const,
  allWarehouses: () => [...warehouseKeys.all, "allWarehouses"] as const,
};

export function useWarehouses(
  options?: Omit<
    UseQueryOptions<
      WarehousesResponse,
      Error,
      WarehousesResponse,
      ReturnType<typeof warehouseKeys.list>
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
    queryKey: warehouseKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/warehouses`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching warehouses: ${response.statusText}`);
      }

      const result: ApiResponse<WarehousesResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil data gudang");
      }

      if (!result.data) {
        throw new Error("Data gudang tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useWarehouse(
  { id }: { id: string },
  options?: Omit<
    UseQueryOptions<
      Warehouse,
      Error,
      Warehouse,
      ReturnType<typeof warehouseKeys.detail>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: warehouseKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/warehouses/${id}`);

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching warehouse: ${response.statusText}`
          );
        }

        const result: ApiResponse<Warehouse> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil detail gudang"
          );
        }

        if (!result.data) {
          throw new Error("Detail gudang tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useWarehouse:", error);
        throw error;
      }
    },
    ...options,
  });
}

export function useWarehouseProducts(
  { id }: { id: string },
  options?: Omit<
    UseQueryOptions<
      WarehouseProductsResponse,
      Error,
      WarehouseProductsResponse,
      ReturnType<typeof warehouseKeys.products>
    >,
    "queryKey" | "queryFn"
  > & {
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const [searchParams] = useSearchParams();
  const { page = parseInt(searchParams.get("page") || "1", 10), limit = 5, search = "", ...restOptions } = options || {};

  return useQuery({
    queryKey: warehouseKeys.products(id, { page, limit, search }),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/warehouses/${id}/products`, {
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching warehouse products: ${response.statusText}`
          );
        }

        const result: ApiResponse<WarehouseProductsResponse> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil produk gudang"
          );
        }

        if (!result.data) {
          throw new Error("Data produk gudang tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useWarehouseProducts:", error);
        throw error;
      }
    },
    ...restOptions,
  });
}

export function useWarehouseUsers(
  { id }: { id: string },
  options?: Omit<
    UseQueryOptions<
      WarehouseUsersResponse,
      Error,
      WarehouseUsersResponse,
      ReturnType<typeof warehouseKeys.users>
    >,
    "queryKey" | "queryFn"
  > & {
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const [searchParams] = useSearchParams();
  const { page = parseInt(searchParams.get("page") || "1", 10), limit = 10, search = "", ...restOptions } = options || {};

  return useQuery({
    queryKey: warehouseKeys.users(id, { page, limit, search }),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/warehouses/${id}/users`, {
          page: page.toString(),
          limit: limit.toString(),
          ...(search && { search }),
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching warehouse users: ${response.statusText}`
          );
        }

        const result: ApiResponse<WarehouseUsersResponse> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil pengguna gudang"
          );
        }

        if (!result.data) {
          throw new Error("Data pengguna gudang tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useWarehouseUsers:", error);
        throw error;
      }
    },
    refetchOnMount: "always",
    ...restOptions,
  });
}

export function useCreateWarehouse(
  options?: UseMutationOptions<Warehouse, Error, CreateWarehouseInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (warehouseData) => {
      const response = await fetchApi(
        `${BASE_URL}/warehouses`,
        {},
        {
          method: "POST",
          body: JSON.stringify(warehouseData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(createErrorResponse(result, "Gagal membuat gudang"))
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({ message: "Data gudang tidak ditemukan" })
        );
      }

      return result.data as Warehouse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(warehouseKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
    ...options,
  });
}

export function useUpdateWarehouse(
  options?: UseMutationOptions<
    Warehouse,
    Error,
    { id: string } & UpdateWarehouseInput
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      if (Object.keys(updateData).length === 0) {
        throw new Error(
          JSON.stringify({
            message: "Setidaknya satu field harus diisi untuk pembaruan",
          })
        );
      }

      const response = await fetchApi(
        `${BASE_URL}/warehouses/${id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(
            createErrorResponse(result, "Gagal memperbarui gudang")
          )
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({
            message: "Data gudang yang diperbarui tidak ditemukan",
          })
        );
      }

      return result.data as Warehouse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(warehouseKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      
      // Invalidate all users since warehouse names are displayed in user details
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.details() });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
    ...options,
  });
}

export function useDeleteWarehouse(
  options?: UseMutationOptions<void, Error, { id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(
        `${BASE_URL}/warehouses/${id}`,
        {},
        { method: "DELETE" }
      );
      const result: ApiResponse<void> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus peran");
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
      queryClient.removeQueries({ queryKey: warehouseKeys.detail(id) });
      
      // Invalidate all users since they may have been assigned to this warehouse
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.details() });
    },
    ...options,
  });
}

export function useAllWarehouses(
  options?: Omit<
    UseQueryOptions<
      Warehouse[],
      Error,
      Warehouse[],
      ReturnType<typeof warehouseKeys.allWarehouses>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: warehouseKeys.allWarehouses(),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/warehouses/options`, {
        limit: 100,
      });

      if (!response.ok) {
        throw new Error(
          `Error fetching all warehouses: ${response.statusText}`
        );
      }

      const result: ApiResponse<WarehousesResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil data gudang");
      }

      if (!result.data) {
        throw new Error("Data gudang tidak ditemukan");
      }

      return result.data.warehouses;
    },
    ...options,
  });
}
