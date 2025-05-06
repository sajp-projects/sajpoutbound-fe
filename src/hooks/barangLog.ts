
import { ApiResponse } from "@/types/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { ProductLogsResponse } from "@/types/barangLog";
import { fetchApi } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";


export const productLogKeys = {
  all: ["productLogs"] as const,
  lists: () => [...productLogKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...productLogKeys.lists(), { filters }] as const,
  productLogs: (productId: string, filters: Record<string, unknown>) => [...productLogKeys.lists(), productId, { filters }] as const,
};


export function useProductLogs(options?: Omit<UseQueryOptions<ProductLogsResponse, Error, ProductLogsResponse, ReturnType<typeof productLogKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return useQuery({
    queryKey: productLogKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/products/logs`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching product logs: ${response.statusText}`);
      }

      const result: ApiResponse<ProductLogsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil log barang");
      }

      if (!result.data?.logs) {
        throw new Error("Data log barang tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}


export function useProductLogsByProductId(productId: string, options?: Omit<UseQueryOptions<ProductLogsResponse, Error, ProductLogsResponse, ReturnType<typeof productLogKeys.productLogs>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return useQuery({
    queryKey: productLogKeys.productLogs(productId, filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/products/logs/${productId}`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching product logs: ${response.statusText}`);
      }

      const result: ApiResponse<ProductLogsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan saat mengambil log barang");
      }

      if (!result.data?.logs) {
        throw new Error("Data log barang tidak ditemukan");
      }

      return result.data;
    },
    enabled: !!productId,
    ...options,
  });
}
