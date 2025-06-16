import { useDeleteDeliveryOrder, useDeliveryOrder } from '@/hooks/do';
import {
  Archive,
  ArrowLeft,
  Edit,
  FileText,
  History,
  Info,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PERMISSION } from '@/constant/PERMISSION';
import { useAuth } from '@/hooks/auth';
import { useRolePermissions } from '@/hooks/izin';
import { useShipmentsByDeliveryOrderId } from '@/hooks/pengiriman';
import { cn } from '@/lib/utils';
import { DeliveryOrderStatus } from '@/types/do';
import { ShipmentFromDO, ShipmentItemFromDO } from '@/types/pengiriman';
import { formatDate } from '@/utils/date';
import { formatNumber } from '@/utils/formatNumber';
import { hasPermission } from '@/utils/permission';
import { getRoleId } from '@/utils/storage';
import {
  isConfirmed,
  showConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from '@/utils/sweetAlert';
import { useEffect, useState } from 'react';

interface StatusBadgeProps {
  status: DeliveryOrderStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusColor = (status: DeliveryOrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PROSES':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn('font-medium px-2.5 py-0.5', getStatusColor(status))}
    >
      {status}
    </Badge>
  );
}

export default function DetailDo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || '';

  // Get tab from URL query parameter or default to "info"
  const getTabFromUrl = (): 'info' | 'items' | 'shipments' => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'items' || tab === 'shipments') {
      return tab;
    }
    return 'info';
  };

  const [activeTab, setActiveTab] = useState<'info' | 'items' | 'shipments'>(
    getTabFromUrl()
  );

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== '',
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

  const deliveryOrderId = id || '';

  const {
    data: deliveryOrder,
    isLoading,
    error,
    isError,
    refetch,
  } = useDeliveryOrder(
    { id: deliveryOrderId },
    {
      enabled: !!deliveryOrderId,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );

  const deleteDeliveryOrder = useDeleteDeliveryOrder({
    onSuccess: () => {
      showSuccessAlert('Berhasil!', 'Delivery Order berhasil diarsipkan').then(
        () => {
          navigate('/do');
        }
      );
    },
    onError: (error) => {
      showErrorAlert(
        'Gagal Mengarsipkan',
        `Gagal mengarsipkan delivery order: ${
          error.message || 'Terjadi kesalahan saat mengarsipkan delivery order.'
        }`
      );
    },
  });

  const handleDelete = (id: string) => {
    showConfirmationAlert(
      'Konfirmasi Arsip',
      'Apakah Anda yakin ingin mengarsipkan Delivery Order ini?',
      'Ya, Arsipkan!',
      'Batal'
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteDeliveryOrder.mutate({ id });
      }
    });
  };

  const handleTabChange = (tab: 'info' | 'items' | 'shipments') => {
    setActiveTab(tab);

    // Update URL with the active tab
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', tab);
    navigate(`${location.pathname}?${searchParams.toString()}`, {
      replace: true,
    });
  };

  // Effect to update tab when URL changes
  useEffect(() => {
    const currentTab = getTabFromUrl();
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Fetch shipments that use this DO
  const {
    data: shipments,
    isLoading: isLoadingShipments,
    error: shipmentsError,
    refetch: refetchShipments,
  } = useShipmentsByDeliveryOrderId(deliveryOrderId, {
    enabled: activeTab === 'shipments' && !!deliveryOrderId,
  });

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
                : 'Terjadi kesalahan pada server'
            }
            onRetry={refetch}
            retryButtonText="Coba lagi"
          />
        ) : !deliveryOrder ? (
          <div className="p-6 rounded-lg bg-red-50">
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
            <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-none">
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap',
                  activeTab === 'info'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
                onClick={() => handleTabChange('info')}
              >
                <Info className="flex-shrink-0 w-4 h-4 mr-2" />
                Informasi DO
              </button>
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap',
                  activeTab === 'items'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
                onClick={() => handleTabChange('items')}
              >
                <FileText className="flex-shrink-0 w-4 h-4 mr-2" />
                Daftar Barang
                {deliveryOrder.items.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {deliveryOrder.items.length}
                  </span>
                )}
              </button>
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap',
                  activeTab === 'shipments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
                onClick={() => handleTabChange('shipments')}
              >
                <Archive className="flex-shrink-0 w-4 h-4 mr-2" />
                Penggunaan di Pengiriman
                {shipments && shipments.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {shipments.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
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
                        <p className="text-sm text-gray-500">
                          Alamat Pengiriman
                        </p>
                        <p className="text-gray-700 whitespace-pre-wrap wrap-text">
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
                      <p className="text-gray-700 whitespace-pre-wrap wrap-text">
                        {deliveryOrder.internalNote}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Informasi Dokumen
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">No. DO</p>
                        <p className="p-1 font-mono text-sm font-medium text-gray-900 break-all rounded bg-gray-50">
                          {deliveryOrder.doNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <StatusBadge
                          status={deliveryOrder.status || 'PENDING'}
                        />
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

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Tindakan
                    </h3>
                    <div className="space-y-3">
                      <Link
                        to={`/do/${deliveryOrderId}/log`}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="justify-start w-full"
                        >
                          <History className="w-4 h-4 mr-2" />
                          Lihat Log Aktivitas
                        </Button>
                      </Link>
                      {hasDoUpdateAccess &&
                        deliveryOrder &&
                        !deliveryOrder.deletedAt && (
                          <Link
                            to={`/do/${deliveryOrderId}/edit`}
                            className="w-full"
                          >
                            <Button
                              variant="outline"
                              className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Delivery Order
                            </Button>
                          </Link>
                        )}
                      {hasDoDeleteAccess &&
                        deliveryOrder &&
                        !deliveryOrder.deletedAt && (
                          <Button
                            variant="outline"
                            className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(deliveryOrderId)}
                            disabled={deleteDeliveryOrder.isPending}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            {deleteDeliveryOrder.isPending
                              ? 'Mengarsipkan...'
                              : 'Arsipkan DO'}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Daftar Barang
                </h3>

                {/* Desktop view with table */}
                <div className="hidden sm:block">
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <div className="overflow-auto overflow-x-auto">
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
                              Kuantitas Dipesan
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                              <div className="inline-block ml-1">
                                <Badge
                                  variant="outline"
                                  className="font-medium px-2 py-0.5 bg-red-100 text-red-800 border-red-200"
                                >
                                  Kuantitas Pending
                                </Badge>
                              </div>
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                              <div className="inline-block ml-1">
                                <Badge
                                  variant="outline"
                                  className="font-medium px-2 py-0.5 bg-yellow-100 text-yellow-800 border-yellow-200"
                                >
                                  Kuantitas Diproses
                                </Badge>
                              </div>
                            </TableHead>
                            <TableHead className="px-4 py-3 text-sm font-semibold text-right text-gray-700">
                              <div className="inline-block ml-1">
                                <Badge
                                  variant="outline"
                                  className="font-medium px-2 py-0.5 bg-green-100 text-green-800 border-green-200"
                                >
                                  Kuantitas Completed
                                </Badge>
                              </div>
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
                                colSpan={7}
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
                                  <Link
                                    to={`/barang/${item.productId}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {' '}
                                    {item.product.name}
                                  </Link>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                                  {formatNumber(item.quantity)}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                                  {formatNumber(item.pendingQuantity)}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                                  {formatNumber(item.processingQuantity)}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm text-right text-gray-600">
                                  {formatNumber(item.completedQuantity)}
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

                {/* Mobile view with cards */}
                <div className="sm:hidden">
                  <div className="w-full space-y-3">
                    {deliveryOrder.items.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Tidak ada item dalam delivery order ini
                      </p>
                    ) : (
                      deliveryOrder.items.map((item, index) => (
                        <div
                          key={item.id}
                          className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                        >
                          <div className="w-full p-3">
                            <div className="flex items-start justify-between w-full mb-2">
                              <div className="max-w-[80%]">
                                <Link
                                  to={`/barang/${item.productId}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  <h3 className="text-sm font-medium text-blue-600 break-words">
                                    {item.product.name}
                                  </h3>
                                </Link>
                                <p className="mt-1 text-xs text-gray-600">
                                  <span className="font-medium">
                                    Kuantitas:
                                  </span>{' '}
                                  {formatNumber(item.quantity)}{' '}
                                  {item.product.satuan}
                                </p>
                              </div>
                              <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">
                                #{index + 1}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-3">
                              <div className="flex flex-col items-center p-2 border border-red-100 rounded-md bg-red-50">
                                <Badge
                                  variant="outline"
                                  className="mb-1 font-medium px-1.5 py-0.5 text-xs bg-red-100 text-red-800 border-red-200"
                                >
                                  Pending
                                </Badge>
                                <span className="text-sm font-medium text-red-800">
                                  {formatNumber(item.pendingQuantity)}
                                </span>
                              </div>
                              <div className="flex flex-col items-center p-2 border border-yellow-100 rounded-md bg-yellow-50">
                                <Badge
                                  variant="outline"
                                  className="mb-1 font-medium px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                                >
                                  Diproses
                                </Badge>
                                <span className="text-sm font-medium text-yellow-800">
                                  {formatNumber(item.processingQuantity)}
                                </span>
                              </div>
                              <div className="flex flex-col items-center p-2 border border-green-100 rounded-md bg-green-50">
                                <Badge
                                  variant="outline"
                                  className="mb-1 font-medium px-1.5 py-0.5 text-xs bg-green-100 text-green-800 border-green-200"
                                >
                                  Completed
                                </Badge>
                                <span className="text-sm font-medium text-green-800">
                                  {formatNumber(item.completedQuantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipments' && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="flex items-center mb-4 text-lg font-medium text-gray-900">
                  <Archive className="w-5 h-5 mr-2 text-blue-600" />
                  Penggunaan di Pengiriman
                </h3>
                {isLoadingShipments ? (
                  <LoadingState text="Memuat data pengiriman..." />
                ) : shipmentsError ? (
                  <ErrorState
                    title="Gagal Memuat Data Pengiriman"
                    message={
                      shipmentsError instanceof Error
                        ? shipmentsError.message
                        : 'Terjadi kesalahan pada server'
                    }
                    onRetry={refetchShipments}
                    retryButtonText="Coba lagi"
                  />
                ) : !shipments || shipments.length === 0 ? (
                  <div className="p-6 rounded-lg bg-yellow-50">
                    <div className="text-center">
                      <h2 className="mb-2 text-lg font-semibold text-yellow-700">
                        Tidak ada pengiriman yang menggunakan DO ini
                      </h2>
                      <p className="mb-4 text-yellow-600">
                        Belum ada pengiriman yang menggunakan item dari delivery
                        order ini.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 bg-gray-50">
                          <TableHead className="w-[50px] py-3 px-4 text-left font-semibold text-gray-700 text-sm">
                            No
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            No. Pengiriman
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Status
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Tanggal Dibuat
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Armada
                          </TableHead>
                          <TableHead className="px-4 py-3 text-sm font-semibold text-left text-gray-700">
                            Barang dari DO ini
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shipments.map(
                          (shipment: ShipmentFromDO, idx: number) => (
                            <TableRow key={shipment.id}>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="px-4 py-3 font-medium text-blue-600">
                                {shipment.shipmentNumber || '-'}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                {shipment.status}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(shipment.createdAt)}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                {shipment.armada?.model || '-'}
                              </TableCell>
                              <TableCell className="px-4 py-3 text-sm text-gray-600">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Nama Barang</TableHead>
                                      <TableHead>Kuantitas</TableHead>
                                      <TableHead>Satuan</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {shipment.shipmentItems.map(
                                      (item: ShipmentItemFromDO) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            {item.product.name}
                                          </TableCell>
                                          <TableCell>
                                            {formatNumber(
                                              item.requestedQuantity
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {item.product.satuan}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
