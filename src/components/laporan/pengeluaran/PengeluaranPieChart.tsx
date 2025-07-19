import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

export interface PieChartData {
  name: string;
  value: number;
}

interface PengeluaranPieChartProps {
  data: PieChartData[];
  COLORS: string[];
  title?: string;
}

export function PengeluaranPieChart({
  data,
  COLORS,
  title = "Distribusi Kuantitas",
}: PengeluaranPieChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="mb-4 bg-white border-gray-100 h-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChartIcon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-auto sm:h-[160px] flex items-center justify-center p-2 sm:p-4">
        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full">
          <div className="relative flex-shrink-0">
            <PieChart
              width={160}
              height={160}
              className="sm:w-[200px] sm:h-[200px]"
            >
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                innerRadius={25}
                fill="#8884d8"
                stroke="#fff"
                strokeWidth={2}
                paddingAngle={2}
              >
                {data.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={COLORS[i % COLORS.length]}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className="flex flex-col gap-3 sm:gap-3 flex-1 min-w-0">
            {data.map((entry, idx) => (
              <div
                key={entry.name}
                className="flex items-center gap-3 sm:gap-3 group min-w-0"
              >
                <div className="relative flex-shrink-0">
                  <span
                    className="inline-block w-4 h-4 rounded-full shadow-sm"
                    style={{
                      background: COLORS[idx % COLORS.length],
                      boxShadow: `0 2px 4px ${COLORS[idx % COLORS.length]}40`,
                    }}
                  ></span>
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-white opacity-20 group-hover:opacity-0 transition-opacity"></div>
                </div>
                <div className="w-[120px] flex-shrink-0 min-w-0">
                  <div
                    className="truncate text-sm font-medium text-gray-800"
                    title={entry.name}
                  >
                    {entry.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(
                      (entry.value /
                        data.reduce((sum, item) => sum + item.value, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900 flex-shrink-0 ml-auto">
                  {entry.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
