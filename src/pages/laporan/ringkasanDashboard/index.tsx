import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ReportTable } from "@/components/ReportTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardSummary } from "@/hooks/laporan";
import { Package, Truck, Users } from "lucide-react";
import React from "react";
import { Cell, Pie, PieChart } from "recharts";

export default function RingkasanDashboardLaporan() {
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();

  if (isLoading) {
    return <LoadingState text="Memuat ringkasan dashboard..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat ringkasan dashboard"
        message={error instanceof Error ? error.message : "Terjadi kesalahan"}
        onRetry={() => refetch()}
      />
    );
  }

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

  const summary =
    data?.summary?.today?.operational ||
    data?.summary?.today?.output ||
    data?.summary?.activeAssignments;
  const pieData =
    summary && summary.ANTAR && summary.JEMPUT
      ? [
          { name: "ANTAR", value: summary.ANTAR.total },
          { name: "JEMPUT", value: summary.JEMPUT.total },
        ]
      : summary && summary.byStatus
      ? [
          { name: "PENDING", value: summary.byStatus.PENDING },
          { name: "PROSES", value: summary.byStatus.PROSES },
          { name: "SELESAI", value: summary.byStatus.SELESAI },
        ]
      : [];

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
        Ringkasan Dashboard Laporan
      </h1>
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {summary.ANTAR && (
            <StatCard
              icon={<Truck className="w-5 h-5" />}
              label="Total ANTAR"
              value={summary.ANTAR.total}
            />
          )}
          {summary.JEMPUT && (
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="Total JEMPUT"
              value={summary.JEMPUT.total}
            />
          )}
          {summary.totalAssignments && (
            <StatCard
              icon={<Package className="w-5 h-5" />}
              label="Total Penugasan"
              value={summary.totalAssignments}
            />
          )}
        </div>
      )}
      {pieData.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Distribusi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <PieChart width={220} height={220}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
              <div className="flex flex-col gap-2">
                {pieData.map((entry, idx) => (
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
      )}
      <Card>
        <CardHeader>
          <CardTitle>Data Ringkasan Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportTable
            data={
              data?.summary?.today?.operational?.data ||
              data?.summary?.today?.output?.data ||
              data?.summary?.activeAssignments?.data ||
              []
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
