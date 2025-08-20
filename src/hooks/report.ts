import { BASE_URL } from "@/constant/baseUrl";
import { ApiResponse } from "@/types/api";
import {
  DashboardSummaryFilter,
  DashboardSummaryResult,
  OperationalReportResponse,
  OperationalReportTableData,
  OutputReportResult,
  OutputReportTableData,
  ShipmentAssignmentReportResult,
} from "@/types/report";
import { fetchApi } from "@/utils/api";
import { axiosInstance } from "@/utils/axios";
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
  operationalTable: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "operational-table", { filters }] as const,
  output: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "output", { filters }] as const,
  outputTable: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "output-table", { filters }] as const,
  shipmentAssignment: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "shipment-assignment", { filters }] as const,
  dashboardSummary: (filters: Record<string, unknown>) =>
    [...reportKeys.all, "dashboard-summary", { filters }] as const,
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
      OperationalReportResponse,
      Error,
      OperationalReportResponse,
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

      const result: ApiResponse<OperationalReportResponse> =
        await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil laporan operasional"
        );
      }

      if (!result.data) {
        throw new Error("Data laporan operasional tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useOperationalReportTable(
  overrides: Record<string, string | number | null | undefined> = {},
  options?: Omit<
    UseQueryOptions<
      OperationalReportTableData,
      Error,
      OperationalReportTableData,
      ReturnType<typeof reportKeys.operationalTable>
    >,
    "queryKey" | "queryFn"
  >
) {
  const filters = useDefaultFilters(overrides);

  return useQuery({
    queryKey: reportKeys.operationalTable(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/reports/operational/table`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching operational report table: ${response.statusText}`
        );
      }

      const result: ApiResponse<OperationalReportTableData> =
        await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil data tabel operasional"
        );
      }

      if (!result.data) {
        throw new Error("Data tabel operasional tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useOutputReport(
  overrides: Record<string, string | number | null | undefined> = {},
  options?: Omit<
    UseQueryOptions<
      OutputReportResult,
      Error,
      OutputReportResult,
      ReturnType<typeof reportKeys.output>
    >,
    "queryKey" | "queryFn"
  >
) {
  const filters = useDefaultFilters(overrides);

  return useQuery({
    queryKey: reportKeys.output(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/reports/daily-output`,
        filters
      );

      if (!response.ok) {
        throw new Error(`Error fetching output report: ${response.statusText}`);
      }

      const result: ApiResponse<{ report: OutputReportResult }> =
        await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil laporan pengeluaran"
        );
      }

      if (!result.data) {
        throw new Error("No data returned from output report API");
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
      {
        report: ShipmentAssignmentReportResult;
        pagination?: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      },
      Error,
      {
        report: ShipmentAssignmentReportResult;
        pagination?: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      },
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

      const result: ApiResponse<{
        report: ShipmentAssignmentReportResult;
        pagination?: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil laporan penugasan pengiriman"
        );
      }

      if (!result.data) {
        throw new Error("Data laporan penugasan pengiriman tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useOutputReportTable(
  overrides: Record<string, string | number | null | undefined> = {},
  options?: Omit<
    UseQueryOptions<
      OutputReportTableData,
      Error,
      OutputReportTableData,
      ReturnType<typeof reportKeys.outputTable>
    >,
    "queryKey" | "queryFn"
  >
) {
  const filters = useDefaultFilters(overrides);

  return useQuery({
    queryKey: reportKeys.outputTable(filters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/reports/daily-output/table`,
        filters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching output report table: ${response.statusText}`
        );
      }

      const result: ApiResponse<OutputReportTableData> = await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil data tabel pengeluaran"
        );
      }

      if (!result.data) {
        throw new Error("Data tabel pengeluaran tidak ditemukan");
      }

      return result.data;
    },
    refetchOnWindowFocus: true,
    ...options,
  });
}

export function useDashboardSummary(
  filters: DashboardSummaryFilter = {},
  options?: Omit<
    UseQueryOptions<
      DashboardSummaryResult,
      Error,
      DashboardSummaryResult,
      ReturnType<typeof reportKeys.dashboardSummary>
    >,
    "queryKey" | "queryFn"
  >
) {
  // Convert filters to a plain object with only defined string/number values for query params
  const queryFilters: Record<string, string | number | null | undefined> = {};
  if (filters.startDate) queryFilters.startDate = filters.startDate;
  if (filters.endDate) queryFilters.endDate = filters.endDate;

  return useQuery({
    queryKey: reportKeys.dashboardSummary(queryFilters),
    queryFn: async () => {
      const response = await fetchApi(
        `${BASE_URL}/reports/dashboard-summary`,
        queryFilters
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching dashboard summary: ${response.statusText}`
        );
      }

      const result: ApiResponse<{ summary: DashboardSummaryResult }> =
        await response.json();

      if (!result.success) {
        handleApiError(
          result,
          "Terjadi kesalahan saat mengambil ringkasan dashboard"
        );
      }

      if (!result.data) {
        throw new Error("Data ringkasan dashboard tidak ditemukan");
      }

      return result.data.summary;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

/**
 * Download expenditure Excel report
 */
export async function downloadExpenditureExcel(filters: {
  period?: 'daily' | 'monthly' | 'yearly';
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  warehouseId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters.period) queryParams.append('period', filters.period);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.year) queryParams.append('year', filters.year.toString());
  if (filters.month) queryParams.append('month', filters.month.toString());
  if (filters.warehouseId) queryParams.append('warehouseId', filters.warehouseId);

  try {

    const response = await axiosInstance({
      method: 'GET',
      url: `${BASE_URL}/reports/expenditure/excel`,
      params: Object.fromEntries(queryParams),
      responseType: 'blob', // Important for file downloads
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Extract filename from content-disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'laporan_expenditure.xlsx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    throw error;
  }
}
