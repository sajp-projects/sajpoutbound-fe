import { ApiResponse, CustomError, JoiValidationError } from "@/types/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { UserLogsResponse } from "@/types/userLog";
import { fetchApi } from "@/utils/api";

// Query keys untuk caching
export const userLogKeys = {
  all: ["userLogs"] as const,
  lists: () => [...userLogKeys.all, "list"] as const,
  list: (userId: string, filters: Record<string, unknown>) => [...userLogKeys.lists(), userId, { filters }] as const,
};

type ErrorData = JoiValidationError | CustomError;

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
      // Gunakan API helper untuk URL yang lebih simpel
      const response = await fetchApi(`/logs/user/${userId}`, {
        page,
        limit,
      });

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
