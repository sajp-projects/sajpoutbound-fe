import { BASE_URL } from "@/constant/baseUrl";
import { ApiErrorResult, ApiResponse } from "@/types/api";
import {
  CreateDeliveryOrderInput,
  DeliveryOrder,
  DeliveryOrdersResponse,
  UpdateDeliveryOrderInput,
} from "@/types/do";
import { fetchApi } from "@/utils/api";
import { createErrorResponse, handleApiError } from "@/utils/errorHandler";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router";

// Import related keys for proper cache invalidation
import { customerKeys } from "./customer";
import { shipmentKeys } from "./shipment";

export const deliveryOrderKeys = {
  all: ["deliveryOrders"] as const,
  lists: () => [...deliveryOrderKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...deliveryOrderKeys.lists(), { filters }] as const,
  details: () => [...deliveryOrderKeys.all, "detail"] as const,
  infinite: (filters: Record<string, unknown>) =>
    [...deliveryOrderKeys.lists(), "infinite", { filters }] as const,
  detail: (id: string) => [...deliveryOrderKeys.details(), id] as const,
  archived: (filters: Record<string, unknown>) =>
    [...deliveryOrderKeys.lists(), "archived", { filters }] as const,
};

export function useDeliveryOrders(
  options?: Omit<
    UseQueryOptions<
      DeliveryOrdersResponse,
      Error,
      DeliveryOrdersResponse,
      ReturnType<typeof deliveryOrderKeys.list>
    >,
    "queryKey" | "queryFn"
  > & {
    searchQuery?: string;
    statusFilter?: string;
    availableOnly?: boolean;
    startDate?: string;
    endDate?: string;
  }
) {
  const [searchParams] = useSearchParams();
  const searchQuery = options?.searchQuery;
  const statusFilter =
    options?.statusFilter !== undefined
      ? options.statusFilter
      : searchParams.get("status") || "";
  const availableOnly = options?.availableOnly;
  const startDate = options?.startDate;
  const endDate = options?.endDate;

  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
    search:
      searchQuery !== undefined
        ? searchQuery
        : searchParams.get("search") || "",
    status: statusFilter,
    ...(availableOnly !== undefined && {
      availableOnly: availableOnly.toString(),
    }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  return useQuery({
    queryKey: deliveryOrderKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/delivery-orders`, filters);

      if (!response.ok) {
        throw new Error(
          `Error fetching delivery orders: ${response.statusText}`
        );
      }

      const result: ApiResponse<DeliveryOrdersResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil data DO");
      }

      if (!result.data) {
        throw new Error("Data delivery order tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useInfiniteDeliveryOrders(options?: {
  searchQuery?: string;
  statusFilter?: string;
  availableOnly?: boolean;
  limit?: number;
  enabled?: boolean;
}) {
  const {
    searchQuery = "",
    statusFilter = "",
    availableOnly = false,
    limit = 10,
    enabled = true,
  } = options || {};

  return useInfiniteQuery({
    queryKey: deliveryOrderKeys.infinite({
      search: searchQuery,
      status: statusFilter,
      availableOnly: availableOnly.toString(),
      limit,
    }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const response = await fetchApi(`${BASE_URL}/delivery-orders`, {
        page: pageParam.toString(),
        limit: limit.toString(),
        search: searchQuery,
        status: statusFilter,
        ...(availableOnly && { availableOnly: availableOnly.toString() }),
      });

      const result: ApiResponse<DeliveryOrdersResponse> = await response.json();

      if (!result.success || !response.ok) {
        handleApiError(result, "Terjadi kesalahan saat mengambil data DO");
      }

      if (!result.data) {
        throw new Error("Data delivery order tidak ditemukan");
      }

      return result.data;
    },
    getNextPageParam: (
      lastPage: DeliveryOrdersResponse,
      allPages: DeliveryOrdersResponse[]
    ) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.pagination.total / limit);

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled,
    staleTime: 0, // 5 minutes
    refetchOnWindowFocus: 'always',
  });
}

export function useArchivedDeliveryOrders(
  options?: Omit<
    UseQueryOptions<
      DeliveryOrdersResponse,
      Error,
      DeliveryOrdersResponse,
      ReturnType<typeof deliveryOrderKeys.archived>
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
    queryKey: deliveryOrderKeys.archived(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/archived`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching archived delivery orders: ${response.statusText}`
        );
      }

      const result: ApiResponse<DeliveryOrdersResponse> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil data DO yang diarsipkan"
        );
      }

      if (!result.data) {
        throw new Error("Data delivery order yang diarsipkan tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}

export function useDeliveryOrder(
  { id, shipmentId }: { id: string; shipmentId?: string },
  options?: Omit<
    UseQueryOptions<
      DeliveryOrder,
      Error,
      DeliveryOrder,
      ReturnType<typeof deliveryOrderKeys.detail>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: deliveryOrderKeys.detail(id),
    queryFn: async () => {
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (shipmentId) {
          queryParams.append("shipmentId", shipmentId);
        }

        const url = shipmentId
          ? `${BASE_URL}/delivery-orders/${id}?${queryParams.toString()}`
          : `${BASE_URL}/delivery-orders/${id}`;

        const response = await fetchApi(url);

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching delivery order: ${response.statusText}`
          );
        }

        const result: ApiResponse<DeliveryOrder> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil detail DO"
          );
        }

        if (!result.data) {
          throw new Error("Detail delivery order tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useDeliveryOrder:", error);
        throw error;
      }
    },
    ...options,
  });
}

export function useCreateDeliveryOrder(
  options?: UseMutationOptions<DeliveryOrder, Error, CreateDeliveryOrderInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doData) => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders`,
        {},
        {
          method: "POST",
          body: JSON.stringify(doData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(
            createErrorResponse(result, "Gagal membuat delivery order")
          )
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({ message: "Data delivery order tidak ditemukan" })
        );
      }

      return result.data as DeliveryOrder;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(deliveryOrderKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.lists() });

      // Invalidate customer delivery orders if customer is specified
      if (data.customerId) {
        queryClient.invalidateQueries({
          queryKey: [
            ...customerKeys.detail(data.customerId),
            "delivery-orders",
          ],
        });
      }
    },
    ...options,
  });
}

export function useUpdateDeliveryOrder(
  options?: UseMutationOptions<
    DeliveryOrder,
    Error,
    { id: string } & UpdateDeliveryOrderInput
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      if (Object.keys(updateData).length === 0) {
        throw new Error(
          JSON.stringify({
            message: "Setidaknya satu field harus diisi untuk pembaruan",
          })
        );
      }

      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/${id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(
            createErrorResponse(result, "Gagal memperbarui delivery order")
          )
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({
            message: "Data delivery order yang diperbarui tidak ditemukan",
          })
        );
      }

      return result.data as DeliveryOrder;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(deliveryOrderKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.lists() });

      // Invalidate customer delivery orders for both old and new customer (if changed)
      if (data.customerId) {
        queryClient.invalidateQueries({
          queryKey: [
            ...customerKeys.detail(data.customerId),
            "delivery-orders",
          ],
        });
      }

      // If customer changed, also invalidate old customer's delivery orders
      if (variables.customerId && variables.customerId !== data.customerId) {
        queryClient.invalidateQueries({
          queryKey: [
            ...customerKeys.detail(variables.customerId),
            "delivery-orders",
          ],
        });
      }

      // Invalidate all shipments that use this DO (most important for the shipment detail page)
      queryClient.invalidateQueries({
        queryKey: ["shipmentsByDeliveryOrderId", data.id],
      });

      // Invalidate all shipment lists and details since they contain customer data
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.details(),
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all,
      });
    },
    ...options,
  });
}

export function useDeleteDeliveryOrder(
  options?: UseMutationOptions<void, Error, { id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/${id}`,
        {},
        { method: "DELETE" }
      );
      const result: ApiResponse<void> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengarsipkan delivery order");
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.archived({}),
      });
      queryClient.removeQueries({ queryKey: deliveryOrderKeys.detail(id) });

      // Invalidate shipments that used this DO
      queryClient.invalidateQueries({
        queryKey: ["shipmentsByDeliveryOrderId", id],
      });

      // Invalidate all shipment lists since they may contain items from this DO
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.lists(),
      });

      // Invalidate all customer delivery orders (since we don't know which customer this belonged to)
      queryClient.invalidateQueries({
        queryKey: [...customerKeys.all, "delivery-orders"],
      });
    },
    ...options,
  });
}

export function useRestoreDeliveryOrder(
  options?: UseMutationOptions<void, Error, { id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/${id}/restore`,
        {},
        { method: "PATCH" }
      );
      const result: ApiResponse<void> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memulihkan delivery order");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: deliveryOrderKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.archived({}),
      });
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.detail(variables.id),
      });
    },
    ...options,
  });
}

export function useDeliveryOrdersByIds(ids: string[], options = {}) {
  return useQuery({
    queryKey: ["deliveryOrdersByIds", ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];
      const response = await fetchApi(
        `${BASE_URL}/delivery-orders/by-ids`,
        {},
        {
          method: "POST",
          body: JSON.stringify({ ids }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      if (!result.success)
        throw new Error(result.message || "Gagal mengambil DO");
      return result.data?.deliveryOrders as DeliveryOrder[];
    },
    enabled: !!ids && ids.length > 0,
    ...options,
  });
}
