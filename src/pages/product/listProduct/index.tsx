import { useDeleteProduct, useProducts } from "@/hooks/product";
import { Plus } from "lucide-react";
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
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/permission";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { formatDate, formatDateShort } from "@/utils/date";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";

// Tambahkan tipe ActionConfig
interface ActionConfig {
  type: ActionType;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  path?: string;
}

export default function DaftarBarang() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const hasProductCreateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PRODUCT,
    PERMISSION.ACTIONS.CREATE
  );

  const hasProductUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PRODUCT,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasProductDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PRODUCT,
    PERMISSION.ACTIONS.DELETE
  );

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
      showErrorAlert(
        "Gagal Menghapus Barang",
        error.message || "Terjadi kesalahan saat menghapus barang"
      );
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

  const getProductActions = (product: Product) => {
    const actions: ActionConfig[] = [{ type: ActionType.VIEW }];

    if (hasProductUpdateAccess) {
      actions.push({ type: ActionType.EDIT });
    }

    actions.push({ type: ActionType.LOG });

    if (hasProductDeleteAccess) {
      actions.push({
        type: ActionType.DELETE,
        onClick: () => handleDeleteProduct(product.id, product.name),
        isLoading:
          deleteProductMutation.isPending &&
          deleteProductMutation.variables?.id === product.id,
        disabled: deleteProductMutation.isPending,
      });
    }

    return actions;
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
          Daftar Barang
        </h1>
        {hasProductCreateAccess && (
          <Link to="/barang/tambah">
            <Button
              leftIcon={<Plus className="w-3 h-3 sm:w-4 sm:h-4" />}
              size="sm"
              className="text-xs sm:text-sm"
            >
              Tambah
            </Button>
          </Link>
        )}
      </div>

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Barang
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Manajemen data barang
            </p>
          </div>
        </div>

        <div className="w-full mb-4 sm:mb-6">
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
            {/* Tabel Desktop */}
            <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-x-auto overflow-auto  ">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="w-[5%] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        No.
                      </TableHead>
                      <TableHead className="w-[40%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Nama
                      </TableHead>
                      <TableHead className="w-[25%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Gudang
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Dibuat
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Diperbarui
                      </TableHead>
                      <TableHead className="w-[130px] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
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
                            <div className="wrap-text" title={barang.name}>
                              {barang.name}
                            </div>
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
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(barang.updatedAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
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

            {/* Mobile View */}
            <div className="w-full space-y-3 sm:hidden">
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data barang yang ditemukan" />
                </div>
              ) : (
                products.map((barang) => (
                  <div
                    key={barang.id}
                    className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-full p-3">
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="max-w-[65%]">
                          <h3 className="text-sm font-medium text-blue-600 break-words">
                            {barang.name}
                          </h3>
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

                      <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
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

            {/* Pagination */}
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
