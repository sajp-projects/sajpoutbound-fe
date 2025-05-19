import { useDeliveryOrder, useDeleteDeliveryOrder } from "@/hooks/do";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import { ArrowLeft, Edit, Archive, History, FileText } from "lucide-react";

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
import { formatDate } from "@/utils/date";
import { formatNumber } from "@/utils/formatNumber";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { DeliveryOrderStatus } from "@/types/do";
import { PERMISSION } from "@/constant/PERMISSION";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";

interface StatusBadgeProps {
  status: DeliveryOrderStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: DeliveryOrderStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROSES":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SELESAI":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium px-2.5 py-0.5", getStatusColor(status))}
    >
      {status}
    </Badge>
  );
}

export default function DetailDo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  const hasDoDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.DO,
    PERMISSION.ACTIONS.DELETE
  );

  const deliveryOrderId = id || "";

  const {
    data: deliveryOrder,
    isLoading,
    error,
    isError,
  } = useDeliveryOrder(
    { id: deliveryOrderId },
    {
      enabled: !!deliveryOrderId,
      refetchOnWindowFocus: false,
    }
  );

  const deleteDeliveryOrder = useDeleteDeliveryOrder({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Delivery Order berhasil diarsipkan");
      navigate("/do");
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Mengarsipkan",
        `Gagal mengarsipkan delivery order: ${
          error.message || "Terjadi kesalahan saat mengarsipkan delivery order."
        }`
      );
    },
  });

  const handleDelete = (id: string) => {
    showConfirmationAlert(
      "Konfirmasi Arsip",
      "Apakah Anda yakin ingin mengarsipkan Delivery Order ini?",
      "Ya, Arsipkan!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteDeliveryOrder.mutate({ id });
      }
    });
  };

  return (
    <div className="w-full px-4 space-y-6 overflow-x-hidden sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/do">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Detail Delivery Order
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/do/${deliveryOrderId}/log`}>
            <Button variant="outline" className="flex items-center gap-1">
              <History className="w-4 h-4 mr-2" />
              Log Aktivitas
            </Button>
          </Link>
          {hasDoUpdateAccess && deliveryOrder && !deliveryOrder.deletedAt && (
            <Link to={`/do/${deliveryOrderId}/edit`}>
              <Button className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-amber-600 hover:bg-amber-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit DO
              </Button>
            </Link>
          )}
          {hasDoDeleteAccess && deliveryOrder && !deliveryOrder.deletedAt && (
            <Button
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              onClick={() => handleDelete(deliveryOrderId)}
              disabled={deleteDeliveryOrder.isPending}
            >
              <Archive className="w-4 h-4 mr-2" />
              {deleteDeliveryOrder.isPending ? "Mengarsipkan..." : "Arsipkan"}
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Delivery Order
            </h2>
            <p className="text-sm text-gray-500">
              Detail lengkap informasi delivery order
            </p>
          </div>
          {deliveryOrder?.status && (
            <StatusBadge status={deliveryOrder.status} />
          )}
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data delivery order..." />
        ) : isError ? (
          <ErrorState
            title="Gagal Memuat Data Delivery Order"
            message={
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan pada server"
            }
            onRetry={() => navigate("/do")}
            retryButtonText="Kembali ke Daftar DO"
          />
        ) : !deliveryOrder ? (
          <div className="p-8 rounded-lg bg-red-50">
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold text-red-700">
                Delivery Order tidak ditemukan
              </h2>
              <p className="mb-4 text-red-600">
                Data delivery order dengan ID yang diberikan tidak ditemukan
                atau telah dihapus.
              </p>
              <Link to="/do">
                <Button>Kembali ke Daftar DO</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Informasi Pelanggan
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nama Pelanggan</p>
                      <Link
                        to={`/pelanggan/${deliveryOrder.customer.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {deliveryOrder.customer.name}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID Pelanggan</p>
                      <p className="font-mono text-sm text-gray-700">
                        {deliveryOrder.customer.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Alamat Pengiriman</p>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {deliveryOrder.address}
                      </p>
                    </div>
                  </div>
                </div>

                {deliveryOrder.internalNote && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Catatan Internal
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {deliveryOrder.internalNote}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Informasi Dokumen
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Dokumen</p>
                      <p className="p-1 font-mono text-sm font-medium text-gray-900 rounded bg-gray-50 wrap-text">
                        {deliveryOrder.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <StatusBadge status={deliveryOrder.status || "PENDING"} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(deliveryOrder.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diperbarui
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(deliveryOrder.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Daftar Barang
              </h3>

              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                        No
                      </TableHead>
                      <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                        Nama Barang
                      </TableHead>
                      <TableHead className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                        Kuantitas
                      </TableHead>
                      <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                        Satuan
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryOrder.items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="px-4 py-6 text-sm text-center text-gray-500"
                        >
                          Tidak ada item dalam delivery order ini
                        </TableCell>
                      </TableRow>
                    ) : (
                      deliveryOrder.items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {index + 1}
                          </TableCell>
                          <TableCell className="px-4 py-3 font-medium text-blue-600">
                            {item.product.name} ({formatNumber(item.quantity)}{" "}
                            {item.product.satuan})
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                            {formatNumber(item.quantity)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600">
                            {item.product.satuan}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
