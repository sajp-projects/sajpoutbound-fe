import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { useDeleteWarehouse, useWarehouse } from "@/hooks/gudang";
import { formatDate } from "@/utils/date";
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import {
  ArrowLeft,
  Edit,
  History,
  Trash2,
  Package,
  User,
  Info,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Product } from "@/types/gudang";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { PERMISSION } from "@/constant/PERMISSION";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";
import { useState } from "react";

interface WarehouseUser {
  id: string;
  name: string;
  email: string;
}

// Update tipe Product jika diperlukan
// interface Product {
//   id: string;
//   name: string;
//   id_sl?: string;
//   description?: string;
//   satuan: string;
//   warehouseId: string;
//   createdAt: string;
//   updatedAt: string;
// }

declare module "@/types/gudang" {
  interface Warehouse {
    users?: WarehouseUser[];
  }
}

export default function DetailGudang() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";
  const [activeTab, setActiveTab] = useState<"info" | "users" | "products">(
    "info"
  );

  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  const hasWarehouseUpdateAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.WAREHOUSE,
    PERMISSION.ACTIONS.UPDATE
  );

  const hasWarehouseDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.WAREHOUSE,
    PERMISSION.ACTIONS.DELETE
  );

  const {
    data: gudang,
    isLoading,
    isError,
    error,
    refetch,
  } = useWarehouse(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  const deleteWarehouseMutation = useDeleteWarehouse({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Gudang berhasil dihapus").then(() => {
        navigate("/gudang");
      });
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Menghapus Gudang",
        error.message || "Terjadi kesalahan saat menghapus gudang"
      );
    },
  });

  const handleDeleteWarehouse = () => {
    if (!gudang) return;

    showDeleteConfirmationAlert(
      "Gudang",
      `Apakah Anda yakin ingin menghapus gudang "${gudang.name}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteWarehouseMutation.mutate({ id: id || "" });
      }
    });
  };

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-0">
        <div className="flex items-center">
          <Link to="/gudang">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Gudang</h1>
        </div>
      </div>

      <div className="p-4 overflow-hidden bg-white rounded-lg shadow sm:p-6">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Informasi Gudang
            </h2>
            <p className="text-sm text-gray-500">
              Detail lengkap informasi gudang penyimpanan
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data gudang..." />
        ) : isError ? (
          <ErrorState
            title="Gagal Memuat Data Gudang"
            message={error?.message || "Terjadi kesalahan pada server"}
            onRetry={refetch}
            retryButtonText="Coba lagi"
          />
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
                onClick={() => setActiveTab("info")}
              >
                <Info className="flex-shrink-0 w-4 h-4 mr-2" />
                Informasi Gudang
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap",
                  activeTab === "users"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => setActiveTab("users")}
              >
                <User className="flex-shrink-0 w-4 h-4 mr-2" />
                Pengguna Terkait
                {gudang?.users && gudang.users.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {gudang.users.length}
                  </span>
                )}
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center whitespace-nowrap",
                  activeTab === "products"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
                onClick={() => setActiveTab("products")}
              >
                <Package className="flex-shrink-0 w-4 h-4 mr-2" />
                Barang Terkait
                {gudang?.products && gudang.products.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    {gudang.products.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === "info" && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Data Gudang
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Nama Gudang</p>
                        <p className="font-medium text-blue-600">
                          {gudang?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Deskripsi</p>
                        <p className="font-medium text-gray-900">
                          {gudang?.description || "-"}
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
                          {gudang?.createdAt
                            ? formatDate(gudang.createdAt)
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Tanggal Diperbarui
                        </p>
                        <p className="font-medium text-gray-900">
                          {gudang?.updatedAt
                            ? formatDate(gudang.updatedAt)
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">
                      Tindakan
                    </h3>
                    <div className="space-y-3">
                      <Link to={`/gudang/${id}/log`} className="w-full">
                        <Button
                          variant="outline"
                          className="justify-start w-full"
                        >
                          <History className="w-4 h-4 mr-2" />
                          Lihat Log Gudang
                        </Button>
                      </Link>
                      {hasWarehouseUpdateAccess && (
                        <Link to={`/gudang/${id}/edit`} className="w-full">
                          <Button
                            variant="outline"
                            className="justify-start w-full text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Gudang
                          </Button>
                        </Link>
                      )}
                      {hasWarehouseDeleteAccess && (
                        <Button
                          variant="outline"
                          className="justify-start w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={handleDeleteWarehouse}
                          disabled={deleteWarehouseMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleteWarehouseMutation.isPending
                            ? "Menghapus..."
                            : "Hapus Gudang"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Pengguna dengan Akses ke Gudang {gudang?.name}
                    </h3>
                    {gudang?.users && (
                      <span className="text-sm text-gray-500">
                        Total:{" "}
                        <span className="font-medium text-gray-700">
                          {gudang.users.length}
                        </span>{" "}
                        pengguna
                      </span>
                    )}
                  </div>

                  {!gudang?.users || gudang.users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-gray-300 border-dashed rounded-lg">
                      <User className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="font-medium text-gray-600">
                        Tidak ada pengguna yang memiliki akses ke gudang ini
                      </p>
                      <p className="max-w-md mt-2 text-sm text-gray-500">
                        Belum ada pengguna yang ditetapkan dengan akses ke
                        gudang {gudang?.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-gray-200 bg-gray-50">
                                <TableHead className="w-[50px] font-semibold text-gray-700 py-4">
                                  No
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">
                                  Nama Pengguna
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">
                                  Email
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gudang.users.map(
                                (user: WarehouseUser, idx: number) => (
                                  <TableRow
                                    key={user.id}
                                    className={cn(
                                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    )}
                                  >
                                    <TableCell className="font-medium text-center">
                                      {idx + 1}
                                    </TableCell>
                                    <TableCell className="font-medium text-blue-600">
                                      <Link
                                        to={`/pengguna/${user.id}`}
                                        className="hover:underline"
                                      >
                                        {user.name}
                                      </Link>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      <div className="w-full space-y-3 sm:hidden">
                        {gudang.users.map((user: WarehouseUser) => (
                          <div
                            key={user.id}
                            className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                          >
                            <div className="w-full p-3">
                              <div className="flex items-start justify-between w-full mb-2">
                                <div className="max-w-[80%]">
                                  <Link to={`/pengguna/${user.id}`}>
                                    <h3 className="text-sm font-medium text-blue-600 break-words hover:underline">
                                      {user.name}
                                    </h3>
                                  </Link>
                                  <p className="mt-1 text-xs text-gray-600 break-all">
                                    {user.email}
                                  </p>
                                </div>
                              </div>

                              <div className="text-xs text-gray-500">
                                <p>
                                  ID:{" "}
                                  <span className="font-mono">{user.id}</span>
                                </p>
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

            {activeTab === "products" && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Barang di Gudang {gudang?.name}
                    </h3>
                    {gudang?.products && (
                      <span className="text-sm text-gray-500">
                        Total:{" "}
                        <span className="font-medium text-gray-700">
                          {gudang.products.length}
                        </span>{" "}
                        barang
                      </span>
                    )}
                  </div>

                  {!gudang?.products || gudang.products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-gray-300 border-dashed rounded-lg">
                      <Package className="w-12 h-12 mb-4 text-gray-400" />
                      <p className="font-medium text-gray-600">
                        Tidak ada barang di gudang ini
                      </p>
                      <p className="max-w-md mt-2 text-sm text-gray-500">
                        Silakan tambahkan barang ke gudang {gudang?.name}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="hidden overflow-hidden border border-gray-200 rounded-lg sm:block">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-gray-200 bg-gray-50">
                                <TableHead className="w-[50px] font-semibold text-gray-700 py-4">
                                  No
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">
                                  Nama Barang
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">
                                  ID
                                </TableHead>
                                <TableHead className="py-4 font-semibold text-gray-700">
                                  Satuan
                                </TableHead>
                                <TableHead className="hidden py-4 font-semibold text-gray-700 md:table-cell">
                                  Deskripsi
                                </TableHead>
                                <TableHead className="hidden py-4 font-semibold text-gray-700 md:table-cell">
                                  Tgl. Dibuat
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gudang.products.map(
                                (product: Product, idx: number) => (
                                  <TableRow
                                    key={product.id}
                                    className={cn(
                                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    )}
                                  >
                                    <TableCell className="font-medium text-center">
                                      {idx + 1}
                                    </TableCell>
                                    <TableCell className="font-medium text-blue-600">
                                      <Link
                                        to={`/barang/${product.id}`}
                                        className="hover:underline"
                                      >
                                        {product.name}
                                      </Link>
                                    </TableCell>
                                    <TableCell>
                                      {product.id_sl || "-"}
                                    </TableCell>
                                    <TableCell>{product.satuan}</TableCell>
                                    <TableCell className="hidden text-gray-500 md:table-cell">
                                      <div
                                        className="max-w-xs truncate"
                                        title={product.description}
                                      >
                                        {product.description || "-"}
                                      </div>
                                    </TableCell>
                                    <TableCell className="hidden text-gray-500 md:table-cell">
                                      {formatDate(product.createdAt)}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      <div className="w-full space-y-3 sm:hidden">
                        {gudang.products.map((product: Product) => (
                          <div
                            key={product.id}
                            className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                          >
                            <div className="w-full p-3">
                              <div className="flex items-start justify-between w-full mb-2">
                                <div className="max-w-[80%]">
                                  <Link to={`/barang/${product.id}`}>
                                    <h3 className="text-sm font-medium text-blue-600 break-words hover:underline">
                                      {product.name}
                                    </h3>
                                  </Link>
                                  <p className="mt-1 text-xs text-gray-600 break-all">
                                    Satuan: {product.satuan}
                                  </p>
                                </div>
                              </div>

                              <div className="mb-2 text-xs text-gray-600">
                                <p className="line-clamp-2">
                                  {product.description || "-"}
                                </p>
                              </div>

                              <div className="text-xs text-gray-500">
                                <p>
                                  ID:{" "}
                                  <span className="font-mono">
                                    {product.id}
                                  </span>
                                </p>
                                {product.id_sl && <p>ID: {product.id_sl}</p>}
                                <p>Dibuat: {formatDate(product.createdAt)}</p>
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
