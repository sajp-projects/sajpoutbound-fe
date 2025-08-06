import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { VerifiedArmadaCarousel } from "@/components/VerifiedArmadaCarousel";
import ShipmentAssignmentTablePaginated from "@/components/report/ShipmentAssignmentTablePaginated";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { useShipmentAssignmentReport } from "@/hooks/report";
import type {
  ShipmentAssignmentKPI,
  ShipmentAssignmentReportResult,
} from "@/types/report";
import { AlertCircle, BarChart3, Timer, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useSearchParams } from "react-router";

export default function LaporanPenugasanPengiriman() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize states from URL parameters
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>(() => {
    const today = new Date(new Date().setHours(23, 59, 59, 999))
      .toISOString()
      .slice(0, 10);
    return {
      startDate: searchParams.get("startDate") || today,
      endDate: searchParams.get("endDate") || today,
    };
  });

  // Sync URL parameters with state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("startDate", dateRange.startDate);
    params.set("endDate", dateRange.endDate);

    setSearchParams(params, { replace: true });
  }, [dateRange, setSearchParams]);

  const { data, isLoading, isError, error, refetch } =
    useShipmentAssignmentReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }) as {
      data?: { report: ShipmentAssignmentReportResult };
      isLoading: boolean;
      isError: boolean;
      error: unknown;
      refetch: () => void;
    };

  const kpi: ShipmentAssignmentKPI | undefined = data?.report.kpi;

  if (isLoading) {
    return <LoadingState text="Memuat laporan penugasan pengiriman..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat laporan penugasan pengiriman"
        message={error instanceof Error ? error.message : "Terjadi kesalahan"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col px-2 space-y-4 w-full min-h-full sm:space-y-6 sm:px-4 md:px-0">
      {/* Outer header: title/subtitle left, filters right */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 md:gap-4 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Laporan Penugasan Pengiriman
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto items-start sm:items-center justify-start sm:justify-end">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(range) => {
              setDateRange(range);
            }}
          />
        </div>
      </div>

      {/* Main card/container for assignment report */}
      <div className="overflow-hidden p-3 w-full bg-white rounded-lg shadow border border-gray-100 sm:p-4 md:p-6">
        {/* Internal header: title left */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 mt-2 gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Laporan Penugasan Pengiriman
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Analisis penugasan armada dan performa pengiriman harian.
            </p>
          </div>
        </div>

        {/* KPI Stat Cards */}
        {kpi && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="flex bg-white border-gray-100 border rounded-lg shadow flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                  Total Hari Ini
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
                  {kpi.totalAssignedToday}
                </div>
              </div>
            </div>

            <div className="flex bg-white border-gray-100 border rounded-lg shadow flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 text-green-600 flex-shrink-0">
                <Timer className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                  Total Minggu Ini
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
                  {kpi.totalAssignedWeek}
                </div>
              </div>
            </div>

            <div className="flex bg-white border-gray-100 border rounded-lg shadow flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                  Total Bulan Ini
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
                  {kpi.totalAssignedMonth}
                </div>
              </div>
            </div>

            <div className="flex bg-white border-gray-100 border rounded-lg shadow flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4">
              <div className="p-1.5 sm:p-2 rounded-full bg-yellow-100 text-yellow-600 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
                  Pengiriman Pending
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
                  {kpi.pendingAssignments}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Centered Verified Armadas Carousel */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-2xl">
            <div className="p-4 bg-white rounded-lg border border-gray-100 shadow">
              <VerifiedArmadaCarousel armadas={kpi?.topVerifiedArmadas || []} />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-gray-100 shadow p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
            Data Penugasan Pengiriman
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <ShipmentAssignmentTablePaginated
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
