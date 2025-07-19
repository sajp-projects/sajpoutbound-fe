import { Card } from "@/components/ui/card";
import { OutputReportSummary } from "@/types/laporan";
import {
  Calendar,
  CalendarDays,
  Layers,
  Package,
  Tag,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import React from "react";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card className="flex bg-white border-gray-100 flex-row items-center gap-4 p-4">
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

export function PengeluaranStatCards({
  summary,
  groups,
}: {
  summary: OutputReportSummary;
  groups: {
    name: string;
    satuan?: string;
    customer?: { id: string };
    warehouse?: { id: string };
    armada?: { id: string };
  }[];
}) {
  // Unique satuan
  const uniqueSatuan = new Set(groups.map((g) => g.satuan).filter(Boolean));
  // Unique items
  const uniqueItems = new Set(groups.map((g) => g.name).filter(Boolean));
  // Unique customers
  const uniqueCustomers = new Set(
    groups.map((g) => g.customer?.id).filter(Boolean)
  );
  // Unique warehouses
  const uniqueWarehouses = new Set(
    groups.map((g) => g.warehouse?.id).filter(Boolean)
  );
  // Unique vehicles
  const uniqueVehicles = new Set(
    groups.map((g) => g.armada?.id).filter(Boolean)
  );

  // Period label
  let periodLabel = "-";
  if (summary.dateRange) {
    if (summary.dateRange.start === summary.dateRange.end) {
      periodLabel = summary.dateRange.start;
    } else {
      periodLabel = `${summary.dateRange.start} s/d ${summary.dateRange.end}`;
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <StatCard
        icon={<Package className="w-5 h-5" />}
        label="Total Grup"
        value={summary.totalGroups}
      />
      <StatCard
        icon={<CalendarDays className="w-5 h-5" />}
        label="Total Pengiriman"
        value={summary.totalShipments}
      />
      <StatCard
        icon={<Layers className="w-5 h-5" />}
        label="Jumlah Satuan Berbeda"
        value={uniqueSatuan.size}
      />
      <StatCard
        icon={<Tag className="w-5 h-5" />}
        label="Jumlah Barang Berbeda"
        value={uniqueItems.size}
      />
      {uniqueCustomers.size > 0 && (
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Jumlah Pelanggan Berbeda"
          value={uniqueCustomers.size}
        />
      )}
      {uniqueWarehouses.size > 0 && (
        <StatCard
          icon={<Warehouse className="w-5 h-5" />}
          label="Jumlah Gudang Berbeda"
          value={uniqueWarehouses.size}
        />
      )}
      {uniqueVehicles.size > 0 && (
        <StatCard
          icon={<Truck className="w-5 h-5" />}
          label="Jumlah Armada Berbeda"
          value={uniqueVehicles.size}
        />
      )}
      <StatCard
        icon={<Calendar className="w-5 h-5" />}
        label="Periode"
        value={periodLabel}
      />
    </div>
  );
}
