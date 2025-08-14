import { BASE_URL } from "@/constant/baseUrl";
import { ApiErrorResult, ApiResponse } from "@/types/api";
import {
  CreateProductInput,
  Product,
  ProductsResponse,
  UpdateProductInput,
} from "@/types/product";
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
import { warehouseKeys } from "./warehouse";
import { deliveryOrderKeys } from "./do";
import { shipmentKeys } from "./shipment";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...productKeys.lists(), { filters }] as const,
  infinite: (filters: Record<string, unknown>) =>
    [...productKeys.lists(), "infinite", { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  logs: () => [...productKeys.all, "logs"] as const,
};

export function useProducts(
  options?: Omit<
    UseQueryOptions<
      ProductsResponse,
      Error,
      ProductsResponse,
      ReturnType<typeof productKeys.list>
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
    queryKey: productKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/products`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }

      const result: ApiResponse<ProductsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil data barang");
      }

      if (!result.data) {
        throw new Error("Data barang tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useInfiniteProducts(options?: {
  searchQuery?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { searchQuery = "", limit = 10, enabled = true } = options || {};

  return useInfiniteQuery({
    queryKey: productKeys.infinite({ search: searchQuery, limit }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await fetchApi(`${BASE_URL}/products`, {
        page: pageParam.toString(),
        limit: limit.toString(),
        search: searchQuery,
      });

      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }

      const result: ApiResponse<ProductsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil data barang");
      }

      if (!result.data) {
        throw new Error("Data barang tidak ditemukan");
      }

      return result.data;
    },
    getNextPageParam: (lastPage: ProductsResponse, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.pagination.total / limit);

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useProduct(
  { id }: { id: string },
  options?: Omit<
    UseQueryOptions<
      Product,
      Error,
      Product,
      ReturnType<typeof productKeys.detail>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/products/${id}`);

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching product: ${response.statusText}`
          );
        }

        const result: ApiResponse<Product> = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil detail barang"
          );
        }

        if (!result.data) {
          throw new Error("Detail barang tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useProduct:", error);
        throw error;
      }
    },
    ...options,
  });
}

export function useCreateProduct(
  options?: UseMutationOptions<Product, Error, CreateProductInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      const response = await fetchApi(
        `${BASE_URL}/products`,
        {},
        {
          method: "POST",
          body: JSON.stringify(productData),
        }
      );

      const result = (await response.json()) as ApiErrorResult;

      if (!result.success) {
        throw new Error(
          JSON.stringify(createErrorResponse(result, "Gagal membuat barang"))
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({ message: "Data barang tidak ditemukan" })
        );
      }

      return result.data as Product;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(productKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Invalidate warehouse products since this product might be in warehouses
      queryClient.invalidateQueries({
        queryKey: [...warehouseKeys.all, "products"]
      });
      
      // Invalidate DOs and shipments since product names are embedded in items
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.lists()
      });
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

export function useUpdateProduct(
  options?: UseMutationOptions<
    Product,
    Error,
    { id: string } & UpdateProductInput
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
        `${BASE_URL}/products/${id}`,
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
            createErrorResponse(result, "Gagal memperbarui barang")
          )
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({
            message: "Data barang yang diperbarui tidak ditemukan",
          })
        );
      }

      return result.data as Product;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(productKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      
      // Invalidate warehouse products since this product might be in warehouses
      queryClient.invalidateQueries({
        queryKey: [...warehouseKeys.all, "products"]
      });
      
      // Invalidate DOs and shipments since product names are embedded in items
      queryClient.invalidateQueries({
        queryKey: deliveryOrderKeys.lists()
      });
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

export function useDeleteProduct(
  options?: UseMutationOptions<void, Error, { id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(
        `${BASE_URL}/products/${id}`,
        {},
        { method: "DELETE" }
      );
      const result: ApiResponse<void> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus barang");
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
    },
    ...options,
  });
}
