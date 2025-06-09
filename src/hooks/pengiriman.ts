import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/utils/api";
import {
  Shipment,
  ShipmentPagination,
  CreateShipmentInput,
  UpdateShipmentInput,
  ChosenProduct,
  ChosenProductsResponse,
} from "@/types/pengiriman";
import { useQueryClient } from "@tanstack/react-query";
import { createErrorResponse, handleApiError } from "@/utils/errorHandler";
import { ApiResponse, ApiErrorResult } from "@/types/api";
import { BASE_URL } from "@/constant/baseUrl";

export const shipmentKeys = {
  all: ["shipments"] as const,
  lists: () => [...shipmentKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...shipmentKeys.lists(), { filters }] as const,
  details: () => [...shipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...shipmentKeys.details(), id] as const,
  archived: () => [...shipmentKeys.all, "archived"] as const,
  chosenProducts: (shipmentId: string) =>
    [...shipmentKeys.all, "chosenProducts", shipmentId] as const,
};

export function useShipments(options = {}) {
  return useQuery({
    queryKey: shipmentKeys.all,
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/shipments`);

      if (!response.ok) {
        throw new Error(`Error fetching shipments: ${response.statusText}`);
      }

      const result: ApiResponse<ShipmentPagination> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil data pengiriman"
        );
      }

      return result.data;
    },
    ...options,
  });
}

export function useShipmentsWithParams(
  { page = 1, limit = 10, search = "", status = "", type = "" } = {},
  options = {}
) {
  const filters = {
    page,
    limit,
    search,
    status,
    type,
  };

  return useQuery({
    queryKey: shipmentKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/shipments`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching shipments: ${response.statusText}`);
      }

      const result: ApiResponse<ShipmentPagination> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil data pengiriman"
        );
      }

      return result.data;
    },
    ...options,
  });
}

export function useShipment({ id }: { id: string }, options = {}) {
  return useQuery({
    queryKey: shipmentKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/shipments/${id}`);

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching shipment: ${response.statusText}`
          );
        }

        const result: ApiResponse<Shipment> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message ||
              "Terjadi kesalahan saat mengambil detail pengiriman"
          );
        }

        if (!result.data) {
          throw new Error("Detail pengiriman tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useShipment:", error);
        throw error;
      }
    },
    enabled: !!id,
    ...options,
  });
}

export function useArchivedShipments(options = {}) {
  return useQuery({
    queryKey: shipmentKeys.archived(),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/shipments/archived`);

      if (!response.ok) {
        throw new Error(
          `Error fetching archived shipments: ${response.statusText}`
        );
      }

      const result: ApiResponse<ShipmentPagination> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil data pengiriman yang diarsipkan"
        );
      }

      return result.data;
    },
    ...options,
  });
}

export function useCreateShipment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateShipmentInput) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments`,
        {},
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(
            createErrorResponse(result, "Gagal membuat pengiriman")
          )
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({ message: "Data pengiriman tidak ditemukan" })
        );
      }

      return result.data as Shipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
    ...options,
  });
}

export function useUpdateShipment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: UpdateShipmentInput & { id: string }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(
            createErrorResponse(result, "Gagal memperbarui pengiriman")
          )
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({
            message: "Data pengiriman yang diperbarui tidak ditemukan",
          })
        );
      }

      return result.data as Shipment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.id),
      });
    },
    ...options,
  });
}

export function useDeleteShipment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${id}`,
        {},
        {
          method: "DELETE",
        }
      );

      const result: ApiResponse<void> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus pengiriman");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.archived() });
    },
    ...options,
  });
}

export function useRestoreShipment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${id}/restore`,
        {},
        {
          method: "PATCH",
        }
      );

      const result: ApiResponse<Shipment> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memulihkan pengiriman");
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.archived() });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.id),
      });
    },
    ...options,
  });
}

export function useChooseProduct(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shipmentId: string;
      deliveryOrderId: string;
      productId: string;
    }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${data.shipmentId}/choosen-product`,
        {},
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(createErrorResponse(result, "Gagal memilih produk"))
        );
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.chosenProducts(variables.shipmentId),
      });
    },
    ...options,
  });
}

export function useShipmentChosenProducts(shipmentId: string, options = {}) {
  return useQuery({
    queryKey: shipmentKeys.chosenProducts(shipmentId),
    queryFn: async () => {
      if (!shipmentId) return [];

      try {
        const response = await fetchApi(
          `${BASE_URL}/shipments/${shipmentId}/choosen-product`,
          {},
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching chosen products: ${response.statusText}`
          );
        }

        const result: ApiResponse<ChosenProductsResponse> =
          await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Gagal mendapatkan produk terpilih"
          );
        }

        return result.data?.chosenProducts || [];
      } catch (error) {
        console.error("Error fetching chosen products:", error);
        throw error;
      }
    },
    enabled: !!shipmentId,
    ...options,
  });
}
