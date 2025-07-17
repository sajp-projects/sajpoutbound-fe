import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyGroupType, OutputGroupBase } from "@/types/report";

interface PengeluaranTop3Props {
  groups: OutputGroupBase[];
  groupBy: DailyGroupType;
}

const groupByLabel: Record<DailyGroupType, string> = {
  item: "Barang",
  customer: "Pelanggan",
  warehouse: "Gudang",
  vehicle: "Armada",
};

// Custom badge for larger, centered count
function BigBadge({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="mx-auto block text-base px-4 py-2 font-bold sm:mx-0 sm:inline-flex sm:text-sm sm:px-2 sm:py-1"
    >
      {children}
    </Badge>
  );
}

export function PengeluaranTop3({ groups, groupBy }: PengeluaranTop3Props) {
  if (!groups || groups.length === 0) return null;

  if (groupBy === "item") {
    // Top 3 by Quantity
    const topQuantity = [...groups]
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 3);
    // Top 3 by Weight
    const topWeight = [...groups]
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, 3);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>{`Top 3 Barang (Kuantitas)`}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal">
              {topQuantity.map((g: OutputGroupBase) => (
                <li
                  key={g.id || g.name}
                  className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2"
                >
                  <span className="font-semibold min-w-[120px] text-center sm:text-left">
                    {g.name}
                  </span>
                  <BigBadge>
                    {g.totalQuantity} {g.satuan || ""}
                  </BigBadge>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{`Top 3 Barang (Berat)`}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal">
              {topWeight.map((g: OutputGroupBase) => (
                <li
                  key={g.id || g.name}
                  className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2"
                >
                  <span className="font-semibold min-w-[120px] text-center sm:text-left">
                    {g.name}
                  </span>
                  <BigBadge>
                    {g.totalWeight} {g.satuan || ""}
                  </BigBadge>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For other groupings, show Top 3 by usage (shipmentCount)
  const label = groupByLabel[groupBy] || "Barang";
  const top = [...groups]
    .sort((a, b) => b.shipmentCount - a.shipmentCount)
    .slice(0, 3);
  return (
    <div className="mb-4">
      <Card>
        <CardHeader>
          <CardTitle>{`Top 3 ${label}`}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal">
            {top.map((g: OutputGroupBase) => (
              <li
                key={g.id || g.name}
                className="flex flex-col items-center sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2"
              >
                <span className="font-semibold min-w-[120px] text-center sm:text-left">
                  {g.name}
                </span>
                <BigBadge>
                  {g.shipmentCount}{" "}
                  <span className="ml-1 text-xs text-gray-500">Penggunaan</span>
                </BigBadge>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
