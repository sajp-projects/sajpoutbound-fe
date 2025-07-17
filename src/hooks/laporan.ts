import { BASE_URL } from "@/constant/baseUrl";
import { ApiResponse } from "@/types/api";
import {
  DailyOutputReportResult,
  MonthlyOutputReportResult,
} from "@/types/report";
import { fetchApi } from "@/utils/api";
import { handleApiError } from "@/utils/errorHandler";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

/**
 * Query keys for all report-related queries
 */
export const reportKeys = {
  all: ["reports"] as const,
  operational: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "operational", { filters }] as const,
  dailyOutput: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "daily-output", { filters }] as const,
  monthlyOutput: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "monthly-output", { filters }] as const,
  shipmentAssignment: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "shipment-assignment", { filters }] as const,
  dashboardSummary: () => [...reportKeys.all, "dashboard-summary"] as const,
};

/**
 * Helper to build default filters from the current URL and optional overrides
 */
function useDefaultFilters(
  overrides: Record<string, string | number | null | undefined> = {}
) {
  const [searchParams] = useSearchParams();

  const base: Record<string, string | number | null | undefined> = {
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
  };

  return { ...base, ...overrides };
}

export function useOperationalReport(
  overrides: Record<string, string | number | null | undefined> = {},
  options?: Omit<
    UseQueryOptions<
      unknown,
      Error,
      unknown,
      ReturnType<typeof reportKeys.operational>
    >,
    "queryKey" | "queryFn"
  >
) {
  const filters = useDefaultFilters(overrides);

  return useQuery({
    queryKey: reportKeys.operational(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/reports/operational`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching operational report: ${response.statusText}`
        );
      }

      const result: ApiResponse<unknown> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil laporan operasional"
        );
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useDailyOutputReport(
  overrides: Record<string, string | number | null | undefined> = {},
  options?: Omit<
    UseQueryOptions<
      DailyOutputReportResult,
      Error,
      DailyOutputReportResult,
      ReturnType<typeof reportKeys.dailyOutput>
    >,
    "queryKey" | "queryFn"
  >
) {
  const filters = useDefaultFilters(overrides);

  return useQuery({
    queryKey: reportKeys.dailyOutput(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/reports/daily-output`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching daily output report: ${response.statusText}`
        );
      }

      const result: ApiResponse<{ report: DailyOutputReportResult }> =
        await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil laporan pengeluaran harian"
        );
      }

      if (!result.data) {
        throw new Error("No data returned from daily output report API");
      }
      return result.data.report;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useMonthlyOutputReport(
  overrides: Record<string, string | number | null | undefined> = {},
  options?: Omit<
    UseQueryOptions<
      MonthlyOutputReportResult,
      Error,
      MonthlyOutputReportResult,
      ReturnType<typeof reportKeys.monthlyOutput>
    >,
    "queryKey" | "queryFn"
  >
) {
  const filters = useDefaultFilters(overrides);

  return useQuery({
    queryKey: reportKeys.monthlyOutput(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/reports/monthly-output`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching monthly output report: ${response.statusText}`
        );
      }

      const result: ApiResponse<{ report: MonthlyOutputReportResult }> =
        await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil laporan pengeluaran bulanan"
        );
      }

      if (!result.data) {
        throw new Error("No data returned from monthly output report API");
      }
      return result.data.report;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useShipmentAssignmentReport(
  overrides: Record<string, string | number | null | undefined> = {},
  options?: Omit<
    UseQueryOptions<
      unknown,
      Error,
      unknown,
      ReturnType<typeof reportKeys.shipmentAssignment>
    >,
    "queryKey" | "queryFn"
  >
) {
  const filters = useDefaultFilters(overrides);

  return useQuery({
    queryKey: reportKeys.shipmentAssignment(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/reports/shipment-assignment`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching shipment assignment report: ${response.statusText}`
        );
      }

      const result: ApiResponse<unknown> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil laporan penugasan pengiriman"
        );
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useDashboardSummary(
  options?: Omit<
    UseQueryOptions<
      unknown,
      Error,
      unknown,
      ReturnType<typeof reportKeys.dashboardSummary>
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: reportKeys.dashboardSummary(),
    queryFn: async () => {
      const response = await fetchApi(`${BASE_URL}/reports/dashboard-summary`);

      if (!response.ok) {
        throw new Error(
          `Error fetching dashboard summary: ${response.statusText}`
        );
      }

      const result: ApiResponse<unknown> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil ringkasan dashboard"
        );
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}
