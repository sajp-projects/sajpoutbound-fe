import { BASE_URL } from "@/constant/baseUrl";
import { ApiErrorResult, ApiResponse } from "@/types/api";
import {
  Customer,
  CustomerInput,
  CustomerUpdateInput,
  CustomersResponse,
} from "@/types/customer";
import { DeliveryOrdersResponse } from "@/types/do";
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
import { deliveryOrderKeys } from "./do";
import { shipmentKeys } from "./shipment";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...customerKeys.lists(), { filters }] as const,
  infinite: (filters: Record<string, unknown>) =>
    [...customerKeys.lists(), "infinite", { filters }] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  deliveryOrders: (id: string) => [...customerKeys.detail(id), "delivery-orders"] as const,
  deliveryOrdersList: (id: string, filters: Record<string, unknown>) =>
    [...customerKeys.deliveryOrders(id), { filters }] as const,
};

export function useCustomer(
  { id }: { id: string },
  options?: Omit<
    UseQueryOptions<
      Customer,
      Error,
      Customer,
      ReturnType<typeof customerKeys.detail>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/customers/${id}`);

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching customer: ${response.statusText}`
          );
        }

        const result: ApiResponse<Customer> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil data pelanggan"
          );
        }

        if (!result.data) {
          throw new Error("Data pelanggan tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useCustomer:", error);
        throw error;
      }
    },
    ...options,
  });
}

export function useCustomers(
  options?: Omit<
    UseQueryOptions<
      CustomersResponse,
      Error,
      CustomersResponse,
      ReturnType<typeof customerKeys.list>
    >,
    "queryKey" | "queryFn"
  > & {
    searchQuery?: string;
  }
) {
  const [searchParams] = useSearchParams();
  const searchQuery = options?.searchQuery;

  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
    search:
      searchQuery !== undefined
        ? searchQuery
        : searchParams.get("search") || "",
  };

  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/customers`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.statusText}`);
      }

      const result: ApiResponse<CustomersResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan");
      }

      if (!result.data) {
        throw new Error("Data pelanggan tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useInfiniteCustomers(options?: {
  searchQuery?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { searchQuery = "", limit = 10, enabled = true } = options || {};

  return useInfiniteQuery({
    queryKey: customerKeys.infinite({ search: searchQuery, limit }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await fetchApi(`${BASE_URL}/customers`, {
        page: pageParam.toString(),
        limit: limit.toString(),
        search: searchQuery,
      });

      if (!response.ok) {
        throw new Error(`Error fetching customers: ${response.statusText}`);
      }

      const result: ApiResponse<CustomersResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan");
      }

      if (!result.data) {
        throw new Error("Data pelanggan tidak ditemukan");
      }

      return result.data;
    },
    getNextPageParam: (lastPage: CustomersResponse, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.pagination.total / limit);

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateCustomer(
  options?: UseMutationOptions<Customer, Error, CustomerInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerData) => {
      const response = await fetchApi(
        `${BASE_URL}/customers`,
        {},
        {
          method: "POST",
          body: JSON.stringify(customerData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(createErrorResponse(result, "Gagal membuat pelanggan"))
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({ message: "Data pelanggan tidak ditemukan" })
        );
      }

      return result.data as Customer;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(customerKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate delivery orders for this customer
      queryClient.invalidateQueries({
        queryKey: [...customerKeys.detail(data.id), "delivery-orders"]
      });
    },
    ...options,
  });
}

export function useUpdateCustomer(
  options?: UseMutationOptions<
    Customer,
    Error,
    { id: string } & CustomerUpdateInput
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      if (Object.keys(updateData).length === 0) {
        throw new Error(
          JSON.stringify({
            message: "Minimal satu field harus diisi untuk update",
          })
        );
      }

      const response = await fetchApi(
        `${BASE_URL}/customers/${id}`,
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
            createErrorResponse(result, "Gagal memperbarui pelanggan")
          )
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({
            message: "Data pelanggan yang diperbarui tidak ditemukan",
          })
        );
      }

      return result.data as Customer;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(customerKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Invalidate delivery orders for this customer
      queryClient.invalidateQueries({
        queryKey: [...customerKeys.detail(data.id), "delivery-orders"]
      });
      
      // Invalidate all delivery orders that belong to this customer
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.lists()
      });
      
      // Invalidate all shipments since they contain customer data through DOs
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.all
      });
    },
    ...options,
  });
}

export function useDeleteCustomer(
  options?: UseMutationOptions<Customer, Error, { id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(
        `${BASE_URL}/customers/${id}`,
        {},
        { method: "DELETE" }
      );


      const result: ApiResponse<Customer> = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Error deleting customer: ${response.statusText}`
        );
      }

      if (!result.success) {
        handleApiError(result, "Gagal menghapus pelanggan");
      }

      return result.data!;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
      
      // Invalidate delivery orders for this customer
      queryClient.invalidateQueries({
        queryKey: [...customerKeys.detail(id), "delivery-orders"]
      });
      
      // Invalidate all delivery orders since we don't know which ones belonged to this customer
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.lists()
      });
      
      // Invalidate all shipments since they may contain items from this customer's DOs
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: shipmentKeys.details()
      });
    },
    ...options,
  });
}

export function useCustomerDeliveryOrders(
  { customerId }: { customerId: string },
  options?: Omit<
    UseQueryOptions<
      DeliveryOrdersResponse,
      Error,
      DeliveryOrdersResponse,
      ReturnType<typeof customerKeys.deliveryOrdersList>
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
    queryKey: customerKeys.deliveryOrdersList(customerId, filters),
    queryFn: async () => {
      try {
        const response = await fetchApi(
          `${BASE_URL}/customers/${customerId}/delivery-orders`,
          filters
        );

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching customer delivery orders: ${response.statusText}`
          );
        }

        const result: ApiResponse<DeliveryOrdersResponse> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil data delivery order"
          );
        }

        if (!result.data) {
          throw new Error("Data delivery order tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useCustomerDeliveryOrders:", error);
        throw error;
      }
    },
    ...options,
  });
}
