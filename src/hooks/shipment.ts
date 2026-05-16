import { BASE_URL } from "@/constant/baseUrl";
import { ApiErrorResult, ApiResponse } from "@/types/api";
import {
    BulkWeighShipmentInput,
    ChosenProduct,
    ChosenProductsResponse,
    CreateShipmentInput,
    IndividualWeighShipmentInput,
    ReduceQuantityInput,
    ReduceQuantityResponse,
    SelectiveProductLoadingInput,
    Shipment,
    ShipmentPagination,
    TransferItemsInput,
    TransferItemsResponse,
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
  unverified: () => [...shipmentKeys.all, "unverified"] as const,
  notaTimbangan: (shipmentId: string, productId: string) =>
    [...shipmentKeys.all, "notaTimbangan", shipmentId, productId] as const,
};

export function useShipments(options: Record<string, unknown> = {}) {
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

export async function fetchSpmbData(shipmentId: string, spmbId: string) {
  const response = await fetchApi(`${BASE_URL}/shipments/${shipmentId}/spmb/${spmbId}/data`);
  if (!response.ok) {
    throw new Error(`Error fetching SPMB data: ${response.statusText}`);
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Gagal mengambil data SPMB');
  }
  return result.data;
}

export async function fetchNotaTimbanganData(shipmentId: string, weighingId: string) {
  const response = await fetchApi(`${BASE_URL}/shipments/${shipmentId}/nota-timbangan/${weighingId}/data`);
  if (!response.ok) {
    throw new Error(`Error fetching Nota Timbangan data: ${response.statusText}`);
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Gagal mengambil data Nota Timbangan');
  }
  return result.data;
}

export function useShipmentsWithParams(
  {
    page = 1,
    limit = 10,
    search = "",
    status = "",
    type = "",
    startDate = "",
    endDate = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  } = {},
  options: Record<string, unknown> = {}
) {
  const filters = {
    page,
    limit,
    search,
    status,
    type,
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  console.log(filters, "shipments filters");

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

export function useShipment(
  { id }: { id: string },
  options: Record<string, unknown> = {}
) {
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

export function useArchivedShipments(options: Record<string, unknown> = {}) {
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

export function useCreateShipment(options: Record<string, unknown> = {}) {
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

export function useUpdateShipment(options: Record<string, unknown> = {}) {
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

export function useDeleteShipment(options: Record<string, unknown> = {}) {
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

export function useChooseProduct(options: Record<string, unknown> = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shipmentId: string;
      deliveryOrderId: string;
      productId: string;
      weighingMethod: "MANUAL" | "VENDOR";
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
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.all,
      });

      if (options.onSuccess && typeof options.onSuccess === "function") {
        (options.onSuccess as (data: unknown, variables: unknown, context: unknown) => void)(data, variables, context);
      }
    },
    ...options,
  });
}

export function useUpdateWeighingMethod(
  options: UseMutationOptions<
    ApiResponse<{
      message: string;
      chosenProduct: ChosenProduct;
      updated: boolean;
      hasWeighings: boolean;
    }>,
    Error,
    {
      shipmentId: string;
      productId: string;
      weighingMethod: "MANUAL" | "VENDOR";
    }
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{
      message: string;
      chosenProduct: ChosenProduct;
      updated: boolean;
      hasWeighings: boolean;
    }>,
    Error,
    {
      shipmentId: string;
      productId: string;
      weighingMethod: "MANUAL" | "VENDOR";
    }
  >({
    mutationFn: async ({ shipmentId, productId, weighingMethod }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${shipmentId}/choosen-product/${productId}/weighing-method`,
        {},
        {
          method: "PATCH",
          body: JSON.stringify({ weighingMethod }),
        }
      );

      const result: ApiResponse<{
        message: string;
        chosenProduct: ChosenProduct;
        updated: boolean;
        hasWeighings: boolean;
      }> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Terjadi kesalahan saat mengubah tipe penimbangan"
        );
      }

      return result;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.chosenProducts(variables.shipmentId),
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

export function useShipmentChosenProducts(
  shipmentId: string,
  weighingMethod?: "MANUAL" | "VENDOR",
  options: Record<string, unknown> = {}
) {
  const queryKey = weighingMethod
    ? [...shipmentKeys.chosenProducts(shipmentId), weighingMethod]
    : shipmentKeys.chosenProducts(shipmentId);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!shipmentId) return [];

      try {
        const params = weighingMethod ? { method: weighingMethod } : {};
        const response = await fetchApi(
          `${BASE_URL}/shipments/${shipmentId}/choosen-product`,
          params,
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

export function useDeleteShipmentItems(options: Record<string, unknown> = {}) {
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
  options: Record<string, unknown> = {}
) {
  return useQuery({
    queryKey: ["shipmentsByDeliveryOrderId", deliveryOrderId],
    queryFn: async () => {
      if (!deliveryOrderId) return [];

      try {
        const response = await fetchApi(
          `${BASE_URL}/delivery-orders/${deliveryOrderId}/shipments`,
          {},
          { method: "GET" }
        );

        if (!response.ok) {
          // If it's a 404 or the DO doesn't have shipments, return empty array instead of throwing
          if (response.status === 404) {
            return [];
          }
          throw new Error(`Error fetching shipments: ${response.statusText}`);
        }

        const result = await response.json();

        // If success is false but it's just an empty result, return empty array
        if (!result.success && result.message?.includes("tidak ditemukan")) {
          return [];
        }

        if (!result.success) {
          throw new Error(result.message || "Gagal mengambil data pengiriman");
        }

        return result.data?.shipments || [];
      } catch (error) {
        console.error("Error in useShipmentsByDeliveryOrderId:", error);
        // If it's a network error or 404, return empty array instead of throwing
        if (
          error instanceof Error &&
          (error.message.includes("404") ||
            error.message.includes("tidak ditemukan"))
        ) {
          return [];
        }
        throw error;
      }
    },
    enabled: !!deliveryOrderId,
    ...options,
  });
}

export function useBulkWeighShipmentItems(
  options: Record<string, unknown> = {}
) {
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
      // Ensure Nota Timbangan list for this product refreshes immediately
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.notaTimbangan(
          variables.shipmentId,
          variables.productId
        ),
      });
      queryClient.invalidateQueries({ queryKey: shipmentKeys.lists() });
    },
    ...options,
  });
}

export function useIndividualWeighShipmentItem(
  options: Record<string, unknown> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IndividualWeighShipmentInput) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${data.shipmentId}/weigh-item`,
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
            createErrorResponse(
              result,
              "Gagal melakukan penimbangan item individual"
            )
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
      queryClient.invalidateQueries({
        queryKey: [...shipmentKeys.all, "notaTimbangan", variables.shipmentId],
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

export function useReviseShipmentItemAfterWeighing(
  options?: UseMutationOptions<
    ApiErrorResult,
    Error,
    {
      shipmentId: string;
      shipmentItemId: string;
      newQuantity: number;
      decreaseMode?: "to_cancelled" | "to_pending";
    }
  >
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiErrorResult,
    Error,
    {
      shipmentId: string;
      shipmentItemId: string;
      newQuantity: number;
      decreaseMode?: "to_cancelled" | "to_pending";
    }
  >({
    mutationFn: async ({ shipmentId, shipmentItemId, newQuantity, decreaseMode }) => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/revise-shipment-item`,
        {},
        {
          method: "POST",
          body: JSON.stringify({
            shipmentId,
            shipmentItemId,
            newQuantity,
            ...(decreaseMode ? { decreaseMode } : {}),
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Gagal merevisi shipment item");
      }
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate shipment data since we updated a shipment item
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.shipmentId),
      });
      // Invalidate all shipment queries since quantity revisions affect shipment item data
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
      // Invalidate delivery orders since DO quantities are recalculated
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.lists(),
      });
    },
    ...options,
  });
}

export function useUnverifiedShipments() {
  return useQuery({
    queryKey: shipmentKeys.unverified(),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/shipments`, {
        unverified: "true", // Filter for shipments with uploaded photos but not verified
        limit: "50", // Get more results since this is a specialized view
      });

      if (!response.ok) {
        throw new Error(
          `Error fetching unverified shipments: ${response.statusText}`
        );
      }

      const result: ApiResponse<ShipmentPagination> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil data pengiriman yang belum diverifikasi"
        );
      }

      if (!result.data) {
        throw new Error(
          "Data pengiriman yang belum diverifikasi tidak ditemukan"
        );
      }

      // Backend already filters for unverified shipments
      return result.data.shipments;
    },
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently for this critical view
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
}

export function useNotaTimbanganForProduct(
  shipmentId: string,
  productId: string,
  options: Record<string, unknown> = {}
) {
  return useQuery({
    queryKey: shipmentKeys.notaTimbangan(shipmentId, productId),
    queryFn: async () => {
      if (!shipmentId || !productId) {
        throw new Error("shipmentId and productId are required");
      }

      const response = await fetchApi(
        `${BASE_URL}/shipments/${shipmentId}/nota-timbangan/${productId}`
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching nota timbangan: ${response.statusText}`
        );
      }

      const result: ApiResponse<{
        notaTimbanganList: Array<{
          id: string;
          ticketNumber: string;
          documentPath: string | null;
          createdAt: string;
          updatedAt: string;
          weighing: {
            id: string;
            grossWeight: number;
            netWeight: number;
            tareWeight: number;
            timeIn: string | null;
            timeOut: string | null;
          };
          product: {
            id: string;
            name: string;
            satuan: string;
          };
          shipment: {
            id: string;
            shipmentNumber: string;
          };
          deliveryOrders: Array<{
            id: string;
            doNumber: string;
            customer: {
              id: string;
              name: string;
            };
          }>;
          primaryDoNumber: string;
        }>;
        totalCount: number;
      }> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil data nota timbangan"
        );
      }

      if (!result.data) {
        throw new Error("Data nota timbangan tidak ditemukan");
      }

      return result.data;
    },
    enabled:
      !!shipmentId && !!productId && shipmentId !== "" && productId !== "",
    ...options,
  });
}

export function useUpdateTally(
  options: UseMutationOptions<
    ApiResponse<Shipment>,
    ApiErrorResult,
    { id: string; tally: string }
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tally }: { id: string; tally: string }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${id}/update-tally`,
        {},
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tally }),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw createErrorResponse(
          errorResult,
          `Error updating tally: ${response.statusText}`
        );
      }

      const result: ApiResponse<Shipment> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat memperbarui tally");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch shipment data
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    ...options,
  });
}

export function useUpdateKenek(
  options: UseMutationOptions<
    ApiResponse<Shipment>,
    ApiErrorResult,
    { id: string; kenek: string }
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, kenek }: { id: string; kenek: string }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${id}/update-kenek`,
        {},
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ kenek }),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw createErrorResponse(
          errorResult,
          `Error updating kenek: ${response.statusText}`
        );
      }

      const result: ApiResponse<Shipment> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat memperbarui kenek");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch shipment data
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    ...options,
  });
}

export function useSelectiveChooseProduct(
  options: UseMutationOptions<
    ApiResponse<ChosenProduct>,
    ApiErrorResult,
    SelectiveProductLoadingInput
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SelectiveProductLoadingInput) => {
      const { shipmentId, ...payload } = data;
      const response = await fetchApi(
        `${BASE_URL}/shipments/${shipmentId}/choosen-product-selective`,
        {},
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw createErrorResponse(
          errorResult,
          `Error choosing product selectively: ${response.statusText}`
        );
      }

      const result: ApiResponse<ChosenProduct> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat memuat barang selektif");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.shipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
      // Invalidate all affected delivery orders to refresh item quantities and status
      variables.deliveryOrderIds.forEach((deliveryOrderId) => {
        queryClient.invalidateQueries({
          queryKey: deliveryOrderKeys.detail(deliveryOrderId),
        });
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    ...options,
  });
}

export function useTransferItems(
  options: UseMutationOptions<
    ApiResponse<TransferItemsResponse>,
    ApiErrorResult,
    TransferItemsInput
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransferItemsInput) => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/transfer-items`,
        {},
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw createErrorResponse(
          errorResult,
          `Error transferring items: ${response.statusText}`
        );
      }

      const result: ApiResponse<TransferItemsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat transfer items");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate shipment data to refresh the view
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.detail(variables.sourceShipmentId),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
      // Invalidate delivery order queries as well
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.all,
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    ...options,
  });
}

export function useReduceQuantity(
  options: UseMutationOptions<
    ApiResponse<ReduceQuantityResponse>,
    ApiErrorResult,
    ReduceQuantityInput
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReduceQuantityInput) => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/reduce-quantity`,
        {},
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw createErrorResponse(
          errorResult,
          `Error reducing quantity: ${response.statusText}`
        );
      }

      const result: ApiResponse<ReduceQuantityResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengurangi kuantitas");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh the view - we don't have shipmentId directly,
      // so we invalidate all shipments and delivery orders to be safe
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.all,
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, undefined);
      }
    },
    ...options,
  });
}

/**
 * Cancel shipment item - Reflected to DO
 * This will cancel the item in shipment and reduce the quantity in delivery order
 */
export function useCancelItemReflectedToDO(
  options: UseMutationOptions<
    ApiResponse<{ message: string; shipmentItemId: string }>,
    ApiErrorResult,
    string
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ message: string; shipmentItemId: string }>,
    ApiErrorResult,
    string
  >({
    mutationFn: async (shipmentItemId: string) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/items/${shipmentItemId}/cancel-reflected`,
        {},
        {
          method: "DELETE",
        }
      );

      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await response.json();

      if (!result.success) {
        // Backend returns error in flat format: { success, message, errorType, details }
        throw new Error(
          result.message || "Terjadi kesalahan saat membatalkan item"
        );
      }

      return result;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate shipment queries to refetch data
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.all,
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

/**
 * Cancel shipment item - Shipment Only
 * This will cancel the item only in shipment, returning quantity to pending in DO
 */
export function useCancelItemShipmentOnly(
  options: UseMutationOptions<
    ApiResponse<{ message: string; shipmentItemId: string }>,
    ApiErrorResult,
    string
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ message: string; shipmentItemId: string }>,
    ApiErrorResult,
    string
  >({
    mutationFn: async (shipmentItemId: string) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/items/${shipmentItemId}/cancel-shipment-only`,
        {},
        {
          method: "DELETE",
        }
      );

      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await response.json();

      if (!result.success) {
        // Backend returns error in flat format: { success, message, errorType, details }
        throw new Error(
          result.message || "Terjadi kesalahan saat membatalkan item"
        );
      }

      return result;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate shipment queries to refetch data
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.all,
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    ...options,
  });
}

export function useManualTruckWeigh(
  options: UseMutationOptions<
    ApiResponse<{ message: string; weighing: { type: 'PRE' | 'POST'; weight: number; reason: string } }>,
    Error,
    {
      shipmentId: string;
      type: 'PRE' | 'POST';
      weight: number;
      reason: string;
    }
  > = {}
) {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ message: string; weighing: { type: 'PRE' | 'POST'; weight: number; reason: string } }>,
    Error,
    {
      shipmentId: string;
      type: 'PRE' | 'POST';
      weight: number;
      reason: string;
    }
  >({
    mutationFn: async ({ shipmentId, type, weight, reason }) => {
      const response = await fetchApi(
        `${BASE_URL}/shipments/${shipmentId}/manual-truck-weigh`,
        {},
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, weight, reason }),
        }
      );
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: shipmentKeys.detail(variables.shipmentId) });
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: options.onError,
    onSettled: options.onSettled,
    onMutate: options.onMutate,
  });
}
