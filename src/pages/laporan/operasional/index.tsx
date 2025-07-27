import { ErrorState } from "@/components/ErrorState";
import DataOperasionalTable from "@/components/laporan/DataOperasionalTable";
import StatCard from "@/components/laporan/StatCard";
import { LoadingState } from "@/components/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOperationalReport } from "@/hooks/laporan";
import { cn } from "@/lib/utils";
import { OperationalReportResponse } from "@/types/laporan";
import { Inbox, Package, Truck, Weight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function LaporanOperasional() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize states from URL parameters
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>(() => {
    const today = new Date(new Date().setHours(23, 59, 59, 999))
      .toISOString()
      .slice(0, 10);
    return {
      startDate: searchParams.get("startDate") || today,
      endDate: searchParams.get("endDate") || today,
    };
  });
  
  // Status filter state
  const [status, setStatus] = useState(() => 
    searchParams.get("status") || "ALL"
  );
  
  // Add shipment type filter state - initialize from URL
  const [shipmentType, setShipmentType] = useState<"ALL" | "ANTAR" | "JEMPUT">(() => {
    const typeParam = searchParams.get("type");
    return (typeParam === "ANTAR" || typeParam === "JEMPUT") ? typeParam : "ALL";
  });

  // Sync URL parameters with state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("startDate", dateRange.startDate);
    params.set("endDate", dateRange.endDate);
    if (status !== "ALL") params.set("status", status);
    if (shipmentType !== "ALL") params.set("type", shipmentType);
    
    setSearchParams(params, { replace: true });
  }, [dateRange, status, shipmentType, setSearchParams]);

  const { data, isLoading, isError, error, refetch } = useOperationalReport({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    status: status === "ALL" ? undefined : status,
    type: shipmentType === "ALL" ? undefined : shipmentType,
  }) as {
    data?: OperationalReportResponse;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };

  console.log(data, "data operasional");

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

  // Extract summary and pie chart data
  const kpi = data?.report?.kpi;

  return (
    <div className="flex flex-col px-2 space-y-4 w-full min-h-full sm:space-y-6 sm:px-4 md:px-0">
      {/* Outer header: title/subtitle left, filters right */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 md:gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan Operasional
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto items-start sm:items-center justify-start sm:justify-end">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(range) => {
              setDateRange(range);
            }}
          />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
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
      {/* Main card/container for operational report */}
      <div className="overflow-hidden p-3 w-full bg-white rounded-lg shadow border border-gray-100 sm:p-4 md:p-6">
        {/* Internal header: title left, segmented control right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 mt-2 gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Laporan Operasional
            </h2>
            <p className="text-gray-500 mt-1">
              Snapshot performa harian dan insight pengiriman gudang Anda.
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 shadow-sm border border-gray-200">
              {[
                { label: "Semua", value: "ALL" },
                { label: "Antar", value: "ANTAR" },
                { label: "Jemput", value: "JEMPUT" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={cn(
                    "px-5 py-2 text-sm font-semibold rounded-md transition-colors focus:outline-none",
                    shipmentType === opt.value
                      ? "bg-white text-blue-700 shadow border border-blue-200"
                      : "bg-transparent text-gray-600 hover:bg-white/70"
                  )}
                  onClick={() => {
                    setShipmentType(opt.value as typeof shipmentType);
                  }}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* KPI Cards */}
        {kpi && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Pengiriman Dibuat"
              value={kpi.totalShipmentsCreatedToday}
              icon={<Truck className="w-5 h-5" />}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard
              title="Pengiriman Diverifikasi"
              value={kpi.totalShipmentsVerifiedToday}
              icon={<Weight className="w-5 h-5" />}
              color="bg-green-100 text-green-600"
            />
            <StatCard
              title="Produk Unik Terkirim"
              value={kpi.uniqueProductsMoved}
              icon={<Package className="w-5 h-5" />}
              color="bg-purple-100 text-purple-600"
            />
            <StatCard
              title="Armada Aktif"
              value={kpi.vehicleUsageCount}
              icon={<Truck className="w-5 h-5" />}
              color="bg-yellow-100 text-yellow-600"
            />
          </div>
        )}
        {/* 7-day trendline bar chart */}
        {kpi && (
          <Card className="mb-6 bg-white border-gray-100">
            <CardHeader>
              <CardTitle>Tren Pengiriman 7 Hari Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kpi.trendline7Days}
                    margin={{ top: 24, right: 32, left: 8, bottom: 24 }}
                    barCategoryGap={24}
                  >
                    <defs>
                      <linearGradient id="barAntar" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                      <linearGradient
                        id="barJemput"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#2563eb"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#2563eb"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      fontSize={13}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      fontSize={13}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        background: "#fff",
                      }}
                      labelStyle={{ fontWeight: 600, color: "#2563eb" }}
                    />
                    <Bar
                      dataKey="antar"
                      fill="url(#barAntar)"
                      radius={[8, 8, 0, 0]}
                      barSize={28}
                      name="Antar"
                    />
                    <Bar
                      dataKey="shipmentCount"
                      fill="url(#barJemput)"
                      radius={[8, 8, 0, 0]}
                      barSize={28}
                      name={
                        shipmentType === "ANTAR"
                          ? "Antar"
                          : shipmentType === "JEMPUT"
                          ? "Jemput"
                          : "Semua"
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Insights Section */}
        {kpi && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-gray-100 mb-6">
            {/* Top products */}
            <Card className="bg-white border-gray-100">
              <CardHeader>
                <CardTitle>Top 3 Produk Terkirim</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.topShippedProducts.length > 0 ? (
                  <ul className="space-y-2">
                    {kpi.topShippedProducts.map((prod, idx) => (
                      <li
                        key={prod.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-700">
                            {idx + 1}.
                          </span>
                          <span>{prod.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {prod.totalQuantity.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {prod.satuan}
                          </span>
                        </div>
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
            {/* Most active vehicle */}
            <Card className="bg-white border-gray-100">
              <CardHeader>
                <CardTitle>Armada Paling Aktif</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.mostActiveVehicle.length > 0 ? (
                  <ul className="space-y-2">
                    {kpi.mostActiveVehicle.map((vehicle, idx) => (
                      <li
                        key={vehicle.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-700">
                            {idx + 1}.
                          </span>
                          <span className="font-semibold">{vehicle.model}</span>
                          <span className="text-sm text-gray-500">
                            {vehicle.plateNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {vehicle.shipmentCount}
                          </span>
                          <span className="text-xs text-gray-500">
                            pengiriman
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
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
            {/* Top customers by shipment count */}
            <Card className="bg-white border-gray-100">
              <CardHeader>
                <CardTitle>Pelanggan Terbanyak (Jumlah barang)</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.topCustomersByShipmentCount.length > 0 ? (
                  <ul className="space-y-2">
                    {kpi.topCustomersByShipmentCount.map((cust) => (
                      <li
                        key={cust.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>{cust.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {cust.shipmentCount}
                          </span>
                          <span className="text-xs text-gray-500">barang</span>
                        </div>
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
            {/* Top customers by volume */}
            <Card className="bg-white border-gray-100">
              <CardHeader>
                <CardTitle>Pelanggan Terbanyak (Volume)</CardTitle>
              </CardHeader>
              <CardContent>
                {kpi.topCustomersByVolume.length > 0 ? (
                  <ul className="space-y-2">
                    {kpi.topCustomersByVolume.map((cust) => (
                      <li
                        key={cust.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>{cust.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {cust.totalQuantity.toLocaleString()}
                          </span>
                        </div>
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
        )}
        {/* Data Table */}
        <DataOperasionalTable
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          status={status}
          shipmentType={shipmentType}
        />
      </div>
    </div>
  );
}
