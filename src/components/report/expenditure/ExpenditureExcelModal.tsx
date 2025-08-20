import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/ui/DateRangeFilter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadExpenditureExcel } from "@/hooks/report";
import { useAllWarehouses } from "@/hooks/warehouse";
import { useState } from "react";

type PeriodType = "daily" | "monthly" | "yearly";

interface ExpenditureExcelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpenditureExcelModal({
  open,
  onOpenChange,
}: ExpenditureExcelModalProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("ALL");
  const [isDownloading, setIsDownloading] = useState(false);

  // Date filtering state
  const today = new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [dateRange, setDateRange] = useState({ start: today, end: today });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // For monthly/yearly filtering
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
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

  // Fetch all warehouses for dropdown
  const { data: warehousesData } = useAllWarehouses();

  function handleDateChange(s: string, e: string) {
    setDateRange({ start: s, end: e });
  }

  function handlePeriodChange(newPeriod: PeriodType) {
    setPeriod(newPeriod);
    if (newPeriod === "daily") {
      setDateRange({ start: today, end: today });
    } else if (newPeriod === "monthly") {
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
    } else if (newPeriod === "yearly") {
      setYear(new Date().getFullYear());
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const downloadFilters: {
        period?: PeriodType;
        startDate?: string;
        endDate?: string;
        year?: number;
        month?: number;
        warehouseId?: string;
      } = {
        period,
      };

      // Use the same pattern as the existing report filters
      if (period === "daily") {
        if (dateRange.start) downloadFilters.startDate = dateRange.start;
        if (dateRange.end) downloadFilters.endDate = dateRange.end;
      } else if (period === "monthly") {
        downloadFilters.year = year;
        downloadFilters.month = month;
      } else if (period === "yearly") {
        downloadFilters.year = year;
      }

      if (selectedWarehouseId !== "ALL") {
        downloadFilters.warehouseId = selectedWarehouseId;
      }

      await downloadExpenditureExcel(downloadFilters);

      // Close modal after successful download
      onOpenChange(false);

      // Reset selections
      setSelectedWarehouseId("ALL");
      setPeriod("daily");
      setDateRange({ start: today, end: today });
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
    } catch (error) {
      console.error("Download failed:", error);
      // You could add toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Download Laporan Excel</DialogTitle>
          <DialogDescription>
            Pilih periode dan gudang untuk mengunduh laporan expenditure dalam format Excel.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Period Filter */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Periode
            </label>
            <div className="col-span-3">
              <Select
                value={period}
                onValueChange={(value) => handlePeriodChange(value as PeriodType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Filter for Daily */}
          {period === "daily" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Tanggal
              </label>
              <div className="col-span-3">
                <DateRangeFilter
                label=""
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onChange={({ startDate, endDate }) =>
                    handleDateChange(startDate, endDate)
                  }
                />
              </div>
            </div>
          )}

          {/* Month/Year Filter for Monthly */}
          {period === "monthly" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Bulan/Tahun
              </label>
              <div className="col-span-3 flex gap-2">
                <Select
                  value={String(month)}
                  onValueChange={(m) => setMonth(parseInt(m))}
                >
                  <SelectTrigger className="flex-1">
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
                <Select
                  value={String(year)}
                  onValueChange={(y) => setYear(parseInt(y))}
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
              </div>
            </div>
          )}

          {/* Year Filter for Yearly */}
          {period === "yearly" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Tahun
              </label>
              <div className="col-span-3">
                <Select
                  value={String(year)}
                  onValueChange={(y) => setYear(parseInt(y))}
                >
                  <SelectTrigger className="w-32">
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
              </div>
            </div>
          )}

          {/* Warehouse Filter */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">
              Gudang
            </label>
            <div className="col-span-3">
              <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Gudang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Gudang</SelectItem>
                  {warehousesData?.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDownloading}
          >
            Batal
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Mengunduh...
              </>
            ) : (
              "Download Excel"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}