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
import { useOperationalReport } from "@/hooks/laporan";

export default function LaporanOperasional() {
  const { data, isLoading, isError, error, refetch } = useOperationalReport();

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
              plat:
                shipment.plateNumber || shipment.armada?.plateNumber || "N/A",
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

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl mb-2">
        Laporan Operasional
      </h1>
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
