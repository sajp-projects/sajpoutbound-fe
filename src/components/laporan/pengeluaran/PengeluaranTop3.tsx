import { EmptyState } from "@/components/EmptyState";
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
  const label = groupByLabel[groupBy] || "Barang";

  return (
    <Card className="mb-4 bg-white border-gray-100 h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {groupByIcon[groupBy]}
          {groupBy === "item" ? `Top 3 ${label} (Kuantitas)` : `Top 3 ${label}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full p-2 sm:p-4">
        {!groups || groups.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              title={`Tidak ada data ${label.toLowerCase()}`}
              message={`Tidak ada data ${label.toLowerCase()} untuk ditampilkan`}
              icon={groupByIcon[groupBy]}
            />
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            {/* List Section */}
            <div className="flex-1 min-w-[150px] sm:min-w-[200px] w-full -mt-10">
              <ul className="space-y-1 sm:space-y-2">
                {(() => {
                  const top =
                    groupBy === "item"
                      ? [...groups]
                          .sort((a, b) => b.totalQuantity - a.totalQuantity)
                          .slice(0, 3)
                      : [...groups]
                          .sort((a, b) => b.shipmentCount - a.shipmentCount)
                          .slice(0, 3);

                  return top.map((g: OutputGroupBase) => (
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
                  ));
                })()}
              </ul>
            </div>

            {/* Summary Section pinned to bottom */}
            <div className="mt-auto pt-4 border-t space-y-2 border-gray-100">
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
                  {(() => {
                    const allShipmentIds = new Set<string>();
                    groups.forEach((group) => {
                      group.shipments?.forEach((shipment) => {
                        allShipmentIds.add(shipment.shipmentId);
                      });
                    });
                    const totalShipments = allShipmentIds.size;

                    return groupBy === "item"
                      ? Math.round((groups.length / totalShipments) * 100) / 100
                      : (totalShipments / groups.length).toFixed(1);
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
