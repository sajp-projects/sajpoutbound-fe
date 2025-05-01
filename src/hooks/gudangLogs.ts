// hooks untuk gudang logs
import { ApiResponse } from "@/types/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { WarehouseLogsResponse } from "@/types/gudangLogs";
import { fetchApi } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";

// Query keys untuk caching
export const warehouseLogKeys = {
  all: ["warehouseLogs"] as const,
  lists: () => [...warehouseLogKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...warehouseLogKeys.lists(), { filters }] as const,
  warehouseLogs: (warehouseId: string, filters: Record<string, unknown>) => [...warehouseLogKeys.lists(), warehouseId, { filters }] as const,
};

// Hook untuk mengambil semua log gudang dengan pagination
export function useWarehouseLogs(options?: Omit<UseQueryOptions<WarehouseLogsResponse, Error, WarehouseLogsResponse, ReturnType<typeof warehouseLogKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return useQuery({
    queryKey: warehouseLogKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/warehouses/logs`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching warehouse logs: ${response.statusText}`);
      }

      const result: ApiResponse<WarehouseLogsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil log gudang");
      }

      if (!result.data?.logs) {
        throw new Error("Data log gudang tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}

// Hook untuk mengambil log gudang berdasarkan ID gudang
export function useWarehouseLogsByWarehouseId(warehouseId: string, options?: Omit<UseQueryOptions<WarehouseLogsResponse, Error, WarehouseLogsResponse, ReturnType<typeof warehouseLogKeys.warehouseLogs>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return useQuery({
    queryKey: warehouseLogKeys.warehouseLogs(warehouseId, filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/warehouses/logs/${warehouseId}`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching warehouse logs: ${response.statusText}`);
      }

      const result: ApiResponse<WarehouseLogsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil log gudang");
      }

      if (!result.data?.logs) {
        throw new Error("Data log gudang tidak ditemukan");
      }

      return result.data;
    },
    enabled: !!warehouseId,
    ...options,
  });
}
