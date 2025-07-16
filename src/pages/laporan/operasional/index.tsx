import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOperationalReport } from "@/hooks/laporan";
import type { OperationalReportItem } from "@/types/report";
import { Package, Truck, Users, Weight } from "lucide-react";
import React from "react";
import { Cell, Pie, PieChart } from "recharts";

// Correct type for operational report summary
interface OperationalReportSummary {
  ANTAR: { PENDING: number; PROSES: number; SELESAI: number; total: number };
  JEMPUT: { PENDING: number; PROSES: number; SELESAI: number; total: number };
  overall: { PENDING: number; PROSES: number; SELESAI: number; total: number };
}
interface OperationalReportResponse {
  report: {
    data: Record<string, Record<string, Array<OperationalReportItem>>>;
    summary: OperationalReportSummary;
  };
}

export default function LaporanOperasional() {
  const { data, isLoading, isError, error, refetch } =
    useOperationalReport() as {
      data?: OperationalReportResponse;
      isLoading: boolean;
      isError: boolean;
      error: unknown;
      refetch: () => void;
    };

  if (isLoading) {
    return <LoadingState text="Memuat laporan operasional..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal memuat laporan operasional"
        message={error instanceof Error ? error.message : "Terjadi kesalahan"}
        onRetry={() => refetch()}
      />
    );
  }

  // Flatten the nested data structure for the table
  const tableData = (() => {
    try {
      if (!data || typeof data !== "object" || !("report" in data)) return [];

      const report = data.report;
      if (!report || typeof report !== "object" || !("data" in report)) {
        return [];
      }

      const reportData = report.data;
      if (typeof reportData !== "object" || reportData === null) {
        return [];
      }

      // Process the nested structure: { ANTAR: { PENDING: [], PROSES: [], SELESAI: [] }, JEMPUT: {...} }
      return Object.entries(reportData).flatMap(
        ([shipmentType, statusGroups]) => {
          if (typeof statusGroups !== "object" || statusGroups === null) {
            return [];
          }

          return Object.entries(statusGroups).flatMap(([status, shipments]) => {
            if (!Array.isArray(shipments)) {
              return [];
            }

            return shipments.map((shipment) => ({
              tipe: shipmentType,
              status: status,
              nomor: shipment.shipmentNumber || "-",
              plat: shipment.vehicle?.plateNumber || "N/A",
              totalBarang: shipment.totalItems || 0,
              totalBerat: shipment.totalWeight || 0,
            }));
          });
        }
      );
    } catch (error) {
      console.error("Error processing report data:", error);
      return [];
    }
  })();

  // StatCard and PieChart helpers
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

  // Extract summary and pie chart data
  const summary = data?.report?.summary;
  const pieData = summary
    ? [
        { name: "ANTAR", value: summary.ANTAR.total },
        { name: "JEMPUT", value: summary.JEMPUT.total },
      ]
    : [];

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
        Laporan Operasional
      </h1>
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard
            icon={<Truck className="w-5 h-5" />}
            label="Total ANTAR"
            value={summary.ANTAR.total}
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total JEMPUT"
            value={summary.JEMPUT.total}
          />
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Total Pengiriman"
            value={summary.overall.total}
          />
          <StatCard
            icon={<Weight className="w-5 h-5" />}
            label="Selesai"
            value={summary.overall.SELESAI}
          />
        </div>
      )}
      {pieData.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Distribusi Pengiriman</CardTitle>
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
          <CardTitle>Data Operasional</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-gray-600">
                    Tipe
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    No. Pengiriman
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    No. Polisi
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Total Barang
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Total Berat (kg)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <TableRow
                      key={`${row.tipe}-${index}`}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <TableCell>{row.tipe}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.nomor}</TableCell>
                      <TableCell>{row.plat}</TableCell>
                      <TableCell>{row.totalBarang.toLocaleString()}</TableCell>
                      <TableCell>{row.totalBerat.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Tidak ada data yang tersedia
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
