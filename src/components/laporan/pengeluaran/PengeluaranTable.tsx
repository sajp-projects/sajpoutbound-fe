import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OutputGroupBase } from "@/types/report";
import { Inbox } from "lucide-react";

interface PaginationInfo {
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

interface PengeluaranTableProps {
  data: OutputGroupBase[];
  pagination?: PaginationInfo;
  setPage?: (page: number) => void;
  className?: string;
}

export function PengeluaranTable({
  data,
  pagination,
  setPage,
  className = "",
}: PengeluaranTableProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
        <CardTitle>Detail Data</CardTitle>
        {pagination && setPage && (
          <div className="flex flex-wrap w-full sm:w-auto items-center gap-2 gap-y-2 justify-start sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, pagination.page - 1))}
              disabled={!pagination.hasPrev}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-gray-600">
              Halaman {pagination.page} dari {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Kuantitas</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Jumlah Pengiriman</TableHead>
                <TableHead>Gudang</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data && data.length > 0 ? (
                data.map((row: OutputGroupBase) => (
                  <TableRow key={row.id || row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.satuan || "-"}</TableCell>
                    <TableCell>{row.totalQuantity}</TableCell>
                    <TableCell>{row.totalWeight}</TableCell>
                    <TableCell>{row.shipmentCount}</TableCell>
                    <TableCell>
                      {row.shipments && row.shipments.length > 0
                        ? row.shipments[0].item.warehouse.name
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-48 text-center align-middle"
                  >
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <Inbox className="w-10 h-10 text-gray-300 mb-2" />
                      <div className="text-gray-500 font-semibold text-lg mb-1">
                        Tidak ada data
                      </div>
                      <div className="text-gray-400 text-sm">
                        Belum ada data pada periode ini.
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
