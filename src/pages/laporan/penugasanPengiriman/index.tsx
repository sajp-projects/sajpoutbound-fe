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
import type { ShipmentAssignment } from "@/types/report";

// Types for shipment assignment report
interface ShipmentAssignmentReportSummary {
  totalArmada: number;
  totalAssignments: number;
  byStatus: { PENDING: number; PROSES: number; SELESAI: number };
}
interface ShipmentAssignmentReportResponse {
  report: {
    data: unknown[];
    summary: ShipmentAssignmentReportSummary;
  };
}

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
      data?: ShipmentAssignmentReportResponse;
      isLoading: boolean;
      isError: boolean;
      error: unknown;
      refetch: () => void;
    };

  console.log(data, "data");

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
