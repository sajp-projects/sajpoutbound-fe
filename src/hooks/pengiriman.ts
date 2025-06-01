import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchApiData } from "@/utils/api";
import {
  Shipment,
  ShipmentPagination,
  CreateShipmentInput,
  UpdateShipmentInput,
  UploadPlatePhotoInput,
} from "@/types/pengiriman";
import { useQueryClient } from "@tanstack/react-query";

export function useShipments(options = {}) {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: () => fetchApiData<ShipmentPagination>("/api/shipments"),
    ...options,
  });
}

export function useShipmentsWithParams(
  { page = 1, limit = 10, search = "", status = "", type = "" } = {},
  options = {}
) {
  return useQuery({
    queryKey: ["shipments", { page, limit, search, status, type }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (page) params.append("page", String(page));
      if (limit) params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (status) params.append("status", status);
      if (type) params.append("type", type);

      return fetchApiData<ShipmentPagination>(
        `/api/shipments?${params.toString()}`
      );
    },
    ...options,
  });
}

export function useShipment({ id }: { id: string }, options = {}) {
  return useQuery({
    queryKey: ["shipments", id],
    queryFn: () => fetchApiData<Shipment>(`/api/shipments/${id}`),
    enabled: !!id,
    ...options,
  });
}

export function useArchivedShipments(options = {}) {
  return useQuery({
    queryKey: ["shipments", "archived"],
    queryFn: () => fetchApiData<ShipmentPagination>("/api/shipments/archived"),
    ...options,
  });
}

export function useCreateShipment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShipmentInput) =>
      fetchApiData<Shipment>(
        "/api/shipments",
        {},
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
    ...options,
  });
}

export function useUpdateShipment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateShipmentInput & { id: string }) =>
      fetchApiData<Shipment>(
        `/api/shipments/${id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", variables.id] });
    },
    ...options,
  });
}

export function useDeleteShipment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      fetchApiData<Shipment>(
        `/api/shipments/${id}`,
        {},
        {
          method: "DELETE",
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", "archived"] });
    },
    ...options,
  });
}

export function useRestoreShipment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      fetchApiData<Shipment>(
        `/api/shipments/${id}/restore`,
        {},
        {
          method: "PATCH",
        }
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", "archived"] });
      queryClient.invalidateQueries({ queryKey: ["shipments", variables.id] });
    },
    ...options,
  });
}

export function useUploadPlatePhoto(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shipmentId, platePhoto }: UploadPlatePhotoInput) => {
      const formData = new FormData();
      formData.append("platePhoto", platePhoto);

      return fetchApiData<Shipment>(
        `/api/shipments/${shipmentId}/upload-plate-photo`,
        {},
        {
          method: "POST",
          body: formData,
          headers: {
            // Don't set Content-Type here, it will be set automatically by the browser
          },
        }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({
        queryKey: ["shipments", variables.shipmentId],
      });
    },
    ...options,
  });
}
