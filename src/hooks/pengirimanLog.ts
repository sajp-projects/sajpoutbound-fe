import { useQuery } from "@tanstack/react-query";
import { fetchApiData } from "@/utils/api";
import { ShipmentLogPagination } from "@/types/pengirimanLog";

export function useShipmentLogs(options = {}) {
  return useQuery({
    queryKey: ["shipmentLogs"],
    queryFn: () => fetchApiData<ShipmentLogPagination>("/api/shipments/logs"),
    ...options,
  });
}

export function useShipmentLogsByShipmentId(
  { shipmentId }: { shipmentId: string },
  options = {}
) {
  return useQuery({
    queryKey: ["shipmentLogs", shipmentId],
    queryFn: () =>
      fetchApiData<ShipmentLogPagination>(`/api/shipments/logs/${shipmentId}`),
    enabled: !!shipmentId,
    ...options,
  });
}
