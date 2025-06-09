import { useDeleteShipment, useShipmentsWithParams } from "@/hooks/pengiriman";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { SHIPMENT_STATUS, SHIPMENT_TYPE } from "@/utils/constants";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { cn } from "@/lib/utils";
import { Shipment } from "@/types/pengiriman";
import { formatDate, formatDateShort } from "@/utils/date";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  getShipmentStatusBadgeClass,
  getShipmentTypeLabel,
} from "@/utils/badges";
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

export default function DaftarPengiriman() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");
  const statusFilter = searchParams.get("status") || "";
  const typeFilter = searchParams.get("type") || "";
  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading, isError, refetch } = useShipmentsWithParams(
    {
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      status: statusFilter,
      type: typeFilter,
    },
    {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  );

  const shipments = data?.shipments || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const deleteShipment = useDeleteShipment({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengiriman berhasil diarsipkan");
      refetch();
    },
    onError: (error: Error) => {
      showErrorAlert(
        "Gagal Mengarsipkan Pengiriman",
        error.message || "Terjadi kesalahan saat mengarsipkan pengiriman."
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
      "Apakah Anda yakin ingin mengarsipkan Pengiriman ini? Tindakan ini tidak dapat dibatalkan.",
      "Ya, Arsipkan!",
      "Batal"
    );

    if (isConfirmed(result)) {
      deleteShipment.mutate({ id });
    }
  };

  const hasPengirimanCreateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.CREATE
  );

  const hasPengirimanUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasPengirimanDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.DELETE
  );

  const getShipmentActions = (shipment: Shipment) => {
    const actions: ActionConfig[] = [{ type: ActionType.VIEW }];

    if (hasPengirimanUpdateAccess) {
      actions.push({ type: ActionType.EDIT });
    }

    actions.push({ type: ActionType.LOG });

    if (hasPengirimanDeleteAccess) {
      actions.push({
        type: ActionType.ARCHIVE,
        onClick: () => handleArsipkan(shipment.id),
        isLoading:
          deleteShipment.isPending &&
          deleteShipment.variables?.id === shipment.id,
        disabled: deleteShipment.isPending,
      });
    }

    return actions;
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
          Daftar Pengiriman
        </h1>
        {hasPengirimanCreateAccess && (
          <Link to="/pengiriman/tambah">
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
              Pengiriman
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Manajemen data pengiriman
            </p>
          </div>
          <div className="flex flex-wrap items-center w-full gap-2 sm:gap-3 sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3 h-3 sm:h-4 sm:w-4" />}
              className="w-full sm:w-auto"
            >
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-col w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <SearchInput placeholder="Cari pengiriman..." className="w-full" />
          </div>

          <div className="flex flex-wrap items-center gap-2 ml-auto sm:flex-nowrap">
            <Select
              value={statusFilter}
              onValueChange={(value) => handleFilter("status", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value={SHIPMENT_STATUS.PENDING}>Pending</SelectItem>
                <SelectItem value={SHIPMENT_STATUS.PROSES}>Proses</SelectItem>
                <SelectItem value={SHIPMENT_STATUS.COMPLETED}>
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(value) => handleFilter("type", value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value={SHIPMENT_TYPE.ANTAR}>Antar</SelectItem>
                <SelectItem value={SHIPMENT_TYPE.JEMPUT}>Jemput</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pengiriman..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data pengiriman"
            message="Terjadi kesalahan pada server"
            onRetry={() => refetch()}
          />
        ) : (
          <div className="w-full">
            <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="w-[5%] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        No.
                      </TableHead>
                      <TableHead className="w-[25%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        ID
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Plat Nomor
                      </TableHead>
                      <TableHead className="w-[10%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Tipe
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
                    {shipments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <EmptyState title="Tidak ada data pengiriman yang ditemukan" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      shipments.map((shipment, idx) => (
                        <TableRow
                          key={shipment.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <TableCell className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                            <div className="wrap-text" title={shipment.id}>
                              {shipment.id}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                            {shipment.type === "ANTAR" ? (
                              <Link
                                to={`/armada/${shipment.armadaId}`}
                                className="text-blue-600 hover:underline"
                              >
                                {shipment.armada?.plateNumber}
                              </Link>
                            ) : (
                              shipment.plateNumber
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                            {getShipmentTypeLabel(shipment.type)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-2 py-0.5 rounded-md font-medium text-xs",
                                getShipmentStatusBadgeClass(shipment.status)
                              )}
                            >
                              {shipment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm">
                            {formatDate(shipment.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
                              <ActionButtons
                                actions={getShipmentActions(shipment)}
                                entityId={shipment.id}
                                basePath="/pengiriman"
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
              {shipments.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data pengiriman yang ditemukan" />
                </div>
              ) : (
                shipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-full p-4">
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="max-w-[65%]">
                          <div className="mb-2">
                            <div className="text-sm font-medium text-gray-600 break-words">
                              {shipment.type === "ANTAR" ? (
                                <Link
                                  to={`/armada/${shipment.armadaId}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {shipment.armada?.plateNumber}
                                </Link>
                              ) : (
                                shipment.plateNumber
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-600 break-all">
                              ID: {shipment.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "px-2 py-0.5 rounded-md font-medium text-xs",
                              getShipmentStatusBadgeClass(shipment.status)
                            )}
                          >
                            {shipment.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {getShipmentTypeLabel(shipment.type)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(shipment.createdAt)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t">
                        <ActionButtons
                          actions={getShipmentActions(shipment)}
                          entityId={shipment.id}
                          basePath="/pengiriman"
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
