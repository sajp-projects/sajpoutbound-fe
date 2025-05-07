import { useWarehouses, useDeleteWarehouse } from "@/hooks/gudang";
import { Download, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
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
import { formatDate, formatDateShort } from "@/utils/date";
import {
  showSuccessAlert,
  showErrorAlert,
  isConfirmed,
  showForbiddenAlert,
  showDeleteConfirmationAlert,
} from "@/utils/sweetAlert";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { Warehouse } from "@/types/gudang";

export default function DaftarGudang() {
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const {
    data,
    isLoading,
    isError,
    error: warehouseError,
    refetch,
  } = useWarehouses({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const warehouses = data?.warehouses || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const deleteWarehouseMutation = useDeleteWarehouse({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Gudang berhasil dihapus");
      refetch();
    },
    onError: (error) => {
      try {
        if (error.message && error.message.includes("Forbidden")) {
          showForbiddenAlert(
            "Akses Ditolak",
            "Anda tidak memiliki akses untuk menghapus gudang ini."
          );
        } else {
          const errorObj = JSON.parse(error.message);
          showErrorAlert(
            "Gagal Menghapus Gudang",
            errorObj.message || "Terjadi kesalahan saat menghapus gudang"
          );
        }
      } catch {
        showErrorAlert(
          "Gagal Menghapus Gudang",
          error.message || "Terjadi kesalahan saat menghapus gudang"
        );
      }
    },
  });

  const handleDeleteWarehouse = (id: string, name: string) => {
    showDeleteConfirmationAlert(
      "Gudang",
      `Apakah Anda yakin ingin menghapus gudang "${name}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteWarehouseMutation.mutate({ id });
      }
    });
  };

  const getWarehouseActions = (warehouse: Warehouse) => [
    { type: ActionType.VIEW },
    { type: ActionType.EDIT },
    { type: ActionType.LOG },
    {
      type: ActionType.DELETE,
      onClick: () => handleDeleteWarehouse(warehouse.id, warehouse.name),
      isLoading:
        deleteWarehouseMutation.isPending &&
        deleteWarehouseMutation.variables?.id === warehouse.id,
      disabled: deleteWarehouseMutation.isPending,
    },
  ];

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Daftar Gudang
        </h1>
        <Link to="/gudang/tambah">
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Gudang
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 w-full">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Gudang
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Manajemen data gudang penyimpanan
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto items-center">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-3 w-3 sm:h-4 sm:w-4" />}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="mb-4 sm:mb-6 w-full">
          <SearchInput
            placeholder="Cari gudang..."
            className="w-full sm:max-w-md"
          />
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data gudang..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data gudang"
            message={
              warehouseError instanceof Error
                ? warehouseError.message
                : "Terjadi kesalahan pada server"
            }
            onRetry={() => refetch()}
          />
        ) : (
          <div className="w-full">
            {}
            <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden w-full">
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="w-[60px] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        No.
                      </TableHead>
                      <TableHead className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Nama
                      </TableHead>
                      <TableHead className="w-[30%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Deskripsi
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Pengelola
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Dibuat
                      </TableHead>
                      <TableHead className="w-[130px] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <EmptyState title="Tidak ada data gudang yang ditemukan" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      warehouses.map((gudang, idx) => (
                        <TableRow
                          key={gudang.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <TableCell className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                            <Link
                              to={`/gudang/${gudang.id}`}
                              className="hover:underline"
                            >
                              <div className="wrap-text" title={gudang.name}>
                                {gudang.name}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-sm">
                            <div
                              className="wrap-text"
                              title={gudang.description}
                            >
                              {gudang.description}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {gudang.user ? (
                              <Link
                                to={`/pengguna/${gudang.user.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {gudang.user.name}
                              </Link>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(gudang.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex justify-center items-center">
                              <ActionButtons
                                actions={getWarehouseActions(gudang)}
                                entityId={gudang.id}
                                basePath="/gudang"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {}
            <div className="sm:hidden space-y-3 w-full">
              {warehouses.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg border-gray-200 bg-white w-full">
                  <EmptyState title="Tidak ada data gudang yang ditemukan" />
                </div>
              ) : (
                warehouses.map((gudang) => (
                  <div
                    key={gudang.id}
                    className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm w-full"
                  >
                    <div className="p-3 w-full">
                      <div className="flex justify-between items-start mb-2 w-full">
                        <div className="max-w-[65%]">
                          <h3 className="font-medium text-blue-600 break-words text-sm">
                            {gudang.name}
                          </h3>
                          <p className="text-xs text-gray-600 break-all mt-1">
                            {gudang.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(gudang.createdAt)}
                          </span>
                        </p>
                        {gudang.user && (
                          <p>
                            Pengelola:{" "}
                            <Link
                              to={`/pengguna/${gudang.user.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {gudang.user.name}
                            </Link>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                        <ActionButtons
                          actions={getWarehouseActions(gudang)}
                          entityId={gudang.id}
                          basePath="/gudang"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {}
            <div className="w-full mt-4">
              <Pagination
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
