import { useDeleteProduct, useProducts } from "@/hooks/barang";
import { Download, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
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
import { Product } from "@/types/barang";
import { formatDate, formatDateShort } from "@/utils/date";
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showForbiddenAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";

export default function DaftarBarang() {
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const {
    data,
    isLoading,
    isError,
    error: productError,
    refetch,
  } = useProducts({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const products = data?.products || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const deleteProductMutation = useDeleteProduct({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Barang berhasil dihapus");
      refetch();
    },
    onError: (error) => {
      try {
        if (error.message && error.message.includes("Forbidden")) {
          showForbiddenAlert(
            "Akses Ditolak",
            "Anda tidak memiliki akses untuk menghapus barang ini."
          );
        } else {
          const errorObj = JSON.parse(error.message);
          showErrorAlert(
            "Gagal Menghapus Barang",
            errorObj.message || "Terjadi kesalahan saat menghapus barang"
          );
        }
      } catch {
        showErrorAlert(
          "Gagal Menghapus Barang",
          error.message || "Terjadi kesalahan saat menghapus barang"
        );
      }
    },
  });

  const handleDeleteProduct = (id: string, name: string) => {
    showDeleteConfirmationAlert(
      "Barang",
      `Apakah Anda yakin ingin menghapus barang "${name}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteProductMutation.mutate({ id });
      }
    });
  };

  const getProductActions = (product: Product) => [
    { type: ActionType.VIEW },
    { type: ActionType.EDIT },
    { type: ActionType.LOG },
    {
      type: ActionType.DELETE,
      onClick: () => handleDeleteProduct(product.id, product.name),
      isLoading:
        deleteProductMutation.isPending &&
        deleteProductMutation.variables?.id === product.id,
      disabled: deleteProductMutation.isPending,
    },
  ];

  return (
    <div className="flex flex-col min-h-full w-full space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Daftar Barang
        </h1>
        <Link to="/barang/tambah">
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Barang
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 w-full">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Barang
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Manajemen data barang
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
            placeholder="Cari barang..."
            className="w-full sm:max-w-md"
          />
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data barang..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data barang"
            message={
              productError instanceof Error
                ? productError.message
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
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        ID
                      </TableHead>
                      <TableHead className="w-[30%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Nama
                      </TableHead>
                      <TableHead className="w-[25%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Gudang
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
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <EmptyState title="Tidak ada data barang yang ditemukan" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((barang, idx) => (
                        <TableRow
                          key={barang.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <TableCell className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                            <div className="wrap-text" title={barang.id_sl}>
                              {barang.id_sl}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-blue-600 font-medium text-sm">
                            <Link
                              to={`/barang/${barang.id}`}
                              className="hover:underline"
                            >
                              <div className="wrap-text" title={barang.name}>
                                {barang.name}
                              </div>
                            </Link>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {barang.warehouse ? (
                              <Link
                                to={`/gudang/${barang.warehouse.id}`}
                                className="text-blue-600 hover:underline"
                              >
                                {barang.warehouse.name}
                              </Link>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(barang.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex justify-center items-center">
                              <ActionButtons
                                actions={getProductActions(barang)}
                                entityId={barang.id}
                                basePath="/barang"
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
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg border-gray-200 bg-white w-full">
                  <EmptyState title="Tidak ada data barang yang ditemukan" />
                </div>
              ) : (
                products.map((barang) => (
                  <div
                    key={barang.id}
                    className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm w-full"
                  >
                    <div className="p-3 w-full">
                      <div className="flex justify-between items-start mb-2 w-full">
                        <div className="max-w-[65%]">
                          <h3 className="font-medium text-blue-600 break-words text-sm">
                            {barang.name}
                          </h3>
                          <p className="text-xs text-gray-600 mt-1">
                            ID: {barang.id_sl}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(barang.createdAt)}
                          </span>
                        </p>
                        {barang.warehouse && (
                          <p>
                            Gudang:{" "}
                            <Link
                              to={`/gudang/${barang.warehouse.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {barang.warehouse.name}
                            </Link>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                        <ActionButtons
                          actions={getProductActions(barang)}
                          entityId={barang.id}
                          basePath="/barang"
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
