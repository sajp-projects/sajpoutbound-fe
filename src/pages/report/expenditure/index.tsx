// Laporan Pengeluaran
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ExpenditureExcelModal } from "@/components/report/expenditure/ExpenditureExcelModal";
import { PengeluaranPieChart } from "@/components/report/expenditure/ExpenditurePieChart";
import PengeluaranTablePaginated from "@/components/report/expenditure/ExpenditureTablePaginated";
import { PengeluaranTop3 } from "@/components/report/expenditure/ExpenditureTop3";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLORS } from "@/constant/COLORS";
import { useOutputReport } from "@/hooks/report";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

type PeriodType = "daily" | "monthly" | "yearly";

export default function Pengeluaran() {
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [dateRange, setDateRange] = useState({ start: today, end: today });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState(
    () => searchParams.get("status") || "ALL"
  );
  const [groupBy, setGroupBy] = useState<"item" | "customer" | "vehicle" | "warehouse">(
    (searchParams.get("groupBy") as "item" | "customer" | "vehicle" | "warehouse") || "item"
  );
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // For monthly/yearly filtering
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const summaryFilters: Record<string, string | number | undefined> = {
    period,
    groupBy,
  };

  if (period === "daily") {
    if (dateRange.start) summaryFilters.startDate = dateRange.start;
    if (dateRange.end) summaryFilters.endDate = dateRange.end;
  } else if (period === "monthly") {
    summaryFilters.year = year;
    summaryFilters.month = month;
  } else if (period === "yearly") {
    summaryFilters.year = year;
  }

  if (status && status !== "ALL") summaryFilters.status = status;

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useOutputReport(summaryFilters);

  useEffect(() => {
    refetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, dateRange, month, year, status, groupBy]);

  function handleDateChange(s: string, e: string) {
    setDateRange({ start: s, end: e });
  }

  function handlePeriodChange(newPeriod: PeriodType) {
    setPeriod(newPeriod);
    if (newPeriod === "daily") {
      setDateRange({ start: today, end: today });
    } else if (newPeriod === "monthly") {
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
    } else if (newPeriod === "yearly") {
      setYear(new Date().getFullYear());
    }
  }

  function handleOpenExcelModal() {
    setIsExcelModalOpen(true);
  }

  return (
    <div className="flex flex-col px-2 space-y-4 w-full min-h-full sm:space-y-6 sm:px-4 md:px-0">
      {/* Outer header: title/subtitle left, filters right */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 md:gap-4 w-full">
        <div className="flex-shrink-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Laporan Pengeluaran
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-2 w-full sm:w-auto items-start sm:items-center justify-start sm:justify-end">
          {/* Period Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={period}
              onValueChange={(value) => handlePeriodChange(value as PeriodType)}
            >
              <SelectTrigger className="w-full sm:w-32 md:w-28">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Date Range Filter for Daily */}
          {period === "daily" && (
            <div className="flex items-center gap-2 w-full sm:w-auto md:flex-shrink-0">
              <DateRangeFilter
              label=""
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={({ startDate, endDate }) =>
                  handleDateChange(startDate, endDate)
                }
              />
            </div>
          )}
          {/* Month/Year Filter for Monthly */}
          {period === "monthly" && (
            <div className="flex items-center gap-2 w-full sm:w-auto md:flex-shrink-0">
              <Select
                value={String(month)}
                onValueChange={(m) => setMonth(parseInt(m))}
              >
                <SelectTrigger className="w-28 md:w-24">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(year)}
                onValueChange={(y) => setYear(parseInt(y))}
              >
                <SelectTrigger className="w-24 md:w-20">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Year Filter for Yearly */}
          {period === "yearly" && (
            <div className="flex items-center gap-2 w-full sm:w-auto md:flex-shrink-0">
              <Select
                value={String(year)}
                onValueChange={(y) => setYear(parseInt(y))}
              >
                <SelectTrigger className="w-24 md:w-20">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={status} onValueChange={(newStatus) => {
              setStatus(newStatus);
              // Update URL params to maintain state
              const newParams = new URLSearchParams(searchParams);
              if (newStatus !== "ALL") {
                newParams.set("status", newStatus);
              } else {
                newParams.delete("status");
              }
              setSearchParams(newParams);
            }}>
              <SelectTrigger className="w-full sm:w-32 md:w-28">
                <SelectValue placeholder="Semua" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROSES">Proses</SelectItem>
                <SelectItem value="SELESAI">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Excel Download Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto md:flex-shrink-0">
            <button
              onClick={handleOpenExcelModal}
              className="w-full sm:w-auto md:w-auto px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
              type="button"
            >
              Download Excel
            </button>
          </div>
        </div>
      </div>
      {/* Main card/container for pengeluaran report */}
      <div className="overflow-hidden p-3 w-full bg-white rounded-lg shadow border border-gray-100 sm:p-4 md:p-6">
        {/* Internal header: title left, group by filter right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 mt-2 gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Laporan Pengeluaran
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Analisis pengeluaran berdasarkan barang, pelanggan, armada, atau
              gudang.
            </p>
          </div>
          {/* Group By Filter */}
          <div className="flex justify-center sm:justify-end w-full sm:w-auto">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 shadow-sm border border-gray-200 w-full sm:w-auto">
              {[
                { label: "Barang", value: "item" },
                { label: "Pelanggan", value: "customer" },
                { label: "Armada", value: "vehicle" },
                { label: "Gudang", value: "warehouse" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={cn(
                    "px-2 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors focus:outline-none flex-1 sm:flex-none",
                    groupBy === opt.value
                      ? "bg-white text-blue-700 shadow border border-blue-200"
                      : "bg-transparent text-gray-600 hover:bg-white/70"
                  )}
                  onClick={() => {
                    const newGroupBy = opt.value as typeof groupBy;
                    setGroupBy(newGroupBy);
                    // Update URL params to maintain state
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("groupBy", newGroupBy);
                    setSearchParams(newParams);
                  }}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isSummaryLoading ? (
          <LoadingState
            text={`Memuat laporan pengeluaran ${
              period === "daily"
                ? "harian"
                : period === "monthly"
                ? "bulanan"
                : "tahunan"
            }...`}
          />
        ) : isSummaryError ? (
          <ErrorState
            title={`Gagal memuat laporan pengeluaran ${
              period === "daily"
                ? "harian"
                : period === "monthly"
                ? "bulanan"
                : "tahunan"
            }`}
            message={
              typeof isSummaryError === "object" &&
              isSummaryError !== null &&
              "message" in isSummaryError
                ? String((isSummaryError as { message?: string }).message)
                : typeof isSummaryError === "string"
                ? isSummaryError
                : "Terjadi kesalahan"
            }
            onRetry={() => refetchSummary()}
          />
        ) : (
          summaryData && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 items-stretch">
                <PengeluaranPieChart
                  data={(() => {
                    const groups = summaryData.allGroups ?? [];
                    const sorted = [...groups].sort(
                      (a, b) => b.totalQuantity - a.totalQuantity
                    );
                    const top3 = sorted.slice(0, 3);
                    const rest = sorted.slice(3);
                    const chartData = top3.map((item) => ({
                      name: item.name,
                      value: item.totalQuantity,
                    }));
                    if (rest.length > 0) {
                      const othersValue = rest.reduce(
                        (sum, item) => sum + item.totalQuantity,
                        0
                      );
                      chartData.push({ name: "Lainnya", value: othersValue });
                    }
                    return chartData;
                  })()}
                  COLORS={COLORS}
                  groupBy={groupBy}
                />
                <PengeluaranTop3
                  groups={summaryData.allGroups ?? []}
                  groupBy={groupBy}
                />
              </div>
              <PengeluaranTablePaginated
                filters={{
                  period,
                  startDate: period === "daily" ? dateRange.start : undefined,
                  endDate: period === "daily" ? dateRange.end : undefined,
                  year:
                    period === "monthly" || period === "yearly"
                      ? year
                      : undefined,
                  month: period === "monthly" ? month : undefined,
                  groupBy,
                  status,
                }}
              />
            </>
          )
        )}
      </div>

      {/* Excel Download Modal */}
      <ExpenditureExcelModal
        open={isExcelModalOpen}
        onOpenChange={setIsExcelModalOpen}
        period={period}
        dateRange={dateRange}
        month={month}
        year={year}
        outputReportData={summaryData}
      />
    </div>
  );
}
