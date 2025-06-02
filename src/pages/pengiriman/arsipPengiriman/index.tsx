import { useArchivedShipments, useRestoreShipment } from "@/hooks/pengiriman";
import { Eye, RefreshCw } from "lucide-react";
import { Link } from "react-router";

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
import { Shipment, ShipmentStatus, ShipmentType } from "@/types/pengiriman";
import { formatDate, formatDateShort } from "@/utils/date";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { PERMISSION } from "@/constant/PERMISSION";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import { Pagination } from "@/components/Pagination";
import { useSearchParams } from "react-router";

export default function ArsipPengiriman() {
  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const hasPengirimanUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.PENGIRIMAN,
    PERMISSION.ACTIONS.UPDATE
  );

  const {
    data = {
      shipments: [],
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
  } = useArchivedShipments({
    staleTime: 5000,
    refetchOnMount: "always",
  });

  const archivedShipments = data.shipments;
  const pagination = data.pagination;

  const restoreShipment = useRestoreShipment({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengiriman berhasil dipulihkan");
      refetch();
    },
    onError: (error: Error) => {
      showErrorAlert(
        "Gagal!",
        `Gagal memulihkan pengiriman: ${
          error.message || "Terjadi kesalahan saat memulihkan pengiriman."
        }`
      );
    },
  });

  const handleRestore = (id: string) => {
    showConfirmationAlert(
      "Konfirmasi Pemulihan",
      "Apakah Anda yakin ingin memulihkan pengiriman ini?",
      "Ya, Pulihkan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        restoreShipment.mutate({ id });
      }
    });
  };

  const getStatusBadgeClass = (status: ShipmentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "PROSES":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "SELESAI":
        return "bg-green-50 text-green-600 border-green-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getTypeLabel = (type: ShipmentType) => {
    return type === "ANTAR" ? "Antar" : "Jemput";
  };

  const renderTable = () => (
    <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50">
              <TableHead className="w-[50px] font-semibold text-gray-700 py-4">
                No
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                ID
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Plat Nomor
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Tipe
              </TableHead>
              <TableHead className="py-4 font-semibold text-gray-700">
                Status
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
            {archivedShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <EmptyState
                    title="Tidak ada data pengiriman terarsip yang ditemukan."
                    message=""
                  />
                </TableCell>
              </TableRow>
            ) : (
              archivedShipments.map((shipment: Shipment, idx: number) => (
                <TableRow
                  key={shipment.id}
                  className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}
                >
                  <TableCell className="font-medium text-center">
                    {idx + 1 + (pagination.page - 1) * pagination.limit}
                  </TableCell>
                  <TableCell className="font-medium text-gray-600">
                    {shipment.id}
                  </TableCell>
                  <TableCell className="text-gray-600">
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
                  <TableCell className="text-gray-600">
                    {getTypeLabel(shipment.type)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 rounded-md font-medium text-xs",
                        getStatusBadgeClass(shipment.status)
                      )}
                    >
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-gray-500 md:table-cell">
                    {formatDate(shipment.createdAt)}
                  </TableCell>
                  <TableCell className="hidden text-gray-500 md:table-cell">
                    {shipment.deletedAt ? formatDate(shipment.deletedAt) : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Link to={`/pengiriman/${shipment.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {hasPengirimanUpdateAccess && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="w-8 h-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Pulihkan"
                          onClick={() => handleRestore(shipment.id)}
                          disabled={
                            restoreShipment.isPending &&
                            restoreShipment.variables?.id === shipment.id
                          }
                        >
                          {restoreShipment.isPending &&
                          restoreShipment.variables?.id === shipment.id ? (
                            <div className="w-4 h-4 border-2 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="w-full space-y-4 sm:hidden">
      {archivedShipments.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full p-8 bg-white border border-gray-200 rounded-lg">
          <EmptyState
            title="Tidak ada data pengiriman terarsip yang ditemukan."
            message=""
          />
        </div>
      ) : (
        archivedShipments.map((shipment: Shipment) => (
          <div
            key={shipment.id}
            className="w-full bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="max-w-[60%]">
                  <h3 className="font-medium text-gray-600 truncate">
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
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    ID: {shipment.id}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-2 py-0.5 rounded-md font-medium text-xs",
                      getStatusBadgeClass(shipment.status)
                    )}
                  >
                    {shipment.status}
                  </Badge>
                  <span className="mt-1 text-xs text-gray-500">
                    {getTypeLabel(shipment.type)}
                  </span>
                </div>
              </div>

              <div className="mb-3 space-y-1 text-xs text-gray-500">
                <p>
                  Dibuat:{" "}
                  <span className="font-medium">
                    {formatDateShort(shipment.createdAt)}
                  </span>
                </p>
                <p>
                  Diarsipkan:{" "}
                  <span className="font-medium">
                    {shipment.deletedAt
                      ? formatDateShort(shipment.deletedAt)
                      : "-"}
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
                <Link to={`/pengiriman/${shipment.id}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-0 text-blue-600 w-9 h-9 hover:text-blue-700 hover:bg-blue-50"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
                {hasPengirimanUpdateAccess && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="p-0 text-blue-600 w-9 h-9 hover:text-blue-700 hover:bg-blue-50"
                    title="Pulihkan"
                    onClick={() => handleRestore(shipment.id)}
                    disabled={
                      restoreShipment.isPending &&
                      restoreShipment.variables?.id === shipment.id
                    }
                  >
                    {restoreShipment.isPending &&
                    restoreShipment.variables?.id === shipment.id ? (
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
          <h1 className="text-2xl font-bold text-gray-900">Arsip Pengiriman</h1>
        </div>
      </div>

      <div className="w-full p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pengiriman Terarsip
            </h2>
            <p className="text-sm text-gray-500">
              Daftar pengiriman yang telah diarsipkan dari sistem
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pengiriman terarsip..." />
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
