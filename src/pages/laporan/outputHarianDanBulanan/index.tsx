import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDailyOutputReport } from "@/hooks/laporan";
import type {
  DailyOutputReportResult,
  MonthlyOutputReportResult,
} from "@/types/report";
import { OutputGroupBase, OutputReportSummary } from "@/types/report";
import { CalendarDays, Package, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";

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

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="flex flex-row items-center gap-4 p-4">
      <div className="p-2 rounded-full bg-blue-100 text-blue-600">{icon}</div>
      <div>
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
      </div>
    </Card>
  );
}

function DateRangeFilter({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        type="date"
        value={start}
        onChange={(e) => onChange(e.target.value, end)}
        className="w-36"
      />
      <span className="text-gray-500">s/d</span>
      <Input
        type="date"
        value={end}
        onChange={(e) => onChange(start, e.target.value)}
        className="w-36"
      />
    </div>
  );
}

function renderSummary(
  summary: OutputReportSummary,
  groups: OutputGroupBase[]
) {
  // Find the group with the highest quantity
  let topGroup = null;
  if (groups && groups.length > 0) {
    topGroup = groups.reduce(
      (max, g) => (g.totalQuantity > (max?.totalQuantity ?? 0) ? g : max),
      null as OutputGroupBase | null
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
      <StatCard
        icon={<Package className="w-5 h-5" />}
        label="Total Grup"
        value={summary.totalGroups}
      />
      <StatCard
        icon={<CalendarDays className="w-5 h-5" />}
        label="Total Pengiriman"
        value={summary.totalShipments}
      />
      <StatCard
        icon={<Users className="w-5 h-5" />}
        label="Grup Terbanyak"
        value={
          topGroup
            ? `${topGroup.name} (${topGroup.totalQuantity} ${
                topGroup.satuan || ""
              })`
            : "-"
        }
      />
    </div>
  );
}

function renderPieChart(
  data: OutputGroupBase[],
  valueKey: keyof OutputGroupBase,
  title: string
) {
  if (!data || data.length === 0) return null;
  // Sort and take top 5, group the rest as 'Lainnya'
  const sorted = [...data].sort(
    (a, b) => (b[valueKey] as number) - (a[valueKey] as number)
  );
  const top5 = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const chartData = top5.map((item) => ({
    name: item.name,
    value: item[valueKey] as number,
  }));
  if (rest.length > 0) {
    const othersValue = rest.reduce(
      (sum, item) => sum + (item[valueKey] as number),
      0
    );
    chartData.push({ name: "Lainnya", value: othersValue });
  }
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <PieChart width={220} height={220}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {chartData.map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <div className="flex flex-col gap-2">
            {chartData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="text-sm text-gray-700">{entry.name}</span>
                <Badge variant="outline">{entry.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderTable(data: OutputGroupBase[]) {
  if (!data || data.length === 0)
    return <div className="text-gray-400 text-center py-8">Tidak ada data</div>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kuantitas</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Jumlah Pengiriman</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id || row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.totalQuantity} {row.satuan ? row.satuan : ""}
                  </TableCell>
                  <TableCell>
                    {row.totalWeight} {row.satuan ? row.satuan : ""}
                  </TableCell>
                  <TableCell>{row.shipmentCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Type guards for daily/monthly data
function isMonthlyResult(
  data: unknown
): data is { report: MonthlyOutputReportResult } {
  if (!data || typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (!("report" in d) || typeof d.report !== "object" || d.report === null)
    return false;
  const r = d.report as Record<string, unknown>;
  return "data" in r && "summary" in r && "monthInfo" in r && "pagination" in r;
}
function isDailyResult(
  data: unknown
): data is { report: DailyOutputReportResult } {
  return !!data && typeof data === "object" && "report" in data;
}

// Helper for error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Terjadi kesalahan";
}

export default function OutputHarianDanBulanan() {
  const [tab, setTab] = useState<"harian" | "bulanan">("harian");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState("ALL"); // 'ALL' means all statuses
  const [groupBy, setGroupBy] = useState<
    "item" | "customer" | "vehicle" | "warehouse"
  >("item");

  // Build filters for summary/allGroups (no page)
  const summaryFilters: Record<string, string | number | undefined> = {
    groupBy: tab === "harian" ? groupBy : undefined,
    year: tab === "bulanan" ? year : undefined,
    month: tab === "bulanan" ? month : undefined,
  };
  if (dateRange.start) summaryFilters.startDate = dateRange.start;
  if (dateRange.end) summaryFilters.endDate = dateRange.end;
  if (status && status !== "ALL") summaryFilters.status = status;

  // Query for summary/allGroups (always page 1)
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = useDailyOutputReport(summaryFilters);

  console.log(summaryData, "summaryData");

  // Query for paginated table data (filters + page)
  const paginatedFilters = { ...summaryFilters, page, limit };
  const { data: tableData, refetch: refetchTable } =
    useDailyOutputReport(paginatedFilters);

  // When filters change, reset page to 1
  useEffect(() => {
    setPage(1);
    refetchSummary();
    refetchTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, tab, year, month, status, groupBy]);

  // Use summaryData for summary and pie chart
  // Use tableData for the table and pagination controls

  // Reset page when filters change
  function handleDateChange(s: string, e: string) {
    setDateRange({ start: s, end: e });
    setPage(1);
  }
  function handleTabChange(v: string) {
    setTab(v as "harian" | "bulanan");
    setPage(1);
  }
  function handleYearChange(val: string) {
    setYear(val);
    setPage(1);
  }
  function handleMonthChange(val: string) {
    setMonth(val);
    setPage(1);
  }

  function renderPagination(pagination?: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }) {
    if (!pagination) return null;
    return (
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!pagination.hasPrev}
        >
          Sebelumnya
        </Button>
        <span className="text-sm text-gray-600">
          Halaman {pagination.page} dari {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={!pagination.hasNext}
        >
          Berikutnya
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
        Laporan Pengeluaran
      </h1>
      <Tabs
        defaultValue="harian"
        value={tab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="harian">Harian</TabsTrigger>
          <TabsTrigger value="bulanan">Bulanan</TabsTrigger>
        </TabsList>
        <TabsContent value="harian">
          <Card className="mb-4 p-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex flex-1 flex-row items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <DateRangeFilter
                    start={dateRange.start}
                    end={dateRange.end}
                    onChange={handleDateChange}
                  />
                  {/* Group By Dropdown */}
                  <label htmlFor="groupBy" className="text-sm font-medium ml-4">
                    Group By:
                  </label>
                  <Select
                    value={groupBy}
                    onValueChange={(v) => setGroupBy(v as typeof groupBy)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Group By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item">Barang</SelectItem>
                      <SelectItem value="customer">Pelanggan</SelectItem>
                      <SelectItem value="vehicle">Armada</SelectItem>
                      <SelectItem value="warehouse">Gudang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status:
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-32">
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
              </div>
            </CardHeader>
          </Card>
          {isSummaryLoading ? (
            <LoadingState text="Memuat laporan pengeluaran harian..." />
          ) : isSummaryError ? (
            <ErrorState
              title="Gagal memuat laporan pengeluaran harian"
              message={getErrorMessage(isSummaryError)}
              onRetry={() => refetchSummary()}
            />
          ) : (
            isDailyResult(summaryData) && (
              <>
                {renderSummary(
                  summaryData.report.summary,
                  summaryData.report.allGroups ?? []
                )}
                {renderPieChart(
                  summaryData.report.allGroups ?? [],
                  "totalQuantity",
                  "Distribusi Kuantitas"
                )}
                {isDailyResult(tableData)
                  ? renderTable(tableData.report.data)
                  : null}
                {isDailyResult(tableData)
                  ? renderPagination(tableData.report.pagination)
                  : null}
              </>
            )
          )}
        </TabsContent>
        <TabsContent value="bulanan">
          <Card className="mb-4 p-4 flex flex-wrap gap-2 items-center">
            <Input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => handleYearChange(e.target.value)}
              className="w-24"
              placeholder="Tahun"
            />
            <select
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </Card>
          {isSummaryLoading ? (
            <LoadingState text="Memuat laporan pengeluaran bulanan..." />
          ) : isSummaryError ? (
            <ErrorState
              title="Gagal memuat laporan pengeluaran bulanan"
              message={getErrorMessage(isSummaryError)}
              onRetry={() => refetchSummary()}
            />
          ) : (
            isMonthlyResult(summaryData) && (
              <>
                {renderSummary(
                  summaryData.report.summary,
                  summaryData.report.allGroups ?? []
                )}
                {renderPieChart(
                  summaryData.report.allGroups ?? [],
                  "totalQuantity",
                  "Distribusi Kuantitas"
                )}
                {isDailyResult(tableData)
                  ? renderTable(tableData.report.data)
                  : null}
                {isDailyResult(tableData)
                  ? renderPagination(tableData.report.pagination)
                  : null}
              </>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
