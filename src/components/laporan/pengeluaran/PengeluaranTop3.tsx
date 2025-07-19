import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OutputGroupBase, OutputGroupType } from "@/types/laporan";
import { Building, Package, Truck, Users } from "lucide-react";

interface PengeluaranTop3Props {
  groups: OutputGroupBase[];
  groupBy: OutputGroupType;
}

const groupByLabel: Record<OutputGroupType, string> = {
  item: "Barang",
  customer: "Pelanggan",
  warehouse: "Gudang",
  vehicle: "Armada",
};

const groupByIcon: Record<OutputGroupType, React.ReactNode> = {
  item: <Package className="w-4 h-4" />,
  customer: <Users className="w-4 h-4" />,
  vehicle: <Truck className="w-4 h-4" />,
  warehouse: <Building className="w-4 h-4" />,
};

export function PengeluaranTop3({ groups, groupBy }: PengeluaranTop3Props) {
  if (!groups || groups.length === 0) return null;

  const label = groupByLabel[groupBy] || "Barang";

  // For items, show by quantity; for others, show by shipment count
  const top =
    groupBy === "item"
      ? [...groups]
          .sort((a, b) => b.totalQuantity - a.totalQuantity)
          .slice(0, 3)
      : [...groups]
          .sort((a, b) => b.shipmentCount - a.shipmentCount)
          .slice(0, 3);

  // Calculate total shipments from unique shipment IDs across all groups
  const allShipmentIds = new Set<string>();
  groups.forEach((group) => {
    group.shipments?.forEach((shipment) => {
      allShipmentIds.add(shipment.shipmentId);
    });
  });
  const totalShipments = allShipmentIds.size;

  return (
    <Card className="mb-4 bg-white border-gray-100 h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {groupByIcon[groupBy]}
          {groupBy === "item" ? `Top 3 ${label} (Kuantitas)` : `Top 3 ${label}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[120px] sm:h-[140px] flex flex-col p-2 sm:p-4">
        {/* Header + Items Container */}
        <div className="flex-1 flex flex-col justify-end">
          {/* Top 3 List */}
          <div className="min-w-[150px] sm:min-w-[200px] w-full -mt-10">
            <ul className="space-y-1 sm:space-y-2">
              {top.map((g: OutputGroupBase) => {
                return (
                  <li
                    key={g.id || g.name}
                    className="flex items-center justify-between gap-2 sm:gap-4 py-1"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="font-bold text-blue-700 flex-shrink-0 text-xs sm:text-sm">
                        {top.indexOf(g) + 1}.
                      </span>
                      <span className="font-semibold truncate text-xs sm:text-sm">
                        {g.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        {groupBy === "item"
                          ? g.totalQuantity.toLocaleString()
                          : g.shipmentCount}
                      </span>
                      <span className="text-xs text-gray-500">
                        {groupBy === "item"
                          ? g.satuan || ""
                          : groupBy === "customer"
                          ? "pengiriman"
                          : "penggunaan"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Summary Container */}
        <div className="pt-2 border-t space-y-2 border-gray-100 mt-12 sm:mt-12 lg:mt-12 xl:mt-14">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Total {label}:</span>
            <span className="font-semibold">
              {groups.length.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>
              {groupBy === "item"
                ? "Rata-rata item per pengiriman:"
                : `Rata-rata pengiriman per ${label.toLowerCase()}:`}
            </span>
            <span>
              {groupBy === "item"
                ? Math.round((groups.length / totalShipments) * 100) / 100
                : (totalShipments / groups.length).toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
