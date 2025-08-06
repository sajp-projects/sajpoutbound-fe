import { Card } from "../ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

// StatCard and PieChart helpers
export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <Card className="flex bg-white border-gray-100 flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4">
      <div className={`p-1.5 sm:p-2 rounded-full ${color} flex-shrink-0`}>
        {Icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wide leading-tight">
          {title}
        </div>
        <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
          {value}
        </div>
      </div>
    </Card>
  );
}
