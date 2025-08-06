import { BASE_URL } from "@/constant/baseUrl";
import { ApiErrorResult, ApiResponse } from "@/types/api";
import {
  BulkWeighShipmentInput,
  ChosenProductsResponse,
  CreateShipmentInput,
  Shipment,
  ShipmentPagination,
  UpdateShipmentInput,
} from "@/types/shipment";
import { fetchApi } from "@/utils/api";
import { createErrorResponse, handleApiError } from "@/utils/errorHandler";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { deliveryOrderKeys } from "./do";

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
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.all });
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
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.details() });
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] });
    },
    ...options,
  });
}

// export function useRestoreShipment(options = {}) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ id }: { id: string }) => {
//       const response = await fetchApi(
//         `${BASE_URL}/shipments/${id}/restore`,
//         {},
//         {
//           method: "PATCH",
//         }
//       );

//       const result: ApiResponse<Shipment> = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(result.message || "Gagal memulihkan pengiriman");
//       }

//       return result.data;
//     },
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
//       queryClient.invalidateQueries({ queryKey: shipmentKeys.archived() });
//       queryClient.invalidateQueries({
//         queryKey: shipmentKeys.detail(variables.id),
//       });
//     },
//     ...options,
//   });
// }

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
          JSON.stringify(createErrorResponse(result, "Gagal memilih barang"))
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
            result.message || "Gagal mendapatkan barang terpilih"
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

export function useDeleteShipmentItems(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shipmentId,
      deliveryOrderId,
    }: {
      shipmentId: string;
      deliveryOrderId: string;
    }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${shipmentId}/items/${deliveryOrderId}`,
        {},
        {
          method: "DELETE",
        }
      );

      const result: ApiResponse<void> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus item pengiriman");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.shipmentId),
      });
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.all });
    },
    ...options,
  });
}

export function useShipmentsByDeliveryOrderId(
  deliveryOrderId: string,
  options = {}
) {
  return useQuery({
    queryKey: ["shipmentsByDeliveryOrderId", deliveryOrderId],
    queryFn: async () => {
      if (!deliveryOrderId) return [];
      const response = await fetchApi(
        `/delivery-orders/${deliveryOrderId}/shipments`,
        {},
        { method: "GET" }
      );
      const result = await response.json();
      if (!result.success)
        throw new Error(result.message || "Gagal mengambil data pengiriman");
      return result.data?.shipments || [];
    },
    enabled: !!deliveryOrderId,
    ...options,
  });
}

export function useBulkWeighShipmentItems(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkWeighShipmentInput) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${data.shipmentId}/manual-weigh-items`,
        {},
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = (await response.json()) as ApiErrorResult;
      if (!result.success) {
        throw new Error(
          JSON.stringify(
            createErrorResponse(result, "Gagal melakukan penimbangan item")
          )
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
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
    ...options,
  });
}

export function useChangeCustomerAfterWeighing(
  options?: UseMutationOptions<
    ApiErrorResult,
    Error,
    { deliveryOrderId: string; customerId: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiErrorResult,
    Error,
    { deliveryOrderId: string; customerId: string }
  >({
    mutationFn: async ({ deliveryOrderId, customerId }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${deliveryOrderId}/change-customer`,
        {},
        {
          method: "PATCH",
          body: JSON.stringify({ customerId }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Gagal mengubah customer");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch delivery order detail
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.detail(variables.deliveryOrderId),
      });
      // Invalidate delivery orders list
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.lists(),
      });
      // Invalidate all shipment queries since customer data is embedded in shipment items
      // This ensures the customer name updates everywhere it's displayed
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
    },
    ...options,
  });
}

export function useReviseDeliveryOrderAfterWeighing(
  options?: UseMutationOptions<
    ApiErrorResult,
    Error,
    { deliveryOrderId: string; items: Array<{ id: string; quantity: number }> }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiErrorResult,
    Error,
    { deliveryOrderId: string; items: Array<{ id: string; quantity: number }> }
  >({
    mutationFn: async ({ deliveryOrderId, items }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${deliveryOrderId}/revise-items`,
        {},
        {
          method: "PATCH",
          body: JSON.stringify({ items }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Gagal merevisi DO");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch delivery order detail
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.detail(variables.deliveryOrderId),
      });
      // Invalidate delivery orders list
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.lists(),
      });
      // Invalidate all shipment queries since quantity revisions affect shipment item data
      // This ensures the revised quantities are reflected in the shipment display
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
    },
    ...options,
  });
}
