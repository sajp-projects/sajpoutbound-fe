import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
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
import { useOperationalReport } from "@/hooks/laporan";
import { OperationalReportResponse } from "@/types/report";
import { Inbox, Package, Truck, Weight } from "lucide-react";
import React, { useState } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function LaporanOperasional() {
  // Date range state
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date(new Date().setHours(0, 0, 0, 0))
      .toISOString()
      .slice(0, 10),
    endDate: new Date(new Date().setHours(23, 59, 59, 999))
      .toISOString()
      .slice(0, 10),
  });
  // Pagination state
  const [page, setPage] = useState(1);
  // Status filter state
  const [status, setStatus] = useState("ALL");

  const { data, isLoading, isError, error, refetch } = useOperationalReport({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    page,
    limit: 5,
    status: status === "ALL" ? undefined : status,
  }) as {
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
              plat:
                shipment.plateNumber ||
                shipment.armada?.plateNumber ||
                shipment.vehicle?.plateNumber ||
                "-",
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

  // Get pagination info from backend
  const pagination = data?.report?.pagination;

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

  // Extract summary and pie chart data
  const kpi = data?.report?.kpi;

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-6 sm:space-y-8 sm:px-4 md:px-0">
      <div className="mb-2 flex flex-col md:flex-row md:items-end md:justify-between gap-2 md:gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan Operasional
          </h1>
          <p className="text-gray-500 mt-1">
            Snapshot performa harian dan insight pengiriman gudang Anda.
          </p>
        </div>
        <div className="flex flex-wrap w-full md:w-auto items-center gap-2 gap-y-2 justify-start md:justify-end relative">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(range) => {
              setDateRange(range);
              setPage(1);
            }}
          />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status Pengiriman" />
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
      {/* KPI Cards */}
      {kpi && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Truck className="w-5 h-5" />}
            label="Pengiriman Dibuat Hari Ini"
            value={kpi.totalShipmentsCreatedToday}
          />
          <StatCard
            icon={<Weight className="w-5 h-5" />}
            label="Pengiriman Diverifikasi Hari Ini"
            value={kpi.totalShipmentsVerifiedToday}
          />
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Produk Unik Terkirim"
            value={kpi.uniqueProductsMoved}
          />
          <StatCard
            icon={<Truck className="w-5 h-5" />}
            label="Armada Aktif"
            value={kpi.vehicleUsageCount}
          />
        </div>
      )}
      {/* 7-day trendline bar chart */}
      {kpi && (
        <Card className="mb-2">
          <CardHeader>
            <CardTitle>Tren Pengiriman 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={kpi.trendline7Days}
                  margin={{ top: 16, right: 24, left: 8, bottom: 16 }}
                >
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="shipmentCount"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Insights Section */}
      {kpi && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Top products, dispatched totals, campuran */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 3 Produk Terkirim</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.topShippedProducts.length > 0 ? (
                  <ul className="space-y-2">
                    {kpi.topShippedProducts.map((prod, idx) => (
                      <li key={prod.id} className="flex items-center gap-2">
                        <span className="font-bold text-blue-700">
                          {idx + 1}.
                        </span>
                        <span>{prod.name}</span>
                        <Badge variant="outline">
                          {prod.totalQuantity.toLocaleString()} {prod.satuan}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 py-4">
                    <Inbox className="w-8 h-8 text-gray-300 mb-2" />
                    <div className="text-gray-500 font-semibold text-base mb-1">
                      Tidak ada produk terkirim
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Pengiriman per Satuan</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.dispatchedTotalsByUnit.length > 0 ? (
                  <ul className="space-y-2">
                    {kpi.dispatchedTotalsByUnit.map((unit) => (
                      <li key={unit.satuan} className="flex items-center gap-2">
                        <span className="font-bold">{unit.satuan}:</span>
                        <Badge variant="outline">
                          {unit.totalQuantity.toLocaleString()}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 py-4">
                    <Inbox className="w-8 h-8 text-gray-300 mb-2" />
                    <div className="text-gray-500 font-semibold text-base mb-1">
                      Tidak ada data satuan
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Right: Most active vehicle, top customers */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Armada Paling Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.mostActiveVehicle ? (
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">
                      {kpi.mostActiveVehicle.model}
                    </span>
                    <Badge variant="outline">
                      {kpi.mostActiveVehicle.plateNumber}
                    </Badge>
                    <span className="ml-2 text-sm text-gray-500">
                      {kpi.mostActiveVehicle.shipmentCount} pengiriman
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 py-4">
                    <Inbox className="w-8 h-8 text-gray-300 mb-2" />
                    <div className="text-gray-500 font-semibold text-base mb-1">
                      Tidak ada armada aktif
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pelanggan Terbanyak (Jumlah barang)</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.topCustomersByShipmentCount.length > 0 ? (
                  <ul className="space-y-2">
                    {kpi.topCustomersByShipmentCount.map((cust) => (
                      <li key={cust.id} className="flex items-center gap-2">
                        <span className="font-bold"></span>
                        <span>{cust.name}</span>
                        <Badge variant="outline">
                          {cust.shipmentCount} barang
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 py-4">
                    <Inbox className="w-8 h-8 text-gray-300 mb-2" />
                    <div className="text-gray-500 font-semibold text-base mb-1">
                      Tidak ada pelanggan
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pelanggan Terbanyak (Volume)</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.topCustomersByVolume.length > 0 ? (
                  <ul className="space-y-2">
                    {kpi.topCustomersByVolume.map((cust) => (
                      <li key={cust.id} className="flex items-center gap-2">
                        <span className="font-bold"></span>
                        <span>{cust.name}</span>
                        <Badge variant="outline">
                          {cust.totalQuantity.toLocaleString()}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 py-4">
                    <Inbox className="w-8 h-8 text-gray-300 mb-2" />
                    <div className="text-gray-500 font-semibold text-base mb-1">
                      Tidak ada pelanggan
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Data Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
          <CardTitle>Data Operasional</CardTitle>
          <div className="flex flex-wrap w-full sm:w-auto items-center gap-2 gap-y-2 justify-start sm:justify-end">
            <button
              className="px-2 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination || page <= 1}
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Halaman {pagination ? pagination.page : page} /{" "}
              {pagination ? pagination.totalPages : 1}
            </span>
            <button
              className="px-2 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() =>
                setPage((p) => (pagination && pagination.hasNext ? p + 1 : p))
              }
              disabled={!pagination || !pagination.hasNext}
            >
              Next
            </button>
          </div>
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
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center align-middle"
                    >
                      <div className="flex flex-col items-center justify-center h-full py-8">
                        <Inbox className="w-10 h-10 text-gray-300 mb-2" />
                        <div className="text-gray-500 font-semibold text-lg mb-1">
                          Tidak ada data operasional
                        </div>
                        <div className="text-gray-400 text-sm">
                          Belum ada pengiriman yang selesai/diverifikasi pada
                          periode ini.
                        </div>
                      </div>
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
