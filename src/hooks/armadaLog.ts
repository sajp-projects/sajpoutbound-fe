// Hook untuk mengambil data log armada

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { ArmadaLog } from "@/types/armadaLog";
import { fetchApi } from "@/utils/api";
import { BASE_URL } from "@/constant/baseUrl";
import { Pagination } from "@/types/user";

// Definisikan tipe untuk hasil yang diharapkan komponen
interface ArmadaLogsResult {
  logs: ArmadaLog[];
  pagination: Pagination;
}

// Query keys untuk log armada
export const armadaLogKeys = {
  all: ["armadaLogs"] as const,
  lists: () => [...armadaLogKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...armadaLogKeys.lists(), { filters }] as const,
  armadaLogs: (armadaId: string, filters: Record<string, unknown>) =>
    [...armadaLogKeys.lists(), armadaId, { filters }] as const,
};

// Hook untuk mengambil semua log armada
export function useArmadaLogs(
  options?: Omit<
    UseQueryOptions<
      ArmadaLogsResult,
      Error,
      ArmadaLogsResult,
      ReturnType<typeof armadaLogKeys.list>
    >,
    "queryKey" | "queryFn"
  >
) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return useQuery({
    queryKey: armadaLogKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/armadas/logs`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching armada logs: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Terjadi kesalahan saat mengambil log armada");
      }

      if (!result.data?.armadaLogs) {
        throw new Error("Data log armada tidak ditemukan");
      }

      return {
        logs: result.data.armadaLogs,
        pagination: result.data.pagination,
      };
    },
    ...options,
  });
}

// Hook untuk mengambil log armada berdasarkan ID armada
export function useArmadaLogsByArmadaId(
  armadaId: string,
  options?: Omit<
    UseQueryOptions<
      ArmadaLogsResult,
      Error,
      ArmadaLogsResult,
      ReturnType<typeof armadaLogKeys.armadaLogs>
    >,
    "queryKey" | "queryFn"
  >
) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return useQuery({
    queryKey: armadaLogKeys.armadaLogs(armadaId, filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/armadas/logs/${armadaId}`,
        filters
      );

      if (!response.ok) {
        throw new Error(`Error fetching armada logs: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Terjadi kesalahan saat mengambil log armada");
      }

      if (!result.data?.armadaLogs) {
        throw new Error("Data log armada tidak ditemukan");
      }

      return {
        logs: result.data.armadaLogs,
        pagination: result.data.pagination,
      };
    },
    enabled: !!armadaId,
    ...options,
  });
}
