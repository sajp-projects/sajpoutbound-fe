import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <PieChart width={220} height={220}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
          <div className="flex flex-col gap-2">
            {data.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ background: COLORS[idx % COLORS.length] }}
                ></span>
                <span className="text-sm text-gray-700">{entry.name}</span>
                <Badge variant="outline">{entry.value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
