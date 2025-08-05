import { BASE_URL } from "@/constant/baseUrl";
import {
  Armada,
  ArmadasResponse,
  CreateArmadaInput,
  UpdateArmadaInput,
} from "@/types/armada";
import { fetchApi } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router";

export const armadaKeys = {
  all: ["armadas"] as const,
  lists: () => [...armadaKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...armadaKeys.lists(), { filters }] as const,
  infinite: (filters: Record<string, unknown>) =>
    [...armadaKeys.lists(), "infinite", { filters }] as const,
  details: () => [...armadaKeys.all, "detail"] as const,
  detail: (id: string) => [...armadaKeys.details(), id] as const,
  logs: () => [...armadaKeys.all, "logs"] as const,
};

export function useArmadas(
  options?: Omit<
    UseQueryOptions<
      ArmadasResponse,
      Error,
      ArmadasResponse,
      ReturnType<typeof armadaKeys.list>
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
    queryKey: armadaKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/armadas`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching armadas: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Terjadi kesalahan saat mengambil data armada");
      }

      if (!result.data) {
        throw new Error("Data armada tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useInfiniteArmadas(options?: {
  searchQuery?: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { searchQuery = "", limit = 10, enabled = true } = options || {};

  return useInfiniteQuery({
    queryKey: armadaKeys.infinite({ search: searchQuery, limit }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await fetchApi(`${BASE_URL}/armadas`, {
        page: pageParam.toString(),
        limit: limit.toString(),
        search: searchQuery,
      });

      const result = await response.json();

      if (!response.ok) {
        handleApiError(
          result,
          `Error fetching armadas: ${response.statusText}`
        );
      }

      return result.data;
    },
    getNextPageParam: (lastPage: ArmadasResponse, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.pagination.total / limit);

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useArmada(
  { id }: { id: string },
  options?: Omit<
    UseQueryOptions<
      Armada,
      Error,
      Armada,
      ReturnType<typeof armadaKeys.detail>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: armadaKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/armadas/${id}`);

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching armada: ${response.statusText}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil detail armada"
          );
        }

        if (!result.data) {
          throw new Error("Detail armada tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useArmada:", error);
        throw error;
      }
    },
    ...options,
  });
}

export function useCreateArmada(
  options?: UseMutationOptions<Armada, Error, CreateArmadaInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (armadaData) => {
      const response = await fetchApi(
        `${BASE_URL}/armadas`,
        {},
        {
          method: "POST",
          body: JSON.stringify(armadaData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          JSON.stringify({
            message: result.message || "Gagal membuat armada",
            errorType: result.errorType,
            details: result.details,
          })
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({ message: "Data armada tidak ditemukan" })
        );
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(armadaKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: armadaKeys.lists() });
    },
    ...options,
  });
}

export function useUpdateArmada(
  options?: UseMutationOptions<
    Armada,
    Error,
    { id: string } & UpdateArmadaInput
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
        `${BASE_URL}/armadas/${id}`,
        {},
        {
          method: "PUT",
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          JSON.stringify({
            message: result.message || "Gagal memperbarui armada",
            errorType: result.errorType,
            details: result.details,
          })
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({
            message: "Data armada yang diperbarui tidak ditemukan",
          })
        );
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(armadaKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: armadaKeys.lists() });
    },
    ...options,
  });
}

export function useDeleteArmada(
  options?: UseMutationOptions<Armada, Error, { id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(
        `${BASE_URL}/armadas/${id}`,
        {},
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus armada");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal menghapus armada");
      }

      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: armadaKeys.lists() });
      queryClient.removeQueries({ queryKey: armadaKeys.detail(id) });
    },
    ...options,
  });
}
