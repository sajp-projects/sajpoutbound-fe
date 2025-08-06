import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PengeluaranFilterBarProps {
  dateRange: { start: string; end: string };
  onDateChange: (start: string, end: string) => void;
  groupBy: string;
  onGroupByChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  onReset?: () => void;
  mode?: "range" | "month";
}

export function PengeluaranFilterBar({
  dateRange,
  onDateChange,
  groupBy,
  onGroupByChange,
  status,
  onStatusChange,
  mode = "range",
}: PengeluaranFilterBarProps) {
  // For month mode
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // 5 years back and 4 ahead
  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  // Parse current month/year from dateRange.start
  let selectedYear = currentYear;
  let selectedMonth = new Date().getMonth() + 1;
  if (mode === "month" && dateRange.start) {
    const d = new Date(dateRange.start);
    selectedYear = d.getFullYear();
    selectedMonth = d.getMonth() + 1;
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 w-full">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 w-full">
        <div className="flex items-center gap-2">
          {mode === "range" ? (
            <DateRangeFilter
              startDate={dateRange.start}
              endDate={dateRange.end}
              onChange={({ startDate, endDate }) =>
                onDateChange(startDate, endDate)
              }
            />
          ) : (
            <>
              <span className="text-sm text-gray-600 font-medium">Bulan:</span>
              <Select
                value={String(selectedMonth)}
                onValueChange={(m) => {
                  const newStart = `${selectedYear}-${m.padStart(2, "0")}-01`;
                  onDateChange(newStart, newStart);
                }}
              >
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600 font-medium ml-2">
                Tahun:
              </span>
              <Select
                value={String(selectedYear)}
                onValueChange={(y) => {
                  const newStart = `${y}-${String(selectedMonth).padStart(
                    2,
                    "0"
                  )}-01`;
                  onDateChange(newStart, newStart);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Group By:</span>
          <Select value={groupBy} onValueChange={onGroupByChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Group By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="item">Barang</SelectItem>
              <SelectItem value="customer">Pelanggan</SelectItem>
              <SelectItem value="vehicle">Armada</SelectItem>
              <SelectItem value="warehouse">Gudang</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Semua" />
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
    </div>
  );
}
