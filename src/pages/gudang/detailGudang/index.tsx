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
import { ArrowLeft, Edit, History, Trash2, Package, User } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { Product } from "@/types/gudang";
import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { PERMISSION } from "@/constant/PERMISSION";
import { hasPermission } from "@/utils/permission";
import { getRoleId } from "@/utils/storage";

// Definisi tipe untuk User
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

// Update tipe Warehouse dengan properti users
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
        <div className="flex gap-2">
          {hasWarehouseUpdateAccess && (
            <Link to={`/gudang/${id}/edit`}>
              <Button className="flex items-center px-3 py-2 text-sm font-medium text-white rounded-md shadow-sm bg-amber-600 hover:bg-amber-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Gudang
              </Button>
            </Link>
          )}
          {hasWarehouseDeleteAccess && (
            <Button
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700"
              onClick={handleDeleteWarehouse}
              disabled={deleteWarehouseMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleteWarehouseMutation.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          )}
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
            title="Gagal memuat data gudang"
            message={
              error instanceof Error
                ? error.message
                : "Terjadi kesalahan pada server"
            }
            onRetry={refetch}
            retryButtonText="Coba lagi"
          />
        ) : (
          <div className="space-y-6">
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
                    <div>
                      <p className="text-sm text-gray-500">Pengelola</p>
                      <div className="mt-1">
                        {gudang?.user ? (
                          <Link
                            to={`/pengguna/${gudang.user.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {gudang.user.name}
                          </Link>
                        ) : (
                          <p className="italic text-gray-500">
                            Tidak ada pengelola
                          </p>
                        )}
                      </div>
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
                        {gudang?.createdAt ? formatDate(gudang.createdAt) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Tanggal Diperbarui
                      </p>
                      <p className="font-medium text-gray-900">
                        {gudang?.updatedAt ? formatDate(gudang.updatedAt) : "-"}
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

            {/* Tabel Pengguna */}
            <div className="p-4 mt-8 border border-gray-200 rounded-lg">
              <div className="flex flex-col items-start justify-between mb-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Daftar Pengguna di Gudang
                  </h3>
                  <p className="text-sm text-gray-500">
                    Pengguna yang memiliki akses ke gudang ini
                  </p>
                </div>
              </div>

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
                      {!gudang?.users || gudang.users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            <EmptyState
                              title="Tidak ada pengguna di gudang ini"
                              message="Belum ada pengguna yang memiliki akses ke gudang ini"
                              icon={
                                <User className="w-10 h-10 text-gray-300" />
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        gudang.users.map((user: WarehouseUser, idx: number) => (
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile view for users */}
              <div className="w-full space-y-3 sm:hidden">
                {!gudang?.users || gudang.users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                    <EmptyState
                      title="Tidak ada pengguna di gudang ini"
                      message="Belum ada pengguna yang memiliki akses ke gudang ini"
                      icon={<User className="w-10 h-10 text-gray-300" />}
                    />
                  </div>
                ) : (
                  gudang.users.map((user: WarehouseUser) => (
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
                            ID: <span className="font-mono">{user.id}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tabel Barang */}
            <div className="p-4 mt-8 border border-gray-200 rounded-lg">
              <div className="flex flex-col items-start justify-between mb-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Daftar Barang di Gudang
                  </h3>
                  <p className="text-sm text-gray-500">
                    Barang yang tersimpan di gudang ini
                  </p>
                </div>
              </div>

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
                      {!gudang?.products || gudang.products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            <EmptyState
                              title="Tidak ada barang di gudang ini"
                              message="Silakan tambahkan barang ke gudang ini"
                              icon={
                                <Package className="w-10 h-10 text-gray-300" />
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        gudang.products.map((product: Product, idx: number) => (
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
                            <TableCell>{product.id_sl || "-"}</TableCell>
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile view for products */}
              <div className="w-full space-y-3 sm:hidden">
                {!gudang?.products || gudang.products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                    <EmptyState
                      title="Tidak ada barang di gudang ini"
                      message="Silakan tambahkan barang ke gudang ini"
                      icon={<Package className="w-10 h-10 text-gray-300" />}
                    />
                  </div>
                ) : (
                  gudang.products.map((product: Product) => (
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
                            ID: <span className="font-mono">{product.id}</span>
                          </p>
                          {product.id_sl && <p>ID: {product.id_sl}</p>}
                          <p>Dibuat: {formatDate(product.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
