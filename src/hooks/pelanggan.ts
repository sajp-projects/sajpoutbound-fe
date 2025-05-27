import { ApiResponse, ApiErrorResult } from "@/types/api";
import {
  Customer,
  CustomerInput,
  CustomerUpdateInput,
  CustomersResponse,
} from "@/types/pelanggan";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { fetchApi } from "@/utils/api";
import { handleApiError, createErrorResponse } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...customerKeys.lists(), { filters }] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
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

      if (!response.ok) {
        throw new Error(`Error deleting customer: ${response.statusText}`);
      }

      const result: ApiResponse<Customer> = await response.json();

      if (!result.success) {
        handleApiError(result, "Gagal menghapus pelanggan");
      }

      return result.data!;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
    },
    ...options,
  });
}
