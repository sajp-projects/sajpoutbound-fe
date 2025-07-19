import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOutputReportTable } from "@/hooks/laporan";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/formatNumber";
import { useState } from "react";

interface PengeluaranTablePaginatedProps {
  filters: {
    period?: "daily" | "monthly" | "yearly";
    startDate?: string;
    endDate?: string;
    year?: number;
    month?: number;
    groupBy?: "item" | "customer" | "vehicle" | "warehouse";
    status?: string;
  };
}

interface TableHeader {
  key: string;
  label: string;
  width: string;
  align: string;
}

interface MobileCardData {
  label: string;
  value: string | number;
}

interface GroupData {
  id: string | null;
  name: string;
  totalQuantity: number;
  totalWeight: number;
  shipmentCount: number;
  satuan?: string;
}

export default function PengeluaranTablePaginated({
  filters,
}: PengeluaranTablePaginatedProps) {
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading, error } = useOutputReportTable({
    ...filters,
    page,
    limit,
  });

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">
          Error: {error?.message || "Terjadi kesalahan saat memuat data"}
        </p>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Tidak ada data untuk ditampilkan</p>
      </div>
    );
  }

  const getTableHeaders = (): TableHeader[] => {
    switch (filters.groupBy) {
      case "item":
        return [
          {
            key: "name",
            label: "Nama Barang",
            width: "w-[30%]",
            align: "text-left",
          },
          {
            key: "totalQuantity",
            label: "Total Kuantitas",
            width: "w-[20%]",
            align: "text-right",
          },
          {
            key: "totalWeight",
            label: "Total Berat (Ditimbang)",
            width: "w-[25%]",
            align: "text-right",
          },
          {
            key: "shipmentCount",
            label: "Jumlah Pengiriman",
            width: "w-[15%]",
            align: "text-center",
          },
          {
            key: "satuan",
            label: "Satuan",
            width: "w-[10%]",
            align: "text-right",
          },
        ];
      case "customer":
        return [
          {
            key: "name",
            label: "Nama Pelanggan",
            width: "w-[25%]",
            align: "text-left",
          },
          {
            key: "shipmentCount",
            label: "Jumlah Pengiriman",
            width: "w-[20%]",
            align: "text-center",
          },
          {
            key: "totalQuantity",
            label: "Total Kuantitas",
            width: "w-[20%]",
            align: "text-right",
          },
          {
            key: "totalWeight",
            label: "Total Berat (Ditimbang)",
            width: "w-[20%]",
            align: "text-right",
          },
          {
            key: "averageQuantity",
            label: "Rata-rata Kuantitas per Pengiriman",
            width: "w-[15%]",
            align: "text-right",
          },
        ];
      case "vehicle":
        return [
          {
            key: "name",
            label: "Nama Armada",
            width: "w-[25%]",
            align: "text-left",
          },
          {
            key: "shipmentCount",
            label: "Jumlah Penggunaan",
            width: "w-[20%]",
            align: "text-center",
          },
          {
            key: "totalQuantity",
            label: "Total Kuantitas",
            width: "w-[20%]",
            align: "text-right",
          },
          {
            key: "totalWeight",
            label: "Total Berat (Ditimbang)",
            width: "w-[20%]",
            align: "text-right",
          },
          {
            key: "averageQuantity",
            label: "Rata-rata Kuantitas per Penggunaan",
            width: "w-[15%]",
            align: "text-right",
          },
        ];
      case "warehouse":
        return [
          {
            key: "name",
            label: "Nama Gudang",
            width: "w-[25%]",
            align: "text-left",
          },
          {
            key: "shipmentCount",
            label: "Jumlah Pengiriman",
            width: "w-[20%]",
            align: "text-center",
          },
          {
            key: "totalQuantity",
            label: "Total Kuantitas",
            width: "w-[20%]",
            align: "text-right",
          },
          {
            key: "totalWeight",
            label: "Total Berat (Ditimbang)",
            width: "w-[20%]",
            align: "text-right",
          },
          {
            key: "averageQuantity",
            label: "Rata-rata Kuantitas per Pengiriman",
            width: "w-[15%]",
            align: "text-right",
          },
        ];
      default:
        return [
          { key: "name", label: "Nama", width: "w-[25%]", align: "text-left" },
          {
            key: "totalQuantity",
            label: "Total Kuantitas",
            width: "w-[20%]",
            align: "text-right",
          },
          {
            key: "totalWeight",
            label: "Total Berat (Ditimbang)",
            width: "w-[25%]",
            align: "text-right",
          },
          {
            key: "shipmentCount",
            label: "Jumlah Pengiriman",
            width: "w-[15%]",
            align: "text-center",
          },
          {
            key: "satuan",
            label: "Satuan",
            width: "w-[10%]",
            align: "text-right",
          },
        ];
    }
  };

  const getCellValue = (group: GroupData, key: string): string => {
    switch (key) {
      case "averageQuantity": {
        const avg =
          group.shipmentCount > 0
            ? group.totalQuantity / group.shipmentCount
            : 0;
        return avg.toFixed(1);
      }
      case "totalWeight":
        return group.totalWeight !== 0
          ? formatNumber(group.totalWeight) + " kg"
          : "Belum ditimbang";
      case "totalQuantity":
        return formatNumber(group.totalQuantity);
      case "shipmentCount":
        return group.shipmentCount.toString();
      case "satuan":
        return group.satuan || "Unit";
      case "name":
        return group.name;
      default:
        return group[key as keyof GroupData]?.toString() || "";
    }
  };

  const getMobileCardData = (group: GroupData): MobileCardData[] => {
    switch (filters.groupBy) {
      case "item":
        return [
          {
            label: "Total Kuantitas",
            value: formatNumber(group.totalQuantity),
          },
          {
            label: "Total Berat",
            value:
              group.totalWeight !== 0
                ? formatNumber(group.totalWeight) + " kg"
                : "Belum ditimbang",
          },
          { label: "Jumlah Pengiriman", value: group.shipmentCount },
          { label: "Satuan", value: group.satuan || "Unit" },
        ];
      case "customer": {
        const avgCustomer =
          group.shipmentCount > 0
            ? (group.totalQuantity / group.shipmentCount).toFixed(1)
            : "0";
        return [
          { label: "Jumlah Pengiriman", value: group.shipmentCount },
          {
            label: "Total Kuantitas",
            value: formatNumber(group.totalQuantity),
          },
          {
            label: "Total Berat",
            value:
              group.totalWeight !== 0
                ? formatNumber(group.totalWeight) + " kg"
                : "Belum ditimbang",
          },
          { label: "Rata-rata Kuantitas per Pengiriman", value: avgCustomer },
        ];
      }
      case "vehicle": {
        const avgVehicle =
          group.shipmentCount > 0
            ? (group.totalQuantity / group.shipmentCount).toFixed(1)
            : "0";
        return [
          { label: "Jumlah Penggunaan", value: group.shipmentCount },
          {
            label: "Total Kuantitas",
            value: formatNumber(group.totalQuantity),
          },
          {
            label: "Total Berat",
            value:
              group.totalWeight !== 0
                ? formatNumber(group.totalWeight) + " kg"
                : "Belum ditimbang",
          },
          { label: "Rata-rata Kuantitas per Penggunaan", value: avgVehicle },
        ];
      }
      case "warehouse": {
        const avgWarehouse =
          group.shipmentCount > 0
            ? (group.totalQuantity / group.shipmentCount).toFixed(1)
            : "0";
        return [
          { label: "Jumlah Pengiriman", value: group.shipmentCount },
          {
            label: "Total Kuantitas",
            value: formatNumber(group.totalQuantity),
          },
          {
            label: "Total Berat",
            value:
              group.totalWeight !== 0
                ? formatNumber(group.totalWeight) + " kg"
                : "Belum ditimbang",
          },
          { label: "Rata-rata Kuantitas per Pengiriman", value: avgWarehouse },
        ];
      }
      default:
        return [
          {
            label: "Total Kuantitas",
            value: formatNumber(group.totalQuantity),
          },
          {
            label: "Total Berat",
            value:
              group.totalWeight !== 0
                ? formatNumber(group.totalWeight) + " kg"
                : "Belum ditimbang",
          },
          { label: "Jumlah Pengiriman", value: group.shipmentCount },
          { label: "Satuan", value: group.satuan || "Unit" },
        ];
    }
  };

  const headers = getTableHeaders();

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden overflow-hidden w-full rounded-lg border border-gray-200 sm:block">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-[5%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                  No.
                </TableHead>
                {headers.map((header) => (
                  <TableHead
                    key={header.key}
                    className={`${header.width} py-3 px-3 ${header.align} font-semibold text-gray-700 text-sm whitespace-nowrap`}
                  >
                    {header.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((group: GroupData, index: number) => (
                <TableRow
                  key={group.id}
                  className={cn(
                    index % 2 === 0 ? "bg-white" : "bg-gray-50",
                    "border-b border-gray-200 last:border-b-0 h-12"
                  )}
                >
                  <TableCell className="py-2.5 px-3 font-medium text-left text-sm align-middle">
                    {(page - 1) * limit + index + 1}
                  </TableCell>
                  {headers.map((header) => (
                    <TableCell
                      key={header.key}
                      className={`py-2.5 px-3 text-gray-600 text-sm ${header.align} align-middle`}
                    >
                      <div
                        className="truncate"
                        title={getCellValue(group, header.key)}
                      >
                        {getCellValue(group, header.key)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="block sm:hidden">
        <div className="space-y-2">
          {data.data.map((group: GroupData) => (
            <div
              key={group.id}
              className="p-3 rounded-lg border border-gray-200 bg-white"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center flex-1 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-gray-800 text-sm">
                      {group.name}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                {getMobileCardData(group).map((item, idx) => (
                  <div key={idx}>
                    <span className="font-medium text-gray-700">
                      {item.label}:
                    </span>
                    <div className="mt-0.5 text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex flex-wrap w-full sm:w-auto items-center gap-2 gap-y-2 justify-start sm:justify-end">
          <button
            className="px-3 py-1 border-gray-300 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={!data.pagination.hasPrev}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Halaman {page} / {data.pagination.totalPages}
          </span>
          <button
            className="px-3 py-1 border-gray-300 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={!data.pagination.hasNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
