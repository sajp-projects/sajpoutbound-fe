import { BASE_URL } from "@/constant/baseUrl";
import {
  Driver,
  DriverCreateInput,
  DriversResponse,
  DriverUpdateInput,
} from "@/types/driver";
import { fetchApi } from "@/utils/api";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { useSearchParams } from "react-router";

export const driverKeys = {
  all: ["drivers"] as const,
  lists: () => [...driverKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...driverKeys.lists(), { filters }] as const,
  infinite: (filters: Record<string, unknown>) =>
    [...driverKeys.lists(), "infinite", { filters }] as const,
  details: () => [...driverKeys.all, "detail"] as const,
  detail: (id: string) => [...driverKeys.details(), id] as const,
  active: () => [...driverKeys.all, "active"] as const,
};

export function useDrivers(
  options?: Omit<
    UseQueryOptions<
      DriversResponse,
      Error,
      DriversResponse,
      ReturnType<typeof driverKeys.list>
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
    queryKey: driverKeys.list(filters),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/drivers`, filters);

      if (!response.ok) {
        throw new Error(`Error fetching drivers: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Terjadi kesalahan saat mengambil data supir");
      }

      if (!result.data) {
        throw new Error("Data supir tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useActiveDrivers(
  options?: Omit<
    UseQueryOptions<
      Driver[],
      Error,
      Driver[],
      ReturnType<typeof driverKeys.active>
    >,
    "queryKey" | "queryFn"
  > & {
    searchQuery?: string;
    enabled?: boolean;
  }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: driverKeys.active(),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/drivers/active`);

      if (!response.ok) {
        throw new Error(
          `Error fetching active drivers: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error("Terjadi kesalahan saat mengambil data supir aktif");
      }

      if (!result.data) {
        throw new Error("Data supir aktif tidak ditemukan");
      }

      return result.data.drivers;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useDriver(
  { id }: { id: string },
  options?: Omit<
    UseQueryOptions<
      Driver,
      Error,
      Driver,
      ReturnType<typeof driverKeys.detail>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: driverKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await fetchApi(`${BASE_URL}/drivers/${id}`);

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(
            errorResult.message ||
              `Error fetching driver: ${response.statusText}`
          );
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Terjadi kesalahan saat mengambil detail supir"
          );
        }

        if (!result.data) {
          throw new Error("Detail supir tidak ditemukan");
        }

        return result.data;
      } catch (error) {
        console.error("Error in useDriver:", error);
        throw error;
      }
    },
    ...options,
  });
}

export function useCreateDriver(
  options?: UseMutationOptions<Driver, Error, DriverCreateInput>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverData) => {
      const response = await fetchApi(
        `${BASE_URL}/drivers`,
        {},
        {
          method: "POST",
          body: JSON.stringify(driverData),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          JSON.stringify({
            message: result.message || "Gagal membuat supir",
            errorType: result.errorType,
            details: result.details,
          })
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({ message: "Data supir tidak ditemukan" })
        );
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(driverKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: driverKeys.lists() });
      queryClient.invalidateQueries({ queryKey: driverKeys.active() });
    },
    ...options,
  });
}

export function useUpdateDriver(
  options?: UseMutationOptions<
    Driver,
    Error,
    { id: string } & DriverUpdateInput
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
        `${BASE_URL}/drivers/${id}`,
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
            message: result.message || "Gagal memperbarui supir",
            errorType: result.errorType,
            details: result.details,
          })
        );
      }

      if (!result.data) {
        throw new Error(
          JSON.stringify({
            message: "Data supir yang diperbarui tidak ditemukan",
          })
        );
      }

      return result.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(driverKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: driverKeys.lists() });
      queryClient.invalidateQueries({ queryKey: driverKeys.active() });
    },
    ...options,
  });
}

export function useDeleteDriver(
  options?: UseMutationOptions<Driver, Error, { id: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      const response = await fetchApi(
        `${BASE_URL}/drivers/${id}`,
        {},
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menghapus supir");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal menghapus supir");
      }

      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.lists() });
      queryClient.invalidateQueries({ queryKey: driverKeys.active() });
      queryClient.removeQueries({ queryKey: driverKeys.detail(id) });
    },
    ...options,
  });
}
