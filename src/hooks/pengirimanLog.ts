import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchApi } from "@/utils/api";
import { ShipmentLogPagination } from "@/types/pengirimanLog";
import { ApiResponse } from "@/types/api";
import { handleApiError } from "@/utils/errorHandler";
import { useSearchParams } from "react-router";
import { BASE_URL } from "@/constant/baseUrl";

export const shipmentLogKeys = {
  all: ["shipmentLogs"] as const,
  lists: () => [...shipmentLogKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...shipmentLogKeys.lists(), { filters }] as const,
  shipmentLogs: (shipmentId: string, filters: Record<string, unknown>) =>
    [...shipmentLogKeys.lists(), shipmentId, { filters }] as const,
};

export function useShipmentLogs(
  options?: Omit<
    UseQueryOptions<
      ShipmentLogPagination,
      Error,
      ShipmentLogPagination,
      ReturnType<typeof shipmentLogKeys.list>
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
    queryKey: shipmentLogKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/shipments/logs`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching shipment logs: ${response.statusText}`);
      }

      const result: ApiResponse<ShipmentLogPagination> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil log pengiriman"
        );
      }

      if (!result.data) {
        throw new Error("Data log pengiriman tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}

export function useShipmentLogsByShipmentId(
  { shipmentId }: { shipmentId: string },
  options?: Omit<
    UseQueryOptions<
      ShipmentLogPagination,
      Error,
      ShipmentLogPagination,
      ReturnType<typeof shipmentLogKeys.shipmentLogs>
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
    queryKey: shipmentLogKeys.shipmentLogs(shipmentId, filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/logs/${shipmentId}`,
        filters
      );

      if (!response.ok) {
        throw new Error(`Error fetching shipment logs: ${response.statusText}`);
      }

      const result: ApiResponse<ShipmentLogPagination> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil log pengiriman"
        );
      }

      if (!result.data) {
        throw new Error("Data log pengiriman tidak ditemukan");
      }

      return result.data;
    },
    enabled: !!shipmentId,
    ...options,
  });
}
