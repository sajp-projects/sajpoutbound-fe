import { useArmadas, useDeleteArmada } from "@/hooks/armada";
import { Download, Plus } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
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
import { formatDate, formatDateShort } from "@/utils/date";
import {
  isConfirmed,
  showDeleteConfirmationAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/utils/sweetAlert";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { ActionButtons, ActionType } from "@/components/ActionButtons";
import { Armada } from "@/types/armada";

export default function DaftarArmada() {
  const [searchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = parseInt(searchParams.get("limit") || "10");

  const {
    data,
    isLoading,
    isError,
    error: armadaError,
    refetch,
  } = useArmadas({
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const armadas = data?.armadas || [];
  const pagination = data?.pagination || {
    total: 0,
    page: currentPage,
    limit: itemsPerPage,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  const deleteArmadaMutation = useDeleteArmada({
    onSuccess: () => {
      showSuccessAlert("Sukses!", "Armada berhasil dihapus");
      refetch();
    },
    onError: (error) => {
      showErrorAlert(
        "Gagal Menghapus Armada",
        error.message || "Terjadi kesalahan saat menghapus armada"
      );
    },
  });

  const handleDeleteArmada = (id: string, model: string) => {
    showDeleteConfirmationAlert(
      "Armada",
      `Apakah Anda yakin ingin menghapus armada "${model}"?`
    ).then((result) => {
      if (isConfirmed(result)) {
        deleteArmadaMutation.mutate({ id });
      }
    });
  };

  const getArmadaActions = (armada: Armada) => [
    { type: ActionType.VIEW },
    { type: ActionType.EDIT },
    { type: ActionType.LOG },
    {
      type: ActionType.DELETE,
      onClick: () => handleDeleteArmada(armada.id, armada.model),
      isLoading:
        deleteArmadaMutation.isPending &&
        deleteArmadaMutation.variables?.id === armada.id,
      disabled: deleteArmadaMutation.isPending,
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-full px-2 space-y-4 sm:space-y-6 sm:px-4 md:px-0">
      <div className="flex flex-col items-start justify-between w-full gap-2 sm:flex-row sm:items-center sm:gap-3">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Daftar Armada
        </h1>
        <Link to="/armada/tambah">
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
            className="w-full sm:w-auto"
          >
            Tambah Armada
          </Button>
        </Link>
      </div>

      <div className="w-full p-3 overflow-hidden bg-white rounded-lg shadow sm:p-4 md:p-6">
        <div className="flex flex-col items-start justify-between w-full gap-3 mb-4 sm:flex-row sm:items-center sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
              Armada
            </h2>
            <p className="text-xs text-gray-500 sm:text-sm">
              Manajemen data armada kendaraan
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
            placeholder="Cari armada..."
            className="w-full sm:max-w-md"
          />
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data armada..." />
        ) : isError ? (
          <ErrorState
            title="Gagal memuat data armada"
            message={
              armadaError instanceof Error
                ? armadaError.message
                : "Terjadi kesalahan pada server"
            }
            onRetry={() => refetch()}
          />
        ) : (
          <div className="w-full">
            {/* Tabel Desktop */}
            <div className="hidden w-full overflow-hidden border border-gray-200 rounded-lg sm:block">
              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200 bg-gray-50">
                      <TableHead className="w-[60px] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        No.
                      </TableHead>
                      <TableHead className="w-[22%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Model
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm">
                        Plat Nomor
                      </TableHead>
                      <TableHead className="w-[38%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Deskripsi
                      </TableHead>
                      <TableHead className="w-[15%] py-3 px-3 text-left font-semibold text-gray-700 text-sm hidden md:table-cell">
                        Tgl. Dibuat
                      </TableHead>
                      <TableHead className="w-[130px] py-3 px-3 text-center font-semibold text-gray-700 text-sm">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {armadas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <EmptyState title="Tidak ada data armada yang ditemukan" />
                        </TableCell>
                      </TableRow>
                    ) : (
                      armadas.map((armada, idx) => (
                        <TableRow
                          key={armada.id}
                          className={cn(
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                            "border-b border-gray-200 last:border-b-0"
                          )}
                        >
                          <TableCell className="py-2.5 px-3 font-medium text-center text-sm">
                            {idx + 1 + (pagination.page - 1) * pagination.limit}
                          </TableCell>
                          <TableCell className="py-2.5 px-3 font-medium text-blue-600 text-sm">
                            <div className="wrap-text" title={armada.model}>
                              {armada.model}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-sm">
                            <div
                              className="wrap-text"
                              title={armada.plateNumber}
                            >
                              {armada.plateNumber}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            <div
                              className="wrap-text"
                              title={armada.description}
                            >
                              {armada.description}
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 px-3 text-gray-500 text-xs lg:text-sm hidden md:table-cell">
                            {formatDate(armada.createdAt)}
                          </TableCell>
                          <TableCell className="py-2.5 px-3">
                            <div className="flex items-center justify-center">
                              <ActionButtons
                                actions={getArmadaActions(armada)}
                                entityId={armada.id}
                                basePath="/armada"
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

            {/* Mobile Card View */}
            <div className="w-full space-y-3 sm:hidden">
              {armadas.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full p-6 bg-white border border-gray-200 rounded-lg">
                  <EmptyState title="Tidak ada data armada yang ditemukan" />
                </div>
              ) : (
                armadas.map((armada) => (
                  <div
                    key={armada.id}
                    className="w-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="w-full p-3">
                      <div className="flex items-start justify-between w-full mb-2">
                        <div className="max-w-[65%]">
                          <h3 className="text-sm font-medium text-blue-600 break-words">
                            {armada.model}
                          </h3>
                          <p className="mt-1 text-xs text-gray-600 break-all">
                            {armada.plateNumber}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2 text-xs text-gray-600">
                        <p className="line-clamp-2">{armada.description}</p>
                      </div>

                      <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                        <p>
                          Dibuat:{" "}
                          <span className="font-medium">
                            {formatDateShort(armada.createdAt)}
                          </span>
                        </p>
                        <p>
                          Diperbarui:{" "}
                          <span className="font-medium">
                            {formatDateShort(armada.updatedAt)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t">
                        <ActionButtons
                          actions={getArmadaActions(armada)}
                          entityId={armada.id}
                          basePath="/armada"
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
