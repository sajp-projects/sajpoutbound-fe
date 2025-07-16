import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDailyOutputReport, useMonthlyOutputReport } from "@/hooks/laporan";
import {
  MonthlyOutputReportResult,
  OutputGroupBase,
  OutputReportSummary,
} from "@/types/report";
import { CalendarDays, Package, Users, Weight } from "lucide-react";
import { useState } from "react";
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
    <div className="flex flex-wrap gap-2 items-center mb-4">
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

function renderSummary(summary: OutputReportSummary) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <StatCard
        icon={<Package className="w-5 h-5" />}
        label="Total Grup"
        value={summary.totalGroups}
      />
      <StatCard
        icon={<Weight className="w-5 h-5" />}
        label="Total Berat"
        value={summary.totalWeight}
      />
      <StatCard
        icon={<Users className="w-5 h-5" />}
        label="Total Kuantitas"
        value={summary.totalQuantity}
      />
      <StatCard
        icon={<CalendarDays className="w-5 h-5" />}
        label="Total Pengiriman"
        value={summary.totalShipments}
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
  const chartData = data.map((item, i) => ({
    name: item.name,
    value: item[valueKey] as number,
  }));
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
                  <TableCell>{row.totalQuantity}</TableCell>
                  <TableCell>{row.totalWeight}</TableCell>
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
  return "data" in r && "summary" in r && "monthInfo" in r;
}
function isDailyResult(data: unknown): data is {
  report: { data: OutputGroupBase[]; summary: OutputReportSummary };
} {
  if (!data || typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  if (!("report" in d) || typeof d.report !== "object" || d.report === null)
    return false;
  const r = d.report as Record<string, unknown>;
  return "data" in r && "summary" in r;
}

export default function OutputHarianDanBulanan() {
  const [tab, setTab] = useState<"harian" | "bulanan">("harian");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());

  // Build daily report filters, only include non-empty dates
  const dailyFilters: Record<string, string> = {};
  if (dateRange.start) dailyFilters.startDate = dateRange.start;
  if (dateRange.end) dailyFilters.endDate = dateRange.end;

  const {
    data: dailyData,
    isLoading: loadingDaily,
    isError: errorDaily,
    error: dailyError,
    refetch: refetchDaily,
  } = useDailyOutputReport(tab === "harian" ? dailyFilters : {}, {
    enabled: tab === "harian",
  });
  const {
    data: monthlyData,
    isLoading: loadingMonthly,
    isError: errorMonthly,
    error: monthlyError,
    refetch: refetchMonthly,
  } = useMonthlyOutputReport(tab === "bulanan" ? { year, month } : {}, {
    enabled: tab === "bulanan",
  });

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
        Laporan Pengeluaran
      </h1>
      <Tabs
        defaultValue="harian"
        value={tab}
        onValueChange={(v) => setTab(v as "harian" | "bulanan")}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="harian">Harian</TabsTrigger>
          <TabsTrigger value="bulanan">Bulanan</TabsTrigger>
        </TabsList>
        <TabsContent value="harian">
          <Card className="mb-4 p-4">
            <DateRangeFilter
              start={dateRange.start}
              end={dateRange.end}
              onChange={(s, e) => setDateRange({ start: s, end: e })}
            />
          </Card>
          {loadingDaily ? (
            <LoadingState text="Memuat laporan pengeluaran harian..." />
          ) : errorDaily ? (
            <ErrorState
              title="Gagal memuat laporan pengeluaran harian"
              message={
                dailyError instanceof Error
                  ? dailyError.message
                  : "Terjadi kesalahan"
              }
              onRetry={() => refetchDaily()}
            />
          ) : (
            isDailyResult(dailyData) && (
              <>
                {renderSummary(dailyData.report.summary)}
                {renderPieChart(
                  dailyData.report.data,
                  "totalQuantity",
                  "Distribusi Kuantitas"
                )}
                {renderTable(dailyData.report.data)}
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
              onChange={(e) => setYear(e.target.value)}
              className="w-24"
              placeholder="Tahun"
            />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </Card>
          {loadingMonthly ? (
            <LoadingState text="Memuat laporan pengeluaran bulanan..." />
          ) : errorMonthly ? (
            <ErrorState
              title="Gagal memuat laporan pengeluaran bulanan"
              message={
                monthlyError instanceof Error
                  ? monthlyError.message
                  : "Terjadi kesalahan"
              }
              onRetry={() => refetchMonthly()}
            />
          ) : (
            isMonthlyResult(monthlyData) && (
              <>
                {renderSummary(monthlyData.report.summary)}
                {renderPieChart(
                  monthlyData.report.data,
                  "totalQuantity",
                  "Distribusi Kuantitas"
                )}
                {renderTable(monthlyData.report.data)}
              </>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
