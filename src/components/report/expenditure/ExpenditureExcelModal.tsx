import { Button } from "@/components/ui/button";
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
import { useAllWarehouses } from "@/hooks/warehouse";
import { OutputReportResult } from "@/types/report";
import { generateExpenditureExcel } from "@/utils/excelGenerator";
import { useState } from "react";


interface ExpenditureExcelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period: "daily" | "monthly" | "yearly";
  dateRange: { start: string; end: string };
  month: number;
  year: number;
  outputReportData: OutputReportResult | undefined;
}

export function ExpenditureExcelModal({
  open,
  onOpenChange,
  period,
  dateRange,
  month,
  year,
  outputReportData,
}: ExpenditureExcelModalProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("ALL");
  const [isDownloading, setIsDownloading] = useState(false);

  // For monthly/yearly filtering
  // Removed unused currentYear variable
  // Removed unused years array
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

  // Remove local filter state, use props only

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      if (!outputReportData) {
        throw new Error("No data available for Excel generation");
      }

      // Get warehouse name for the Excel title
      const selectedWarehouse = warehousesData?.find(w => w.id === selectedWarehouseId);
      const warehouseName = selectedWarehouse?.name;

      // Get warehouse filter
      const warehouseFilter = selectedWarehouseId !== "ALL" ? selectedWarehouseId : undefined;

      // Generate Excel on frontend using existing hook data
      generateExpenditureExcel(outputReportData, warehouseName, warehouseFilter);

      // Close modal after successful download
      onOpenChange(false);
      // Only reset warehouse selection and downloading state
      setSelectedWarehouseId("ALL");
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
              <span className="text-base font-semibold">{
                period === "daily" ? "Harian" : period === "monthly" ? "Bulanan" : "Tahunan"
              }</span>
            </div>
          </div>

          {/* Date Range Filter for Daily */}
          {period === "daily" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Tanggal
              </label>
              <div className="col-span-3">
                <span className="text-base font-semibold">{dateRange.start} - {dateRange.end}</span>
              </div>
            </div>
          )}

          {/* Month/Year Filter for Monthly */}
          {period === "monthly" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right text-sm font-medium">
                Bulan/Tahun
              </label>
              <div className="col-span-3">
                <span className="text-base font-semibold">{months.find(m => m.value === month)?.label} {year}</span>
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
                <span className="text-base font-semibold">{year}</span>
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