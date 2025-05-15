import { useDeliveryOrder, useDeleteDeliveryOrder } from "@/hooks/do";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Archive,
  Clock,
  FileText,
  Package,
  MapPin,
  MessageSquare,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import { LoadingState } from "@/components/LoadingState";
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
      {status === "PENDING"
        ? "Tertunda"
        : status === "PROSES"
        ? "Diproses"
        : status === "SELESAI"
        ? "Selesai"
        : status}
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

  const { data: deliveryOrder, isLoading } = useDeliveryOrder(
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

  if (isLoading) {
    return <LoadingState text="Memuat data delivery order..." />;
  }

  if (!deliveryOrder) {
    return (
      <div className="p-8 rounded-lg bg-red-50">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-700">
            Delivery Order tidak ditemukan
          </h2>
          <p className="mb-4 text-red-600">
            Data delivery order dengan ID yang diberikan tidak ditemukan atau
            telah dihapus.
          </p>
          <Link to="/do">
            <Button>Kembali ke Daftar DO</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 sm:px-0">
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
          {hasDoUpdateAccess && (
            <Link to={`/do/edit/${deliveryOrder.id}`}>
              <Button className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit DO
              </Button>
            </Link>
          )}
          {hasDoDeleteAccess && !deliveryOrder.deletedAt && (
            <Button
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              onClick={() => handleDelete(deliveryOrder.id)}
              disabled={deleteDeliveryOrder.isPending}
            >
              <Archive className="w-4 h-4 mr-2" />
              {deleteDeliveryOrder.isPending ? "Mengarsipkan..." : "Arsipkan"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Informasi Delivery Order
              </CardTitle>
              <CardDescription>
                Detail lengkap delivery order untuk{" "}
                {deliveryOrder.customer.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-end gap-2 mb-6 sm:flex-row sm:justify-end">
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="text-sm">
                    {formatDate(deliveryOrder.createdAt)}
                  </span>
                </div>
                {deliveryOrder.status && (
                  <StatusBadge status={deliveryOrder.status} />
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                    <Package className="w-5 h-5 mr-2 text-blue-600" />
                    Informasi Pelanggan
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nama Pelanggan</p>
                      <p className="font-medium text-blue-600">
                        {deliveryOrder.customer.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Alamat Pelanggan</p>
                      <p className="text-gray-700">
                        {deliveryOrder.customer.address ||
                          "Alamat tidak tersedia"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID Pelanggan</p>
                      <p className="text-gray-700">
                        {deliveryOrder.customer.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Alamat Pengiriman
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {deliveryOrder.address}
                  </p>
                </div>
              </div>

              <div className="p-4 mt-6 border border-gray-200 rounded-lg">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  Catatan Internal
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {deliveryOrder.internalNote || "Tidak ada catatan internal"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Daftar Barang
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {deliveryOrder.items.length} item
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                        No
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                        Nama Barang
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-gray-700 uppercase">
                        Kuantitas
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
                        Satuan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveryOrder.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-blue-600 whitespace-nowrap">
                          {item.product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-600 whitespace-nowrap">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {item.product.satuan}
                        </td>
                      </tr>
                    ))}
                    {deliveryOrder.items.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-sm text-center text-gray-500"
                        >
                          Tidak ada item dalam delivery order ini
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Informasi DO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    ID Dokumen
                  </p>
                  <p className="text-gray-700">{deliveryOrder.id}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tanggal Dibuat
                  </p>
                  <p className="text-gray-700">
                    {formatDate(deliveryOrder.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tanggal Diperbarui
                  </p>
                  <p className="text-gray-700">
                    {formatDate(deliveryOrder.updatedAt)}
                  </p>
                </div>

                {deliveryOrder.status && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={deliveryOrder.status} />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Tindakan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to={`/do/log/${deliveryOrder.id}`} className="w-full">
                  <Button variant="outline" className="justify-start w-full">
                    <Clock className="w-4 h-4 mr-2" />
                    Lihat Log Aktivitas
                  </Button>
                </Link>
                {hasDoUpdateAccess && (
                  <Link to={`/do/edit/${deliveryOrder.id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="justify-start w-full text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Delivery Order
                    </Button>
                  </Link>
                )}
                {hasDoDeleteAccess && !deliveryOrder.deletedAt && (
                  <Button
                    variant="outline"
                    className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(deliveryOrder.id)}
                    disabled={deleteDeliveryOrder.isPending}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    {deleteDeliveryOrder.isPending
                      ? "Mengarsipkan..."
                      : "Arsipkan DO"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
