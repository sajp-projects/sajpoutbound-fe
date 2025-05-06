import { useDeleteCustomer, useCustomers } from "@/hooks/pelanggan";
import { Download, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDate, formatDateShort } from "@/utils/date";
import { useAuth } from "@/hooks/auth";
import { PERMISSION } from "@/constant/PERMISSION";
import { useRolePermissions } from "@/hooks/izin";
import {
  showSuccessAlert,
  showErrorAlert,
  showForbiddenAlert,
  showConfirmationAlert,
  isConfirmed,
} from "@/utils/sweetAlert";
import { getRoleId } from "@/utils/storage";
import { hasPermission } from "@/utils/permission";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { Customer } from "@/types/pelanggan";

export default function DaftarPelanggan() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  // Mendapatkan izin pengguna
  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && roleId !== "",
  });

  // Parameter paginasi
  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  // Mengambil data pelanggan
  const { data, isLoading, isError, refetch } = useCustomers({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const customers = data?.customers || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const deleteCustomer = useDeleteCustomer({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pelanggan berhasil dihapus");
      refetch();
    },
    onError: (error) => {
      if (error.message.includes("Forbidden")) {
        showForbiddenAlert(
          "Akses Ditolak",
          "Anda tidak memiliki akses untuk menghapus pelanggan ini."
        );
      } else {
        showErrorAlert(
          "Gagal!",
          `Gagal menghapus pelanggan: ${
            error.message || "Terjadi kesalahan saat menghapus pelanggan."
          }`
        );
      }
    },
  });

  const handleHapus = async (id: string) => {
    const result = await showConfirmationAlert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.",
      "Ya, Hapus!",
      "Batal"
    );

    if (isConfirmed(result)) {
      deleteCustomer.mutate({ id });
    }
  };

  // Cek izin user
  const hasCustomerDeleteAccess = hasPermission(
    permissions,
    PERMISSION.RESOURCES.CUSTOMER,
    PERMISSION.ACTIONS.DELETE
  );

  // Konfigurasi tombol aksi
  const getCustomerActions = (customer: Customer) => {
    const actions = [
      { type: ActionType.VIEW },
      { type: ActionType.EDIT },
      { type: ActionType.LOG },
    ];

    if (hasCustomerDeleteAccess) {
      actions.push({
        type: ActionType.DELETE,
        onClick: () => handleHapus(customer.id),
      });
    }

    return actions;
  };

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-col items-start justify-between w-full gap-2 sm:flex-row sm:items-center sm:gap-3">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Daftar Pelanggan
        </h1>
        <Link to="/pelanggan/tambah">
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Pelanggan
          </Button>
        </Link>
      </div>

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Pelanggan
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Manajemen data pelanggan sistem
            </p>
          </div>
          <div className="flex flex-wrap items-center w-full gap-2 sm:gap-3 sm:w-auto">
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
            placeholder="Cari pelanggan..."
            className="w-full sm:max-w-md"
          />
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pelanggan..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data pelanggan"
            message="Terjadi kesalahan pada server"
            onRetry={() => refetch()}
          />
        ) : (
          <div className="w-full">
            {/* Tabel Desktop */}
            <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <table className="w-full min-w-[650px] border-collapse">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="w-[60px] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        ID
                      </th>
                      <th className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Nama
                      </th>
                      <th className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        ID SL
                      </th>
                      <th className="w-[25%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Alamat
                      </th>
                      <th className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Dibuat
                      </th>
                      <th className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Diperbarui
                      </th>
                      <th className="w-[130px] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center">
                          <EmptyState title="Tidak ada data pelanggan yang ditemukan" />
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer, idx) => (
                        <tr
                          key={customer.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <td className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                            <div
                              className="max-w-full truncate"
                              title={customer.name}
                            >
                              {customer.name}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-sm">
                            <div
                              className="max-w-full truncate"
                              title={customer.id_sl}
                            >
                              {customer.id_sl}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-sm">
                            <div
                              className="max-w-full truncate"
                              title={customer.address}
                            >
                              {customer.address}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(customer.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(customer.updatedAt)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
                              <ActionButtons
                                actions={getCustomerActions(customer)}
                                entityId={customer.id}
                                basePath="/pelanggan"
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="w-full space-y-3 sm:hidden">
              {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data pelanggan yang ditemukan" />
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-full p-3">
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="max-w-[65%]">
                          <h3 className="text-sm font-medium text-blue-600 break-words">
                            {customer.name}
                          </h3>
                          <p className="mt-1 text-xs text-gray-600 break-all">
                            {customer.id_sl}
                          </p>
                        </div>
                        <Badge className="px-2 py-0.5 rounded-md font-medium text-xs shrink-0 bg-blue-100 text-blue-800 border-blue-200">
                          Pelanggan
                        </Badge>
                      </div>

                      <div className="mb-2 text-xs text-gray-600">
                        <p className="truncate">{customer.address}</p>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(customer.createdAt)}
                          </span>
                        </p>
                        <p>
                          Diperbarui:{" "}
                          <span className="font-medium">
                            {formatDateShort(customer.updatedAt)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
                        <ActionButtons
                          actions={getCustomerActions(customer)}
                          entityId={customer.id}
                          basePath="/pelanggan"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
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
