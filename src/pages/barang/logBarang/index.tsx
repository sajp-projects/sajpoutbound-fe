import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Pagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProduct } from "@/hooks/barang";
import { useProductLogsByProductId } from "@/hooks/barangLog";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { ArrowLeft } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

export default function LogBarang() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");
  const productId = id || "";

  const { data: barangData, isLoading: barangLoading } = useProduct(
    { id: productId },
    { enabled: !!productId }
  );

  const { data, isLoading } = useProductLogsByProductId(productId, {
    enabled: !!productId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const getActionLabel = (action: string) => {
    const labels = {
      CREATE: {
        label: "Dibuat",
        color: "bg-green-100 text-green-800 border-green-200",
      },
      UPDATE: {
        label: "Diperbarui",
        color: "bg-amber-100 text-amber-800 border-amber-200",
      },
      DELETE: {
        label: "Dihapus",
        color: "bg-red-100 text-red-800 border-red-200",
      },
      RESTORE: {
        label: "Dipulihkan",
        color: "bg-blue-100 text-blue-800 border-blue-200",
      },
    };
    return (
      labels[action as keyof typeof labels] || {
        label: action,
        color: "bg-gray-100 text-gray-800 border-gray-200",
      }
    );
  };

  const renderChanges = (
    oldData: Record<string, unknown> | null,
    newData: Record<string, unknown> | null
  ) => {
    if (!oldData && !newData) return null;

    if (newData && !oldData) {
      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-700">
            Data barang yang dibuat:
          </div>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Nama
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.name as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  ID
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.id_sl as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Satuan
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.satuan as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Deskripsi
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.description as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Gudang
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {(newData.warehouseName || newData.warehouseId) as string}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (oldData && !newData) {
      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-700">
            Data barang yang dihapus:
          </div>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Nama
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.name as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  ID
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.id_sl as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Satuan
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.satuan as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Deskripsi
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.description as string}
                </td>
              </tr>
              <tr>
                <td className="px-2 py-1 font-medium border border-gray-200 bg-gray-50">
                  Gudang
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {(oldData.warehouseName || oldData.warehouseId) as string}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (oldData && newData) {
      const changes = [];

      if (oldData.name !== newData.name) {
        changes.push({
          field: "Nama",
          oldValue: oldData.name as string,
          newValue: newData.name as string,
        });
      }

      if (oldData.description !== newData.description) {
        changes.push({
          field: "Deskripsi",
          oldValue: oldData.description as string,
          newValue: newData.description as string,
        });
      }

      if (oldData.warehouseId !== newData.warehouseId) {
        changes.push({
          field: "Gudang",
          oldValue: (oldData.warehouseName || oldData.warehouseId) as string,
          newValue: (newData.warehouseName || newData.warehouseId) as string,
        });
      }

      if (oldData.satuan !== newData.satuan) {
        changes.push({
          field: "Satuan",
          oldValue: oldData.satuan as string,
          newValue: newData.satuan as string,
        });
      }

      if (changes.length === 0) return null;

      return (
        <div>
          <div className="mb-1 text-xs font-medium text-gray-700">
            Perubahan:
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-1 font-medium text-left border border-gray-200">
                  Field
                </th>
                <th className="px-2 py-1 font-medium text-left border border-gray-200">
                  Nilai Lama
                </th>
                <th className="px-2 py-1 font-medium text-left border border-gray-200">
                  Nilai Baru
                </th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, idx) => (
                <tr key={idx}>
                  <td className="px-2 py-1 font-medium border border-gray-200">
                    {change.field}
                  </td>
                  <td className="px-2 py-1 border border-gray-200">
                    {change.oldValue}
                  </td>
                  <td className="px-2 py-1 border border-gray-200">
                    {change.newValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  const LogList = () => (
    <>
      {}
      <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50">
              <TableHead className="w-[50px] font-semibold text-gray-700 py-4">
                No
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Waktu
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Aksi
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Dilakukan Oleh
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Deskripsi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <EmptyState
                    title="Tidak ada data log yang ditemukan."
                    message=""
                  />
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow
                  key={log.id}
                  className={cn(index % 2 === 0 ? "bg-white" : "bg-gray-50")}
                >
                  <TableCell className="font-medium text-center">
                    {index + 1 + (pagination.page - 1) * pagination.limit}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-md font-medium border",
                        getActionLabel(log.action).color
                      )}
                    >
                      {getActionLabel(log.action).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-blue-600">
                        {log.performedBy.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.performedBy.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {log.description}
                    </p>
                    {(log.oldData || log.newData) && (
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                          onClick={(e) =>
                            e.currentTarget.nextElementSibling?.classList.toggle(
                              "hidden"
                            )
                          }
                        >
                          Lihat Detail
                        </Button>
                        <div className="hidden mt-2">
                          {renderChanges(log.oldData, log.newData)}
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {}
      <div className="space-y-4 sm:hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
            <EmptyState title="Tidak ada data log yang ditemukan." message="" />
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    className={cn(
                      "rounded-md font-medium border",
                      getActionLabel(log.action).color
                    )}
                  >
                    {getActionLabel(log.action).label}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDateShort(log.createdAt)}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="mb-1 text-sm text-gray-700">
                    {log.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    Dilakukan oleh:{" "}
                    <span className="font-medium text-blue-600">
                      {log.performedBy.name}
                    </span>
                  </div>
                </div>
                {(log.oldData || log.newData) && (
                  <div className="pt-3 mt-3 border-t border-gray-100">
                    {renderChanges(log.oldData, log.newData)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {}
      {data && (
        <Pagination
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      )}
    </>
  );

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/barang/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Log Aktivitas Barang
        </h1>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        {barangLoading ? (
          <LoadingState text="Memuat data barang..." height="h-20" />
        ) : !barangData ? (
          <div className="p-4 mb-6 rounded-md bg-amber-50">
            <p className="font-medium text-amber-600">
              Peringatan: ID barang tidak ditemukan
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900">
                Log Aktivitas: {barangData.name}
              </h2>
              <div className="flex flex-col gap-1 mt-1 sm:flex-row sm:items-center sm:gap-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">ID:</span> {barangData.id_sl}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Satuan:</span>{" "}
                  {barangData.satuan}
                </p>
                {barangData.warehouse && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Gudang:</span>{" "}
                    {barangData.warehouse.name}
                  </p>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {barangData.description}
              </p>
            </div>
          </div>
        )}

        {isLoading ? <LoadingState text="Memuat data log..." /> : <LogList />}
      </div>
    </div>
  );
}
