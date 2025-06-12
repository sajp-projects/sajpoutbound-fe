import { useDeleteDeliveryOrder, useDeliveryOrders } from "@/hooks/do";
import { Download, Filter, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
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
import { useRolePermissions } from "@/hooks/izin";
import { cn } from "@/lib/utils";
import { DeliveryOrder, DeliveryOrderStatus } from "@/types/do";
import { formatDate, formatDateShort } from "@/utils/date";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";

// Definisikan konstanta untuk status DO
const DO_STATUS = {
  PENDING: "PENDING",
  PROSES: "PROSES",
  COMPLETED: "COMPLETED",
  SELESAI: "SELESAI",
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");
  const statusFilter = searchParams.get("status") || "";
  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading, isError, refetch } = useDeliveryOrders({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    searchQuery: searchQuery,
    statusFilter: statusFilter,
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

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");

    setSearchParams(params);
  };

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

  const getStatusBadgeClass = (status: DeliveryOrderStatus | undefined) => {
    switch (status || "PENDING") {
      case "PENDING":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "PROSES":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "SELESAI":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusFilterLabel = () => {
    switch (statusFilter) {
      case DO_STATUS.PENDING:
        return "Pending";
      case DO_STATUS.PROSES:
        return "Proses";
      case DO_STATUS.COMPLETED:
        return "Selesai";
      case DO_STATUS.SELESAI:
        return "Selesai";
      default:
        return "Status";
    }
  };

  // Tidak perlu filter manual karena sudah difilter di backend
  const filteredDeliveryOrders = deliveryOrders;

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
          Daftar Delivery Order
        </h1>
        {hasDoCreateAccess && (
          <Link to="/do/tambah">
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
              Delivery Order
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Manajemen data delivery order
            </p>
          </div>
          <div className="flex flex-wrap items-center w-full gap-2 sm:gap-3 sm:w-auto">
            <div className="w-[160px] sm:w-[190px]">
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) => handleFilter("status", value)}
              >
                <SelectTrigger className="flex items-center w-full text-xs text-gray-700 bg-white border-gray-300 h-9 hover:bg-gray-50 sm:text-sm">
                  <div className="flex items-center">
                    <Filter className="w-3 h-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="truncate">{getStatusFilterLabel()}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] bg-white border border-gray-300 rounded-md overflow-auto">
                  <SelectItem
                    value="all"
                    className={cn(!statusFilter && "font-medium text-blue-600")}
                  >
                    Semua Status
                  </SelectItem>
                  <SelectItem
                    value={DO_STATUS.PENDING}
                    className={cn(
                      statusFilter === DO_STATUS.PENDING &&
                        "font-medium text-blue-600"
                    )}
                  >
                    Pending
                  </SelectItem>
                  <SelectItem
                    value={DO_STATUS.PROSES}
                    className={cn(
                      statusFilter === DO_STATUS.PROSES &&
                        "font-medium text-blue-600"
                    )}
                  >
                    Proses
                  </SelectItem>
                  <SelectItem
                    value={DO_STATUS.SELESAI}
                    className={cn(
                      statusFilter === DO_STATUS.SELESAI &&
                        "font-medium text-blue-600"
                    )}
                  >
                    Selesai
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-auto overflow-x-auto ">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="w-[5%] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        No.
                      </TableHead>
                      <TableHead className="w-[18%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        ID
                      </TableHead>
                      <TableHead className="w-[25%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Pelanggan
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Status
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Tgl. Dibuat
                      </TableHead>
                      <TableHead className="w-[130px] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveryOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <EmptyState title="Tidak ada data delivery order yang ditemukan" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDeliveryOrders.map((deliveryOrder, idx) => (
                        <TableRow
                          key={deliveryOrder.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <TableCell className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                            <div className="wrap-text" title={deliveryOrder.id}>
                              {deliveryOrder.id}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 font-medium text-sm">
                            <Link
                              to={`/pelanggan/${deliveryOrder.customer.id}`}
                              className="text-blue-600 hover:underline wrap-text"
                              title={deliveryOrder.customer.name}
                            >
                              {deliveryOrder.customer.name}
                            </Link>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-2 py-0.5 rounded-md font-medium text-xs",
                                getStatusBadgeClass(deliveryOrder.status)
                              )}
                            >
                              {deliveryOrder.status || "PENDING"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm">
                            {formatDate(deliveryOrder.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
                              <ActionButtons
                                actions={getDeliveryOrderActions(deliveryOrder)}
                                entityId={deliveryOrder.id}
                                basePath="/do"
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

            <div className="w-full space-y-3 sm:hidden">
              {filteredDeliveryOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data delivery order yang ditemukan" />
                </div>
              ) : (
                filteredDeliveryOrders.map((deliveryOrder) => (
                  <div
                    key={deliveryOrder.id}
                    className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-full p-4">
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="max-w-[65%]">
                          <Link
                            to={`/pelanggan/${deliveryOrder.customer.id}`}
                            className="text-sm font-medium text-blue-600 break-words hover:underline"
                          >
                            {deliveryOrder.customer.name}
                          </Link>
                          <p className="mt-1 text-xs text-gray-600 break-all">
                            ID: {deliveryOrder.id}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2 py-0.5 rounded-md font-medium text-xs",
                            getStatusBadgeClass(deliveryOrder.status)
                          )}
                        >
                          {deliveryOrder.status || "PENDING"}
                        </Badge>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(deliveryOrder.createdAt)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t">
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
