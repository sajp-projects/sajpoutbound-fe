import { ArrowLeft } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

import { useCustomer } from "@/hooks/customer";
import { useCustomerLogs } from "@/hooks/customerLog";

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
import { cn } from "@/lib/utils";
import { getActionLabel } from "@/utils/badges";
import { formatDate, formatDateShort } from "@/utils/date";

export default function LogPelanggan() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const customerId = id || "";

  const { data: customerData, isLoading: customerLoading } = useCustomer(
    { id: customerId },
    {
      enabled: !!customerId,
    }
  );

  const { data, isLoading } = useCustomerLogs(customerId, {
    enabled: !!customerId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const logs = data?.customerLogs || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const getEntityTypeLabel = (entityType: string) => {
    const labels = {
      CUSTOMER: {
        label: "Pelanggan",
        color: "bg-purple-100 text-purple-800 border-purple-200",
      },
    };
    return (
      labels[entityType as keyof typeof labels] || {
        label: entityType,
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
            Data pelanggan yang dibuat:
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
                  Alamat
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {newData.address as string}
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
            Data pelanggan yang dihapus:
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
                  Alamat
                </td>
                <td className="px-2 py-1 border border-gray-200">
                  {oldData.address as string}
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

      if (oldData.id_sl !== newData.id_sl) {
        changes.push({
          field: "ID",
          oldValue: oldData.id_sl as string,
          newValue: newData.id_sl as string,
        });
      }

      if (oldData.address !== newData.address) {
        changes.push({
          field: "Alamat",
          oldValue: oldData.address as string,
          newValue: newData.address as string,
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
      {/* Tabel Desktop */}
      <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
        <div className="overflow-x-auto">
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
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "rounded-md font-medium border",
                            getActionLabel(log.action).color
                          )}
                        >
                          {getActionLabel(log.action).label}
                        </Badge>
                        <Badge
                          className={cn(
                            "rounded-md font-medium border",
                            getEntityTypeLabel(log.entityType).color
                          )}
                        >
                          {getEntityTypeLabel(log.entityType).label}
                        </Badge>
                      </div>
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
      </div>

      {/* Mobile Card View */}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        "rounded-md font-medium border",
                        getActionLabel(log.action).color
                      )}
                    >
                      {getActionLabel(log.action).label}
                    </Badge>
                    <Badge
                      className={cn(
                        "rounded-md font-medium border",
                        getEntityTypeLabel(log.entityType).color
                      )}
                    >
                      {getEntityTypeLabel(log.entityType).label}
                    </Badge>
                  </div>
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

      {/* Pagination */}
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
        <Link to={`/pelanggan/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Log Aktivitas Pelanggan
        </h1>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        {customerLoading ? (
          <LoadingState text="Memuat data pelanggan..." height="h-20" />
        ) : !customerData ? (
          <div className="p-4 mb-6 rounded-md bg-amber-50">
            <p className="font-medium text-amber-600">
              Peringatan: ID pelanggan tidak ditemukan
            </p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900">
                Log Aktivitas: {customerData.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                ID: {customerData.id_sl}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium">Alamat:</span>{" "}
                {customerData.address}
              </p>
            </div>
          </div>
        )}

        {isLoading ? <LoadingState text="Memuat data log..." /> : <LogList />}
      </div>
    </div>
  );
}
