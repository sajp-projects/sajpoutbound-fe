import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { ReportTable } from "@/components/ReportTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShipmentAssignmentReport } from "@/hooks/laporan";

export default function LaporanPenugasanPengiriman() {
  const { data, isLoading, isError, error, refetch } =
    useShipmentAssignmentReport();

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
          <ReportTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
