import { useArchivedDeliveryOrders, useRestoreDeliveryOrder } from "@/hooks/do";
import { Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router";

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
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/permission";
import { cn } from "@/lib/utils";
import { DeliveryOrder } from "@/types/do";
import { formatDate, formatDateShort } from "@/utils/date";
import { formatNumber } from "@/utils/formatNumber";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { useSearchParams } from "react-router";

export default function ArsipDo() {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const hasDoUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.DO,
    PERMISSION.ACTIONS.UPDATE
  );

  const {
    data = {
      deliveryOrders: [],
      pagination: {
        total: 0,
        page: currentPage,
        limit: itemsPerPage,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    isLoading,
    refetch,
  } = useArchivedDeliveryOrders({
    staleTime: 5000,
    refetchOnMount: "always",
  });

  const archivedDeliveryOrders = data.deliveryOrders;
  const pagination = data.pagination;

  const restoreDeliveryOrder = useRestoreDeliveryOrder({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Delivery Order berhasil dipulihkan");
      refetch();
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal!",
        `Gagal memulihkan delivery order: ${
          error.message || "Terjadi kesalahan saat memulihkan delivery order."
        }`
      );
    },
  });

  const handleRestore = (id: string) => {
    showConfirmationAlert(
      "Konfirmasi Pemulihan",
      "Apakah Anda yakin ingin memulihkan delivery order ini?",
      "Ya, Pulihkan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        restoreDeliveryOrder.mutate({ id });
      }
    });
  };

  const renderTable = () => (
    <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
      <div className="overflow-x-auto overflow-auto  ">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50">
              <TableHead className="w-[50px] font-semibold text-gray-700 py-4">
                No
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                No. DO
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Pelanggan
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Alamat
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Items
              </TableHead>
              <TableHead className="hidden py-4 font-semibold text-gray-700 md:table-cell">
                Tgl. Dibuat
              </TableHead>
              <TableHead className="hidden py-4 font-semibold text-gray-700 md:table-cell">
                Tgl. Diarsipkan
              </TableHead>
              <TableHead className="py-4 font-semibold text-center text-gray-700">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {archivedDeliveryOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <EmptyState
                    title="Tidak ada data delivery order terarsip yang ditemukan."
                    message=""
                  />
                </TableCell>
              </TableRow>
            ) : (
              archivedDeliveryOrders.map(
                (deliveryOrder: DeliveryOrder, idx: number) => (
                  <TableRow
                    key={deliveryOrder.id}
                    className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}
                  >
                    <TableCell className="font-medium text-center">
                      {idx + 1 + (pagination.page - 1) * pagination.limit}
                    </TableCell>
                    <TableCell className="font-medium text-gray-600">
                      {deliveryOrder.doNumber}
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {deliveryOrder.customer.name}
                    </TableCell>
                    <TableCell className="truncate max-w-[150px] sm:max-w-none">
                      {deliveryOrder.address}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {deliveryOrder.items.map((item) => (
                          <Badge
                            key={item.id}
                            variant="outline"
                            className={cn(
                              "px-2 py-0.5 rounded-md font-medium text-xs",
                              "bg-blue-50 text-blue-600 border-blue-200"
                            )}
                          >
                            {item.product.name} ({formatNumber(item.quantity)}{" "}
                            {item.product.satuan})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-gray-500 md:table-cell">
                      {formatDate(deliveryOrder.createdAt)}
                    </TableCell>
                    <TableCell className="hidden text-gray-500 md:table-cell">
                      {deliveryOrder.deletedAt
                        ? formatDate(deliveryOrder.deletedAt)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link to={`/do/${deliveryOrder.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {hasDoUpdateAccess && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Pulihkan"
                            onClick={() => handleRestore(deliveryOrder.id)}
                            disabled={
                              restoreDeliveryOrder.isPending &&
                              restoreDeliveryOrder.variables?.id ===
                                deliveryOrder.id
                            }
                          >
                            {restoreDeliveryOrder.isPending &&
                            restoreDeliveryOrder.variables?.id ===
                              deliveryOrder.id ? (
                              <div className="w-4 h-4 border-2 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="w-full space-y-4 sm:hidden">
      {archivedDeliveryOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full p-8 bg-white border border-gray-200 rounded-lg">
          <EmptyState
            title="Tidak ada data delivery order terarsip yang ditemukan."
            message=""
          />
        </div>
      ) : (
        archivedDeliveryOrders.map((deliveryOrder: DeliveryOrder) => (
          <div
            key={deliveryOrder.id}
            className="w-full bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="max-w-[60%]">
                  <h3 className="font-medium text-blue-600 truncate">
                    {deliveryOrder.customer.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {deliveryOrder.address}
                  </p>
                  <p className="text-xs text-gray-500">
                    DO: {deliveryOrder.doNumber}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {deliveryOrder.items.map((item) => (
                    <Badge
                      key={item.id}
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 rounded-md font-medium text-xs",
                        "bg-blue-50 text-blue-600 border-blue-200"
                      )}
                    >
                      {item.product.name} ({formatNumber(item.quantity)}{" "}
                      {item.product.satuan})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mb-3 space-y-1 text-xs text-gray-500">
                <p>
                  Dibuat:{" "}
                  <span className="font-medium">
                    {formatDateShort(deliveryOrder.createdAt)}
                  </span>
                </p>
                <p>
                  Diarsipkan:{" "}
                  <span className="font-medium">
                    {deliveryOrder.deletedAt
                      ? formatDateShort(deliveryOrder.deletedAt)
                      : "-"}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
                <Link to={`/do/${deliveryOrder.id}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-0 text-blue-600 w-9 h-9 hover:text-blue-700 hover:bg-blue-50"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                {hasDoUpdateAccess && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-0 text-blue-600 w-9 h-9 hover:text-blue-700 hover:bg-blue-50"
                    title="Pulihkan"
                    onClick={() => handleRestore(deliveryOrder.id)}
                    disabled={
                      restoreDeliveryOrder.isPending &&
                      restoreDeliveryOrder.variables?.id === deliveryOrder.id
                    }
                  >
                    {restoreDeliveryOrder.isPending &&
                    restoreDeliveryOrder.variables?.id === deliveryOrder.id ? (
                      <div className="w-4 h-4 border-2 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="w-full px-4 space-y-6 overflow-x-hidden sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Arsip Delivery Order
          </h1>
        </div>
      </div>

      <div className="w-full p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Delivery Order Terarsip
            </h2>
            <p className="text-sm text-gray-500">
              Daftar delivery order yang telah diarsipkan dari sistem
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data delivery order terarsip..." />
        ) : (
          <div className="w-full">
            {renderTable()}
            {renderCards()}

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
