import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShipmentAssignmentReport } from "@/hooks/laporan";
import type {
  ShipmentAssignment,
  ShipmentAssignmentKPI,
  ShipmentAssignmentReportResult,
} from "@/types/report";
import { AlertCircle, BarChart3, Timer, Truck } from "lucide-react";

function ShipmentAssignmentTable({ data }: { data: ShipmentAssignment[] }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">Tidak ada data</div>;
  }
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plat Armada</TableHead>
            <TableHead>Model Armada</TableHead>
            <TableHead>Total Penugasan</TableHead>
            <TableHead>PENDING</TableHead>
            <TableHead>PROSES</TableHead>
            <TableHead>SELESAI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={row.armada?.id || idx}>
              <TableCell>{row.armada?.plateNumber || "-"}</TableCell>
              <TableCell>{row.armada?.model || "-"}</TableCell>
              <TableCell>{row.summary?.total ?? 0}</TableCell>
              <TableCell>{row.summary?.PENDING ?? 0}</TableCell>
              <TableCell>{row.summary?.PROSES ?? 0}</TableCell>
              <TableCell>{row.summary?.SELESAI ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function LaporanPenugasanPengiriman() {
  const { data, isLoading, isError, error, refetch } =
    useShipmentAssignmentReport() as {
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
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
        Laporan Penugasan Pengiriman
      </h1>
      {/* KPI Stat Cards */}
      {kpi && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Truck className="w-6 h-6 text-blue-600 mb-2" />
              <div className="text-xs text-gray-500 font-medium uppercase">
                Total Hari Ini
              </div>
              <div className="text-lg font-bold">{kpi.totalAssignedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <Timer className="w-6 h-6 text-blue-600 mb-2" />
              <div className="text-xs text-gray-500 font-medium uppercase">
                Total Minggu Ini
              </div>
              <div className="text-lg font-bold">{kpi.totalAssignedWeek}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
              <div className="text-xs text-gray-500 font-medium uppercase">
                Total Bulan Ini
              </div>
              <div className="text-lg font-bold">{kpi.totalAssignedMonth}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 mb-2" />
              <div className="text-xs text-gray-500 font-medium uppercase">
                Pengiriman Pending
              </div>
              <div className="text-lg font-bold">{kpi.pendingAssignments}</div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Most Active Armada */}
      {kpi?.mostActiveArmada && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Armada Teraktif</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-lg font-bold text-blue-700">
              {kpi.mostActiveArmada.plateNumber} - {kpi.mostActiveArmada.model}
            </div>
            <div className="text-sm text-gray-500">
              {kpi.mostActiveArmada.count} penugasan
            </div>
          </CardContent>
        </Card>
      )}
      {/* Average Shipments per Armada per Day */}
      {kpi && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Rata-rata Penugasan per Armada per Hari</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-blue-700">
              {kpi.avgShipmentsPerArmadaPerDay.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              penugasan / armada / hari
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Data Penugasan Pengiriman</CardTitle>
        </CardHeader>
        <CardContent>
          <ShipmentAssignmentTable
            data={(data?.report.data as ShipmentAssignment[]) || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
