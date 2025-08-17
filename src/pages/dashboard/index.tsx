import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/permission";
import { useDashboardSummary } from "@/hooks/report";
import { formatDate } from "@/utils/date";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  Activity,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  Package,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  // Date range state (copied from laporan/operasional/index.tsx)
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date(new Date().setHours(23, 59, 59, 999))
      .toISOString()
      .slice(0, 10),
    endDate: new Date(new Date().setHours(23, 59, 59, 999))
      .toISOString()
      .slice(0, 10),
  });

  // Real API integration with new comprehensive dashboard summary
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error,
  } = useDashboardSummary({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Loading state component
  const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
    <Skeleton className={`h-20 w-full ${className}`} />
  );

  // Error fallback
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard data</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Extract data from comprehensive dashboard summary
  const kpi = dashboardData?.kpi;
  const doSummary = dashboardData?.doSummary;
  const recentActivities = dashboardData?.recentActivities || [];
  const unprocessedDOs = dashboardData?.unprocessedDOs || [];

  console.log(unprocessedDOs, "unprocessedDos");
  const armada = dashboardData?.armada;

  // Shipment stats for ANTAR and JEMPUT
  const shipmentStats = {
    antar: {
      pending: doSummary?.ANTAR?.PENDING || 0,
      proses: doSummary?.ANTAR?.PROSES || 0,
      selesai: doSummary?.ANTAR?.SELESAI || 0,
      total: doSummary?.ANTAR?.total || 0,
    },
    jemput: {
      pending: doSummary?.JEMPUT?.PENDING || 0,
      proses: doSummary?.JEMPUT?.PROSES || 0,
      selesai: doSummary?.JEMPUT?.SELESAI || 0,
      total: doSummary?.JEMPUT?.total || 0,
    },
  };

  // For progress bar and summary
  const operationalSummary = doSummary;
  const operationalKPI = kpi;
  const isOperationalLoading = isDashboardLoading;

  // Recent items for limited display
  const recentItems = recentActivities.slice(0, 5) || [];

  // Permission checks
  const canReadShipments = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.READ
  );
  const canReadArmada = hasPermission(
    permissions,
    PERMISSION.RESOURCES.ARMADA,
    PERMISSION.ACTIONS.READ
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "PROSES":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "SELESAI":
        return "bg-green-50 text-green-600 border-green-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const handleNavigateToShipments = (
    status?: string,
    type?: "ANTAR" | "JEMPUT"
  ) => {
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    if (status) {
      params.set("status", status);
    }
    if (type) {
      params.set("type", type);
    }
    navigate(`/pengiriman?${params.toString()}`);
  };

  const handleNavigateToArmada = () => {
    navigate("/armada");
  };

  return (
    <div className="flex flex-col px-2 space-y-4 w-full min-h-full sm:space-y-6 sm:px-4 md:px-0">
      {/* Outer Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 md:gap-4 w-full">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto items-start sm:items-center justify-start sm:justify-end">
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={(range) => {
              setDateRange(range);
            }}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="overflow-hidden p-3 w-full bg-white rounded-lg shadow border border-gray-100 sm:p-4 md:p-6">
        {/* Internal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 mt-2 gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-500 mt-1">
              Selamat datang kembali! Berikut ringkasan operasional hari ini.
            </p>
          </div>
        </div>

        {/* DO Belum Diproses/Terkirim - Main Priority List */}
        <div className="mb-6">
          <Card className="bg-white border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                DO Belum Diproses/Terkirim ({unprocessedDOs?.length ?? 0})
              </CardTitle>
              <p className="text-sm text-gray-600">
                Daftar Delivery Order yang belum di proses atau terkirim
              </p>
            </CardHeader>
            <CardContent>
              {isDashboardLoading ? (
                <LoadingSkeleton className="h-64" />
              ) : unprocessedDOs && unprocessedDOs.length > 0 ? (
                <div className="space-y-3">
                  {unprocessedDOs.slice(0, 5).map((DO) => (
                    <div
                      key={DO.id}
                      className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors border-gray-200"
                    >
                      {/* Mobile Layout - Status at top right */}
                      <div className="sm:hidden">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">
                              {DO.doNumber ||
                                `DO-${DO.id.slice(-6).toUpperCase()}`}
                            </p>
                            <p className="text-xs text-gray-600">
                              {DO.customer.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(DO.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusBadgeClass(DO.status)}>
                              {DO.status}
                            </Badge>
                            {hasPermission(
                              permissions,
                              PERMISSION.RESOURCES.DO,
                              PERMISSION.ACTIONS.READ
                            ) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => navigate(`/do/${DO.id}`)}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {DO.items.slice(0, 1).map((item) => (
                            <Badge
                              key={item.id}
                              variant="outline"
                              className="text-xs border-gray-200"
                            >
                              {item.product.name}: {item.pendingQuantity}{" "}
                              {item.product.satuan}
                            </Badge>
                          ))}
                          {DO.items.length > 1 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-gray-200"
                            >
                              +{DO.items.length - 1} item
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Desktop Layout - Original side by side */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium text-sm text-gray-900">
                                {DO.doNumber ||
                                  `DO-${DO.id.slice(-6).toUpperCase()}`}
                              </p>
                              <p className="text-xs text-gray-600">
                                {DO.customer.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(DO.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {DO.items.slice(0, 2).map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="outline"
                                  className="text-xs border-gray-200 border-1"
                                >
                                  {item.product.name}: {item.pendingQuantity}{" "}
                                  {item.product.satuan}
                                </Badge>
                              ))}
                              {DO.items.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{DO.items.length - 2} lainnya
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadgeClass(DO.status)}>
                            {DO.status}
                          </Badge>
                          {hasPermission(
                            permissions,
                            PERMISSION.RESOURCES.DO,
                            PERMISSION.ACTIONS.READ
                          ) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => navigate(`/do/${DO.id}`)}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">Semua DO sudah diproses!</p>
                  <p className="text-sm text-gray-500">
                    Tidak ada Delivery Order yang memerlukan perhatian.
                  </p>
                </div>
              )}
              {hasPermission(
                permissions,
                PERMISSION.RESOURCES.DO,
                PERMISSION.ACTIONS.READ
              ) &&
                unprocessedDOs &&
                unprocessedDOs.length > 0 && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/do")}
                      className="w-full"
                    >
                      Lihat Semua DO
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Delivery Order Management - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {isOperationalLoading ? (
            <>
              <LoadingSkeleton className="h-96" />
              <LoadingSkeleton className="h-96" />
            </>
          ) : (
            <>
              {/* DO ANTAR Section */}
              <Card className="bg-white border-gray-100">
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {/* Centered Header */}
                    <div className="relative">
                      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-6 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                          <div className="p-2 sm:p-3 bg-gray-100 rounded-xl">
                            <Truck className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                              DO ANTAR KOTA
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Armada Internal
                            </p>
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-2">
                              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                {shipmentStats.antar.total}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600">
                                Total DO
                              </span>
                            </div>
                          </div>
                          {canReadShipments && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:bg-gray-100 text-xs sm:text-sm"
                              onClick={() =>
                                handleNavigateToShipments(undefined, "ANTAR")
                              }
                            >
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Detail</span>
                              <span className="sm:hidden">•••</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Connecting Line */}
                      <div className="absolute left-1/2 top-full w-px h-8 bg-gray-300 transform -translate-x-1/2"></div>
                    </div>

                    {/* ANTAR Status Cards with Branch Lines */}
                    <div className="relative">
                      {/* Branch Lines */}
                      <div className="relative mb-6">
                        <div className="absolute left-1/2 top-0 w-1/2 h-px bg-gray-300 transform -translate-x-1/2"></div>
                        <div className="absolute left-1/6 top-0 w-px h-4 bg-gray-300"></div>
                        <div className="absolute left-1/2 top-0 w-px h-4 bg-gray-300"></div>
                        <div className="absolute left-5/6 top-0 w-px h-4 bg-gray-300"></div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-4">
                        {[
                          {
                            status: "PENDING",
                            count: shipmentStats.antar.pending,
                            icon: <Clock className="w-5 h-5 text-gray-600" />,
                          },
                          {
                            status: "PROSES",
                            count: shipmentStats.antar.proses,
                            icon: (
                              <Activity className="w-5 h-5 text-gray-600" />
                            ),
                          },
                          {
                            status: "SELESAI",
                            count: shipmentStats.antar.selesai,
                            icon: (
                              <CheckCircle className="w-5 h-5 text-gray-600" />
                            ),
                          },
                        ].map((item) => (
                          <div
                            key={`antar-${item.status}`}
                            className={`bg-white border border-gray-200 rounded-lg p-2 sm:p-3 text-center transition-all group min-h-[90px] sm:min-h-[110px] flex flex-col justify-center ${
                              canReadShipments
                                ? "hover:shadow-md cursor-pointer"
                                : "cursor-default"
                            }`}
                            onClick={
                              canReadShipments
                                ? () =>
                                    handleNavigateToShipments(
                                      item.status,
                                      "ANTAR"
                                    )
                                : undefined
                            }
                          >
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                              {item.icon}
                            </div>
                            <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                              {item.count}
                            </div>
                            <div className="text-xs font-medium text-gray-600">
                              {item.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DO JEMPUT Section */}
              <Card className="bg-white border-gray-100">
                <CardContent className="p-6">
                  <div className="space-y-8">
                    {/* Centered Header */}
                    <div className="relative">
                      <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-6 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
                          <div className="p-2 sm:p-3 bg-gray-100 rounded-xl">
                            <Users className="w-5 h-5 sm:w-7 sm:h-7 text-gray-600" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                              DO JEMPUT
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Kendaraan Pelanggan
                            </p>
                            <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-2">
                              <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                {shipmentStats.jemput.total}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600">
                                Total DO
                              </span>
                            </div>
                          </div>
                          {canReadShipments && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:bg-gray-100 text-xs sm:text-sm"
                              onClick={() =>
                                handleNavigateToShipments(undefined, "JEMPUT")
                              }
                            >
                              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">Detail</span>
                              <span className="sm:hidden">•••</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Connecting Line */}
                      <div className="absolute left-1/2 top-full w-px h-8 bg-gray-300 transform -translate-x-1/2"></div>
                    </div>

                    {/* JEMPUT Status Cards with Branch Lines */}
                    <div className="relative">
                      {/* Branch Lines */}
                      <div className="relative mb-6">
                        <div className="absolute left-1/2 top-0 w-1/2 h-px bg-gray-300 transform -translate-x-1/2"></div>
                        <div className="absolute left-1/6 top-0 w-px h-4 bg-gray-300"></div>
                        <div className="absolute left-1/2 top-0 w-px h-4 bg-gray-300"></div>
                        <div className="absolute left-5/6 top-0 w-px h-4 bg-gray-300"></div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-4">
                        {[
                          {
                            status: "PENDING",
                            count: shipmentStats.jemput.pending,
                            icon: <Clock className="w-5 h-5 text-gray-600" />,
                          },
                          {
                            status: "PROSES",
                            count: shipmentStats.jemput.proses,
                            icon: (
                              <Activity className="w-5 h-5 text-gray-600" />
                            ),
                          },
                          {
                            status: "SELESAI",
                            count: shipmentStats.jemput.selesai,
                            icon: (
                              <CheckCircle className="w-5 h-5 text-gray-600" />
                            ),
                          },
                        ].map((item) => (
                          <div
                            key={`jemput-${item.status}`}
                            className={`bg-white border border-gray-200 rounded-lg p-2 sm:p-3 text-center transition-all group min-h-[90px] sm:min-h-[110px] flex flex-col justify-center ${
                              canReadShipments
                                ? "hover:shadow-md cursor-pointer"
                                : "cursor-default"
                            }`}
                            onClick={
                              canReadShipments
                                ? () =>
                                    handleNavigateToShipments(
                                      item.status,
                                      "JEMPUT"
                                    )
                                : undefined
                            }
                          >
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-100 rounded-full mx-auto mb-1 sm:mb-2 flex items-center justify-center">
                              {item.icon}
                            </div>
                            <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                              {item.count}
                            </div>
                            <div className="text-xs font-medium text-gray-600">
                              {item.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* KPI Dashboard - Improved Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-stretch">
          {/* KPI Summary - Main Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-100 h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center text-gray-900">
                      <Activity className="w-6 h-6 mr-3" />
                      KPI Hari Ini
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Ringkasan performa operasional
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isOperationalLoading ? (
                  <LoadingSkeleton className="h-64" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {operationalKPI?.totalShipmentsCreatedToday || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Pengiriman Dibuat
                      </div>
                      <div className="text-xs text-gray-500">
                        Total hari ini
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {operationalKPI?.totalShipmentsVerifiedToday || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Terverifikasi
                      </div>
                      <div className="text-xs text-gray-500">
                        Sudah dikonfirmasi
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {operationalKPI?.uniqueProductsMoved || 0}
                      </div>
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        Produk Unik
                      </div>
                      <div className="text-xs text-gray-500">Jenis barang</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card className="bg-white border-gray-100 h-full flex flex-col">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-gray-900">
                  Aktivitas Terbaru
                </CardTitle>
                <p className="text-sm text-gray-500">Pengiriman terkini</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {isOperationalLoading ? (
                  <LoadingSkeleton className="h-64" />
                ) : (
                  <div className="space-y-2 flex-1 flex flex-col">
                    <div className="flex-1">
                      {recentItems.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {item.shipmentNumber}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getStatusBadgeClass(
                              item.status
                            )} text-xs`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                      {recentItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 py-4">
                          <Activity className="w-8 h-8 text-gray-300 mb-2" />
                          <div className="text-gray-500 font-semibold text-base mb-1">
                            Belum ada aktivitas hari ini
                          </div>
                        </div>
                      )}
                    </div>
                    {recentItems.length > 0 && canReadShipments && (
                      <div className="text-center pt-4 mt-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm text-gray-600"
                          onClick={() => handleNavigateToShipments()}
                        >
                          Lihat Semua
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pengeluaran Barang Overview - Enhanced */}
        <Card className="bg-white border-gray-100 mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Package className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    Pengeluaran Barang
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Detail aktivitas dan distribusi barang hari ini
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {operationalKPI?.uniqueProductsMoved || 0}
                </div>
                <div className="text-xs text-gray-500">Produk Unik</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isOperationalLoading ? (
              <LoadingSkeleton className="h-64" />
            ) : (
              <>
                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Performance Metrics */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Performa Hari Ini
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">
                          Total Pengiriman Dibuat
                        </span>
                        <span className="font-bold text-gray-900">
                          {operationalKPI?.totalShipmentsCreatedToday || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">
                          Pengiriman Terverifikasi
                        </span>
                        <span className="font-bold text-gray-900">
                          {operationalKPI?.totalShipmentsVerifiedToday || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">
                          Tingkat Penyelesaian
                        </span>
                        <span className="font-bold text-green-600">
                          {operationalSummary &&
                          operationalSummary.overall.total > 0
                            ? Math.round(
                                (operationalSummary.overall.SELESAI /
                                  operationalSummary.overall.total) *
                                  100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">
                          Produk Unik Dipindah
                        </span>
                        <span className="font-bold text-purple-600">
                          {operationalKPI?.uniqueProductsMoved || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Distribution Analysis */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Truck className="w-5 h-5 mr-2" />
                      Distribusi Pengiriman
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">
                            DO Antar Kota
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {shipmentStats.antar.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">
                            DO Jemput
                          </span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {shipmentStats.jemput.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">
                          Rasio Antar/Jemput
                        </span>
                        <span className="font-bold text-gray-900">
                          {shipmentStats.antar.total > 0 &&
                          shipmentStats.jemput.total > 0
                            ? `${Math.round(
                                (shipmentStats.antar.total /
                                  (shipmentStats.antar.total +
                                    shipmentStats.jemput.total)) *
                                  100
                              )}/${Math.round(
                                (shipmentStats.jemput.total /
                                  (shipmentStats.antar.total +
                                    shipmentStats.jemput.total)) *
                                  100
                              )}`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">
                          Total DO Aktif
                        </span>
                        <span className="font-bold text-indigo-600">
                          {shipmentStats.antar.pending +
                            shipmentStats.jemput.pending +
                            shipmentStats.antar.proses +
                            shipmentStats.jemput.proses}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Progress Bar */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Progress Keseluruhan
                    </h4>
                    <span className="text-2xl font-bold text-gray-900">
                      {operationalSummary &&
                      operationalSummary.overall.total > 0
                        ? Math.round(
                            (operationalSummary.overall.SELESAI /
                              operationalSummary.overall.total) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          operationalSummary &&
                          operationalSummary.overall.total > 0
                            ? Math.round(
                                (operationalSummary.overall.SELESAI /
                                  operationalSummary.overall.total) *
                                  100
                              )
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold text-yellow-600">
                        {operationalSummary?.overall?.PENDING || 0}
                      </div>
                      <div className="text-gray-500">Pending</div>
                    </div>
                    <div>
                      <div className="font-bold text-blue-600">
                        {operationalSummary?.overall?.PROSES || 0}
                      </div>
                      <div className="text-gray-500">Proses</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-600">
                        {operationalSummary?.overall?.SELESAI || 0}
                      </div>
                      <div className="text-gray-500">Selesai</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Armada Usage Overview */}
        <Card className="bg-white border-gray-100">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <Truck className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">
                    Penggunaan Armada
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    Armada dari pengiriman terbaru hari ini
                  </p>
                </div>
              </div>
              {canReadArmada && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 hover:bg-gray-50 w-full sm:w-auto"
                  onClick={handleNavigateToArmada}
                >
                  <span className="sm:hidden">Kelola</span>
                  <span className="hidden sm:inline">Kelola Armada</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isDashboardLoading ? (
              <LoadingSkeleton className="h-64" />
            ) : (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {armada?.total || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 leading-tight">
                      Total Armada
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {armada?.usageCount || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 leading-tight">
                      <span className="hidden sm:inline">Sedang Digunakan</span>
                      <span className="sm:hidden">Digunakan</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {(armada?.total || 0) - (armada?.usageCount || 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 leading-tight">
                      Tersedia
                    </div>
                  </div>
                </div>

                {/* Active Shipments Table */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Pengiriman Aktif Hari Ini
                  </h4>

                  {recentActivities.length > 0 ? (
                    <>
                      {/* Table for larger screens */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Armada
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Plat Nomor
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">
                                No. Pengiriman
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Status
                              </th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">
                                Waktu
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentActivities
                              .slice(0, 6)
                              .map((activity, index) => {
                                // For demo purposes, we'll use alternating armada data since we don't have it in recentActivities
                                // In real implementation, this should come from the backend
                                const demoArmadaModels = [
                                  "Truk Fuso",
                                  "Pickup L300",
                                  "Truk Colt Diesel",
                                ];
                                const demoPlateNumbers = [
                                  "B 1234 CD",
                                  "B 5678 EF",
                                  "B 9012 GH",
                                ];

                                return (
                                  <tr
                                    key={activity.id}
                                    className="border-b border-gray-100 hover:bg-gray-50"
                                  >
                                    <td className="py-3 px-4 text-gray-900 font-medium">
                                      {demoArmadaModels[index % 3]}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">
                                      {demoPlateNumbers[index % 3]}
                                    </td>
                                    <td className="py-3 px-4 text-gray-900 font-medium">
                                      {activity.shipmentNumber}
                                    </td>
                                    <td className="py-3 px-4">
                                      <Badge
                                        variant="outline"
                                        className={`${getStatusBadgeClass(
                                          activity.status
                                        )} text-xs`}
                                      >
                                        {activity.status}
                                      </Badge>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 text-xs">
                                      {formatDate(activity.createdAt)}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>

                      {/* Cards for smaller screens */}
                      <div className="md:hidden space-y-3">
                        {recentActivities.slice(0, 6).map((activity, index) => {
                          // For demo purposes, we'll use alternating armada data since we don't have it in recentActivities
                          // In real implementation, this should come from the backend
                          const demoArmadaModels = [
                            "Truk Fuso",
                            "Pickup L300",
                            "Truk Colt Diesel",
                          ];
                          const demoPlateNumbers = [
                            "B 1234 CD",
                            "B 5678 EF",
                            "B 9012 GH",
                          ];

                          return (
                            <div
                              key={activity.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 mb-1">
                                    {activity.shipmentNumber}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(activity.createdAt)}
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`${getStatusBadgeClass(
                                    activity.status
                                  )} text-xs`}
                                >
                                  {activity.status}
                                </Badge>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Armada:</span>
                                  <span className="font-medium text-gray-900">
                                    {demoArmadaModels[index % 3]}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Plat:</span>
                                  <span className="text-gray-900">
                                    {demoPlateNumbers[index % 3]}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {recentActivities.length > 6 && canReadShipments && (
                        <div className="text-center pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm text-gray-600"
                            onClick={() => handleNavigateToShipments()}
                          >
                            Lihat Semua Pengiriman
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">
                        Belum ada pengiriman aktif hari ini
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
