import { ApiResponse } from "@/types/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { UserLogsResponse } from "@/types/userLog";
import { fetchApi } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { BASE_URL } from "@/constant/baseUrl";

// Query keys untuk caching
export const userLogKeys = {
  all: ["userLogs"] as const,
  lists: () => [...userLogKeys.all, "list"] as const,
  list: (userId: string, filters: Record<string, unknown>) => [...userLogKeys.lists(), userId, { filters }] as const,
};

// Hook untuk mengambil log pengguna dengan pagination
export function useUserLogs(userId: string, options?: Omit<UseQueryOptions<UserLogsResponse, Error, UserLogsResponse, ReturnType<typeof userLogKeys.list>>, "queryKey" | "queryFn">) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return useQuery({
    queryKey: userLogKeys.list(userId, filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/logs/user/${userId}`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching user logs: ${response.statusText}`);
      }

      const result: ApiResponse<UserLogsResponse> = await response.json();

      if (!result.success) {
        handleApiError(result, "Terjadi kesalahan");
      }

      if (!result.data?.logs) {
        throw new Error("Data log pengguna tidak ditemukan");
      }

      return result.data;
    },
    ...options,
  });
}
