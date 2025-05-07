import {
  Armada,
  ArmadasResponse,
  CreateArmadaInput,
  UpdateArmadaInput,
} from "@/types/armada";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { fetchApi } from "@/utils/api";
import { BASE_URL } from "@/constant/baseUrl";

export const armadaKeys = {
  all: ["armadas"] as const,
  lists: () => [...armadaKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...armadaKeys.lists(), { filters }] as const,
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
  >
) {
  const [searchParams] = useSearchParams();
  const filters = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
    search: searchParams.get("search") || "",
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
      const response = await fetchApi(`${BASE_URL}/armadas/${id}`);

      if (!response.ok) {
        throw new Error(`Error fetching armada: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Terjadi kesalahan saat mengambil detail armada");
      }

      if (!result.data) {
        throw new Error("Detail armada tidak ditemukan");
      }

      return result.data;
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
