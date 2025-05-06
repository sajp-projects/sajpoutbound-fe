// hooks untuk pelanggan log

import { ApiResponse } from "@/types/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { CustomerLogsResponse } from "@/types/pelangganLog";
import { fetchApi } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";

export const customerLogKeys = {
  all: ["customerLogs"] as const,
  lists: () => [...customerLogKeys.all, "list"] as const,
  list: (customerId: string, filters: Record<string, unknown>) =>
    [...customerLogKeys.lists(), customerId, { filters }] as const,
  allLogs: (filters: Record<string, unknown>) =>
    [...customerLogKeys.lists(), "all", { filters }] as const,
};

export function useCustomerLogs(
  customerId: string,
  options?: Omit<
    UseQueryOptions<
      CustomerLogsResponse,
      Error,
      CustomerLogsResponse,
      ReturnType<typeof customerLogKeys.list>
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
    queryKey: customerLogKeys.list(customerId, filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/customers/logs/${customerId}`,
        filters
      );

      if (!response.ok) {
        throw new Error(`Error fetching customer logs: ${response.statusText}`);
      }

      const result: ApiResponse<CustomerLogsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan");
      }

      if (!result.data?.customerLogs) {
        throw new Error("Data log pelanggan tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}

export function useAllCustomerLogs(
  options?: Omit<
    UseQueryOptions<
      CustomerLogsResponse,
      Error,
      CustomerLogsResponse,
      ReturnType<typeof customerLogKeys.allLogs>
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
    queryKey: customerLogKeys.allLogs(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/customers/logs`, filters);

      if (!response.ok) {
        throw new Error(
          `Error fetching all customer logs: ${response.statusText}`
        );
      }

      const result: ApiResponse<CustomerLogsResponse> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil log pelanggan"
        );
      }

      if (!result.data?.customerLogs) {
        throw new Error("Data log pelanggan tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}
