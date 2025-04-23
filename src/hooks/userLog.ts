import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchWithAuth } from "@/utils/fetch";
import { useSearchParams } from "react-router";
import { UserLogsResponse } from "@/types/userLog";

// Query keys untuk caching
export const userLogKeys = {
  all: ["userLogs"] as const,
  lists: () => [...userLogKeys.all, "list"] as const,
  list: (userId: string, filters: Record<string, unknown>) => [...userLogKeys.lists(), userId, { filters }] as const,
};

type ErrorData = JoiValidationError | CustomError;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Hook untuk mengambil log pengguna dengan pagination
export function useUserLogs(userId: string, options?: Omit<UseQueryOptions<UserLogsResponse, Error, UserLogsResponse, ReturnType<typeof userLogKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  // Buat objek filters dengan semua parameter URL untuk query key
  const filters = {
    page,
    limit,
  };

  return useQuery({
    queryKey: userLogKeys.list(userId, filters),
    queryFn: async () => {
      // Build URL with search params
      const url = new URL(`${API_BASE_URL}/logs/user/${userId}`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", limit);

      const response = await fetchWithAuth(url.toString());
      if (!response.ok) {
        throw new Error(`Error fetching user logs: ${response.statusText}`);
      }

      const result: ApiResponse<UserLogsResponse> = await response.json();

      if (!result.success) {
        const errorData = result.data as unknown as ErrorData;
        throw new Error(errorData.message || "Terjadi kesalahan");
      }

      if (!result.data || !result.data.logs) {
        throw new Error("Data log pengguna tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}
