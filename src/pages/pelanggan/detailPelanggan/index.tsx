import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { useDeleteCustomer, useCustomer } from "@/hooks/pelanggan";
import { formatDate, formatDateShort } from "@/utils/date";
import {
  showSuccessAlert,
  showErrorAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { ArrowLeft, History, Edit, Trash2, Info, FileText } from "lucide-react";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { PERMISSION } from "@/constant/PERMISSION";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Definisi tipe untuk items DO
interface DeliveryOrderItem {
  id: string;
  deliveryOrderId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    satuan: string;
  };
}

// Definisi tipe untuk Delivery Order
interface DeliveryOrder {
  id: string;
  customerId: string;
  address: string;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  items: DeliveryOrderItem[];
}

// Update tipe Customer dengan properti deliveryOrders
declare module "@/types/pelanggan" {
  interface Customer {
    deliveryOrders?: DeliveryOrder[];
  }
}

export default function DetailPelanggan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  // Get tab from URL query parameter or default to "info"
  const getTabFromUrl = (): "info" | "deliveryOrders" => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "deliveryOrders") {
      return tab;
    }
    return "info";
  };

  const [activeTab, setActiveTab] = useState<"info" | "deliveryOrders">(
    getTabFromUrl()
  );

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== "",
  });

  const hasCustomerUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.CUSTOMER,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasCustomerDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.CUSTOMER,
    PERMISSION.ACTIONS.DELETE
  );

  const {
    data: customer,
    isLoading,
    isError,
    error,
    refetch,
  } = useCustomer(
    { id: id || "" },
    { staleTime: 5000, refetchOnMount: "always" }
  );

  const deleteCustomer = useDeleteCustomer({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pelanggan berhasil dihapus").then(() => {
        navigate("/pelanggan");
      });
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal!",
        `Gagal menghapus pelanggan: ${
          error.message || "Terjadi kesalahan saat menghapus pelanggan."
        }`
      );
    },
  });

  const handleHapus = () => {
    showConfirmationAlert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.",
      "Ya, Hapus!",
      "Batal"
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteCustomer.mutate({ id: id || "" });
      }
    });
  };

  // Hitung total Delivery Order yang aktif (tidak dihapus)
  const activeDeliveryOrders =
    customer?.deliveryOrders?.filter((do_) => do_.deletedAt === null) || [];

  // Hitung total barang keluar dari semua DO aktif
  const calculateTotalItems = () => {
    let total = 0;
    activeDeliveryOrders.forEach((do_) => {
      do_.items.forEach((item) => {
        total += item.quantity;
      });
    });
    return total;
  };

  const handleTabChange = (tab: "info" | "deliveryOrders") => {
    setActiveTab(tab);

    // Update URL with the active tab
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("tab", tab);
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
  }, [location.search]);

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/pelanggan">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pelanggan</h1>
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Pelanggan
            </h2>
            <p className="text-sm text-gray-500">
              Detail informasi pelanggan sistem
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pelanggan..." />
        ) : isError ? (
          <ErrorState
            title="Gagal Memuat Data Pelanggan"
            message={error?.message || "Terjadi kesalahan pada server"}
            onRetry={refetch}
            retryButtonText="Coba lagi"
          />
        ) : !customer ? (
          <div className="p-6 rounded-lg bg-red-50">
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold text-red-700">
                Pelanggan tidak ditemukan
              </h2>
              <p className="mb-4 text-red-600">
                Data pelanggan dengan ID yang diberikan tidak ditemukan atau
                telah dihapus.
              </p>
              <Link to="/pelanggan">
                <Button>Kembali ke Daftar Pelanggan</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-none">
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap",
                  activeTab === "info"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleTabChange("info")}
              >
                <Info className="flex-shrink-0 w-4 h-4 mr-2" />
                Informasi Pelanggan
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap",
                  activeTab === "deliveryOrders"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleTabChange("deliveryOrders")}
              >
                <FileText className="flex-shrink-0 w-4 h-4 mr-2" />
                Delivery Order
                {activeDeliveryOrders.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {activeDeliveryOrders.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "info" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Data Pelanggan
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">ID</p>
                        <p
                          className="p-1 font-mono font-medium text-gray-900 break-all rounded bg-gray-50 wrap-text"
                          title={customer?.id_sl}
                        >
                          {customer?.id_sl}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nama Pelanggan</p>
                        <p
                          className="font-medium text-blue-600 wrap-text"
                          title={customer?.name}
                        >
                          {customer?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Alamat</p>
                        <p
                          className="font-medium text-gray-900 wrap-text"
                          title={customer?.address}
                        >
                          {customer?.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Statistik Delivery Order
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-blue-50">
                        <p className="text-sm text-gray-500">Total DO</p>
                        <p className="text-xl font-medium text-blue-600">
                          {activeDeliveryOrders.length}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50">
                        <p className="text-sm text-gray-500">
                          Total Barang Keluar
                        </p>
                        <p className="text-xl font-medium text-green-600">
                          {calculateTotalItems()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Informasi Waktu
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tanggal Diperbarui
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(customer.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Tindakan
                    </h3>
                    <div className="space-y-3">
                      <Link to={`/pelanggan/${id}/log`} className="w-full">
                        <Button
                          variant="outline"
                          className="justify-start w-full"
                        >
                          <History className="w-4 h-4 mr-2" />
                          Lihat Log Aktivitas
                        </Button>
                      </Link>
                      {hasCustomerUpdateAccess && (
                        <Link to={`/pelanggan/${id}/edit`} className="w-full">
                          <Button
                            variant="outline"
                            className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Pelanggan
                          </Button>
                        </Link>
                      )}
                      {hasCustomerDeleteAccess && (
                        <Button
                          variant="outline"
                          className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={handleHapus}
                          disabled={deleteCustomer.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleteCustomer.isPending
                            ? "Menghapus..."
                            : "Hapus Pelanggan"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "deliveryOrders" && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col items-start justify-between mb-4 sm:flex-row sm:items-center">
                    <h3 className="mb-2 text-lg font-medium text-gray-900 sm:mb-0">
                      Delivery Order {customer.name}
                    </h3>
                    <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded-md">
                      Total:{" "}
                      <span className="font-medium text-gray-700">
                        {activeDeliveryOrders.length}
                      </span>{" "}
                      DO aktif
                    </span>
                  </div>

                  {activeDeliveryOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-gray-300 border-dashed rounded-lg">
                      <FileText className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="font-medium text-gray-600">
                        Tidak ada Delivery Order aktif
                      </p>
                      <p className="max-w-md mt-2 text-sm text-gray-500">
                        Pelanggan ini belum memiliki Delivery Order aktif
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Desktop View */}
                      <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
                        <div className="w-full overflow-auto overflow-x-auto ">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-gray-200 bg-gray-50">
                                <TableHead className="w-[5%] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                                  No
                                </TableHead>
                                <TableHead className="w-[30%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                                  ID DO
                                </TableHead>
                                <TableHead className="w-[30%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                                  Alamat
                                </TableHead>
                                <TableHead className="w-[20%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                                  Item
                                </TableHead>
                                <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                                  Tanggal
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {activeDeliveryOrders.map((do_, idx) => (
                                <TableRow
                                  key={do_.id}
                                  className={cn(
                                    idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                                    "border-b border-gray-200 last:border-b-0"
                                  )}
                                >
                                  <TableCell className="py-2.5 px-3 font-medium text-center text-sm">
                                    {idx + 1}
                                  </TableCell>
                                  <TableCell className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                                    <Link
                                      to={`/do/${do_.id}`}
                                      className="hover:underline"
                                    >
                                      {do_.id.substring(0, 8)}...
                                    </Link>
                                  </TableCell>
                                  <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                                    <div
                                      className="overflow-hidden truncate max-w-[250px]"
                                      title={do_.address}
                                    >
                                      {do_.address}
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-2.5 px-3 text-gray-600 text-sm">
                                    {do_.items.length} item (
                                    {do_.items.reduce(
                                      (acc, item) => acc + item.quantity,
                                      0
                                    )}{" "}
                                    barang)
                                  </TableCell>
                                  <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm">
                                    {formatDateShort(do_.createdAt)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Mobile View */}
                      <div className="w-full space-y-3 sm:hidden">
                        {activeDeliveryOrders.map((do_, idx) => (
                          <div
                            key={do_.id}
                            className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                          >
                            <div className="w-full p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 mr-2 overflow-hidden">
                                  <Link to={`/do/${do_.id}`}>
                                    <h3 className="text-sm font-medium text-blue-600 truncate hover:underline">
                                      DO-{do_.id.substring(0, 8)}
                                    </h3>
                                  </Link>
                                  <p className="mt-1 text-xs text-gray-600 line-clamp-1">
                                    {do_.address}
                                  </p>
                                </div>
                                <div className="bg-gray-100 text-xs text-gray-700 px-1.5 py-0.5 rounded flex-shrink-0">
                                  #{idx + 1}
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                                <div>
                                  {do_.items.length} item (
                                  {do_.items.reduce(
                                    (acc, item) => acc + item.quantity,
                                    0
                                  )}{" "}
                                  barang)
                                </div>
                                <div className="text-gray-500">
                                  {formatDateShort(do_.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
