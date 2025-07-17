// Laporan Pengeluaran Bulanan
import { ErrorState } from "@/components/ErrorState";
import { PengeluaranFilterBar } from "@/components/laporan/pengeluaran/PengeluaranFilterBar";
import { PengeluaranPieChart } from "@/components/laporan/pengeluaran/PengeluaranPieChart";
import { PengeluaranTable } from "@/components/laporan/pengeluaran/PengeluaranTable";
import { PengeluaranTop3 } from "@/components/laporan/pengeluaran/PengeluaranTop3";
import { LoadingState } from "@/components/LoadingState";
import { useMonthlyOutputReport } from "@/hooks/laporan";
import { useEffect, useState } from "react";

const COLORS = [
  "#2563eb",
  "#f59e42",
  "#10b981",
  "#f43f5e",
  "#a21caf",
  "#eab308",
  "#0ea5e9",
  "#6366f1",
];

export default function PengeluaranBulanan() {
  // Use month/year state for monthly filter
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const dateRange = {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${year}-${String(month).padStart(2, "0")}-01`,
  };
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("ALL");
  const [groupBy, setGroupBy] = useState<
    "item" | "customer" | "vehicle" | "warehouse"
  >("item");

  const summaryFilters: Record<string, string | number | undefined> = {
    groupBy,
    year,
    month,
  };
  if (status && status !== "ALL") summaryFilters.status = status;

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useMonthlyOutputReport(summaryFilters);

  const paginatedFilters = { ...summaryFilters, page, limit };
  const { data: tableData, refetch: refetchTable } =
    useMonthlyOutputReport(paginatedFilters);

  useEffect(() => {
    setPage(1);
    refetchSummary();
    refetchTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, status, groupBy]);

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
        Laporan Pengeluaran Bulanan
      </h1>
      <div className="w-full bg-white rounded-lg shadow p-4 sm:p-6 md:p-8 pb-12">
        <PengeluaranFilterBar
          mode="month"
          dateRange={dateRange}
          onDateChange={(start) => {
            const d = new Date(start);
            setYear(d.getFullYear());
            setMonth(d.getMonth() + 1);
          }}
          groupBy={groupBy}
          onGroupByChange={(v) => setGroupBy(v as typeof groupBy)}
          status={status}
          onStatusChange={setStatus}
          onReset={() => {
            setYear(new Date().getFullYear());
            setMonth(new Date().getMonth() + 1);
            setGroupBy("item");
            setStatus("ALL");
          }}
        />
        {isSummaryLoading ? (
          <LoadingState text="Memuat laporan pengeluaran bulanan..." />
        ) : isSummaryError ? (
          <ErrorState
            title="Gagal memuat laporan pengeluaran bulanan"
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
              {/* <PengeluaranStatCards
                summary={summaryData.summary}
                groups={summaryData.allGroups ?? []}
              /> */}
              <PengeluaranPieChart
                data={(() => {
                  const groups = summaryData.allGroups ?? [];
                  const sorted = [...groups].sort(
                    (a, b) => b.totalQuantity - a.totalQuantity
                  );
                  const top5 = sorted.slice(0, 5);
                  const rest = sorted.slice(5);
                  const chartData = top5.map((item) => ({
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
              />
              <PengeluaranTop3
                groups={summaryData.allGroups ?? []}
                groupBy={groupBy}
              />
              {tableData ? (
                <PengeluaranTable
                  data={tableData.data}
                  pagination={tableData.pagination}
                  setPage={setPage}
                />
              ) : null}
            </>
          )
        )}
      </div>
    </div>
  );
}
