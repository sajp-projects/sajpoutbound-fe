import { useDeleteDeliveryOrder, useDeliveryOrders } from "@/hooks/do";
import { Download, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { cn } from "@/lib/utils";
import { DeliveryOrder } from "@/types/do";
import { formatDate, formatDateShort } from "@/utils/date";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";

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

export default function DaftarDo() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { data, isLoading, isError, refetch } = useDeliveryOrders({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const deliveryOrders = data?.deliveryOrders || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const deleteDeliveryOrder = useDeleteDeliveryOrder({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Delivery Order berhasil diarsipkan");
      refetch();
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Mengarsipkan Delivery Order",
        error.message || "Terjadi kesalahan saat mengarsipkan delivery order."
      );
    },
  });

  const handleArsipkan = async (id: string) => {
    const result = await showConfirmationAlert(
      "Konfirmasi Arsip",
      "Apakah Anda yakin ingin mengarsipkan Delivery Order ini? Tindakan ini tidak dapat dibatalkan.",
      "Ya, Arsipkan!",
      "Batal"
    );

    if (isConfirmed(result)) {
      deleteDeliveryOrder.mutate({ id });
    }
  };

  const hasDoCreateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.DO,
    PERMISSION.ACTIONS.CREATE
  );

  const hasDoUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.DO,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasDoDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.DO,
    PERMISSION.ACTIONS.DELETE
  );

  const getDeliveryOrderActions = (deliveryOrder: DeliveryOrder) => {
    const actions: ActionConfig[] = [{ type: ActionType.VIEW }];

    if (hasDoUpdateAccess) {
      actions.push({ type: ActionType.EDIT });
    }

    actions.push({ type: ActionType.LOG });

    if (hasDoDeleteAccess) {
      actions.push({
        type: ActionType.ARCHIVE,
        onClick: () => handleArsipkan(deliveryOrder.id),
        isLoading:
          deleteDeliveryOrder.isPending &&
          deleteDeliveryOrder.variables?.id === deliveryOrder.id,
        disabled: deleteDeliveryOrder.isPending,
      });
    }

    return actions;
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-col items-start justify-between w-full gap-2 sm:flex-row sm:items-center sm:gap-3">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Daftar Delivery Order
        </h1>
        {hasDoCreateAccess && (
          <Link to="/do/tambah">
            <Button
              leftIcon={<Plus className="w-4 h-4" />}
              size="sm"
              className="w-full sm:w-auto"
            >
              Tambah DO
            </Button>
          </Link>
        )}
      </div>

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Delivery Order
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Manajemen data delivery order
            </p>
          </div>
          <div className="flex flex-wrap items-center w-full gap-2 sm:gap-3 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3 h-3 sm:h-4 sm:w-4" />}
            >
              Export
            </Button>
          </div>
        </div>

        <div className="w-full mb-4 sm:mb-6">
          <SearchInput
            placeholder="Cari delivery order..."
            className="w-full sm:max-w-md"
          />
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data delivery order..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data delivery order"
            message="Terjadi kesalahan pada server"
            onRetry={() => refetch()}
          />
        ) : (
          <div className="w-full">
            {}
            <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="w-full min-w-[650px] border-collapse">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="w-[60px] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        No.
                      </th>
                      <th className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Pelanggan
                      </th>
                      <th className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Alamat
                      </th>
                      <th className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Item
                      </th>
                      <th className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Dibuat
                      </th>
                      <th className="w-[130px] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center">
                          <EmptyState title="Tidak ada data delivery order yang ditemukan" />
                        </td>
                      </tr>
                    ) : (
                      deliveryOrders.map((deliveryOrder, idx) => (
                        <tr
                          key={deliveryOrder.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <td className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                            <div
                              className="wrap-text"
                              title={deliveryOrder.customer.name}
                            >
                              {deliveryOrder.customer.name}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 text-sm">
                            <div
                              className="wrap-text"
                              title={deliveryOrder.address}
                            >
                              {deliveryOrder.address}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 text-sm">
                            <div className="wrap-text">
                              {deliveryOrder.items.map((item) => (
                                <Badge
                                  key={item.id}
                                  variant="outline"
                                  className={cn(
                                    "px-2 py-0.5 mr-1 mb-1 rounded-md font-medium text-xs",
                                    "bg-blue-50 text-blue-600 border-blue-200"
                                  )}
                                >
                                  {item.product.name} ({item.quantity}{" "}
                                  {item.product.satuan})
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(deliveryOrder.createdAt)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
                              <ActionButtons
                                actions={getDeliveryOrderActions(deliveryOrder)}
                                entityId={deliveryOrder.id}
                                basePath="/do"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {}
            <div className="w-full space-y-3 sm:hidden">
              {deliveryOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data delivery order yang ditemukan" />
                </div>
              ) : (
                deliveryOrders.map((deliveryOrder) => (
                  <div
                    key={deliveryOrder.id}
                    className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-full p-3">
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="max-w-[65%]">
                          <h3 className="text-sm font-medium text-blue-600 break-words">
                            {deliveryOrder.customer.name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-600 break-all">
                            {deliveryOrder.address}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex flex-wrap mb-2 gap-1">
                          {deliveryOrder.items.map((item) => (
                            <Badge
                              key={item.id}
                              variant="outline"
                              className={cn(
                                "px-2 py-0.5 rounded-md font-medium text-xs",
                                "bg-blue-50 text-blue-600 border-blue-200"
                              )}
                            >
                              {item.product.name} ({item.quantity}{" "}
                              {item.product.satuan})
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(deliveryOrder.createdAt)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
                        <ActionButtons
                          actions={getDeliveryOrderActions(deliveryOrder)}
                          entityId={deliveryOrder.id}
                          basePath="/do"
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
