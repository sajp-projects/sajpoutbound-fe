// do log hook

import { ApiResponse } from "@/types/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { DeliveryOrderLogsResponse } from "@/types/doLog";
import { fetchApi } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";

export const deliveryOrderLogKeys = {
  all: ["deliveryOrderLogs"] as const,
  lists: () => [...deliveryOrderLogKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...deliveryOrderLogKeys.lists(), { filters }] as const,
  deliveryOrderLogs: (
    deliveryOrderId: string,
    filters: Record<string, unknown>
  ) => [...deliveryOrderLogKeys.lists(), deliveryOrderId, { filters }] as const,
};

export function useDeliveryOrderLogs(
  options?: Omit<
    UseQueryOptions<
      DeliveryOrderLogsResponse,
      Error,
      DeliveryOrderLogsResponse,
      ReturnType<typeof deliveryOrderLogKeys.list>
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
    queryKey: deliveryOrderLogKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/logs`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching delivery order logs: ${response.statusText}`
        );
      }

      const result: ApiResponse<DeliveryOrderLogsResponse> =
        await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil log delivery order"
        );
      }

      if (!result.data?.logs) {
        throw new Error("Data log delivery order tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}

export function useDeliveryOrderLogsByDeliveryOrderId(
  deliveryOrderId: string,
  options?: Omit<
    UseQueryOptions<
      DeliveryOrderLogsResponse,
      Error,
      DeliveryOrderLogsResponse,
      ReturnType<typeof deliveryOrderLogKeys.deliveryOrderLogs>
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
    queryKey: deliveryOrderLogKeys.deliveryOrderLogs(deliveryOrderId, filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/logs/${deliveryOrderId}`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching delivery order logs: ${response.statusText}`
        );
      }

      const result: ApiResponse<DeliveryOrderLogsResponse> =
        await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil log delivery order"
        );
      }

      if (!result.data?.logs) {
        throw new Error("Data log delivery order tidak ditemukan");
      }

      return result.data;
    },
    enabled: !!deliveryOrderId,
    ...options,
  });
}
