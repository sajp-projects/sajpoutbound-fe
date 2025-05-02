// hooks untuk barang
import { ApiResponse, ApiErrorResult } from "@/types/api";
import { CreateProductInput, Product, ProductsResponse, UpdateProductInput } from "@/types/barang";
import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { fetchApi } from "@/utils/api";
import { handleApiError, createErrorResponse } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";

// Query keys untuk caching
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  logs: () => [...productKeys.all, "logs"] as const,
};

// Hook untuk mengambil daftar barang dengan pagination
export function useProducts(options?: Omit<UseQueryOptions<ProductsResponse, Error, ProductsResponse, ReturnType<typeof productKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
    search: searchParams.get("search") || "",
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

// Hook untuk mengambil detail barang berdasarkan ID
export function useProduct({ id }: { id: string }, options?: Omit<UseQueryOptions<Product, Error, Product, ReturnType<typeof productKeys.detail>>, "queryKey" | "queryFn">) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/products/${id}`);

      if (!response.ok) {
        throw new Error(`Error fetching product: ${response.statusText}`);
      }

      const result: ApiResponse<Product> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil detail barang");
      }

      if (!result.data) {
        throw new Error("Detail barang tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}

// Hook untuk membuat barang baru
export function useCreateProduct(options?: UseMutationOptions<Product, Error, CreateProductInput>) {
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
        throw new Error(JSON.stringify(createErrorResponse(result, "Gagal membuat barang")));
      }

      if (!result.data) {
        throw new Error(JSON.stringify({ message: "Data barang tidak ditemukan" }));
      }

      return result.data as Product;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(productKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    ...options,
  });
}

// Hook untuk memperbarui barang
export function useUpdateProduct(options?: UseMutationOptions<Product, Error, { id: string } & UpdateProductInput>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }) => {
      if (Object.keys(updateData).length === 0) {
        throw new Error(JSON.stringify({ message: "Setidaknya satu field harus diisi untuk pembaruan" }));
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
        throw new Error(JSON.stringify(createErrorResponse(result, "Gagal memperbarui barang")));
      }

      if (!result.data) {
        throw new Error(JSON.stringify({ message: "Data barang yang diperbarui tidak ditemukan" }));
      }

      return result.data as Product;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(productKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    ...options,
  });
}

// Hook untuk menghapus barang
export function useDeleteProduct(options?: UseMutationOptions<void, Error, { id: string }>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(`${BASE_URL}/products/${id}`, {}, { method: "DELETE" });
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
