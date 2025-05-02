import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { useDeleteUser, useUser } from "@/hooks/user";
import { cn } from "@/lib/utils";
import { getRoleBadgeColor, getRoleBadgeVariant } from "@/utils/badges";
import { formatDate } from "@/utils/date";
import { showSuccessAlert, showErrorAlert, showForbiddenAlert, showConfirmationAlert, isConfirmed } from "@/utils/sweetAlert";
import { Archive, ArrowLeft, FileText, Pencil } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";

export default function DetailPengguna() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, isError, refetch } = useUser({ id: id || "" }, { staleTime: 5000, refetchOnMount: "always" });

  const deleteUser = useDeleteUser({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengguna berhasil diarsipkan").then(() => {
        navigate("/pengguna");
      });
    },
    onError: (error) => {
      if (error.message.includes("Forbidden")) {
        showForbiddenAlert("Akses Ditolak", "Anda tidak memiliki akses untuk mengarsipkan pengguna ini.");
      } else {
        showErrorAlert("Gagal!", `Gagal mengarsipkan pengguna: ${error.message || "Terjadi kesalahan saat mengarsipkan pengguna."}`);
      }
    },
  });

  const handleArsipkan = () => {
    showConfirmationAlert("Konfirmasi Arsip", "Apakah Anda yakin ingin mengarsipkan pengguna ini? Tindakan ini tidak dapat dibatalkan.", "Ya, Arsipkan!", "Batal").then((result) => {
      if (isConfirmed(result)) {
        deleteUser.mutate({ id: id || "" });
      }
    });
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/pengguna">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pengguna</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/pengguna/${id}/edit`}>
            <Button className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm text-sm font-medium text-white">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Pengguna
            </Button>
          </Link>
          <Button className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md shadow-sm text-sm font-medium text-white" onClick={handleArsipkan} disabled={deleteUser.isPending}>
            <Archive className="h-4 w-4 mr-2" />
            {deleteUser.isPending ? "Mengarsipkan..." : "Arsipkan"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Informasi Pengguna</h2>
            <p className="text-sm text-gray-500">Detail informasi pengguna sistem</p>
          </div>
        </div>

        {isLoading ? (
          <LoadingState text="Memuat data pengguna..." />
        ) : isError ? (
          <ErrorState title="Gagal memuat data pengguna" message="Terjadi kesalahan pada server" onRetry={refetch} retryButtonText="Coba lagi" />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Data Pengguna</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Pengguna</p>
                      <p className="font-medium text-gray-900">{user?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nama Lengkap</p>
                      <p className="font-medium text-blue-600">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Peran</p>
                      <div className="mt-1">
                        {user?.role && (
                          <Badge variant={getRoleBadgeVariant(user.role.name)} className={cn("px-2 py-0.5 rounded-md font-medium", getRoleBadgeColor(user.role.name))}>
                            {user.role.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Deskripsi Peran</h3>
                  <p className="text-gray-700">{user?.role?.description || "-"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Waktu</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                      <p className="font-medium text-gray-900">{user?.createdAt ? formatDate(user.createdAt) : "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Diperbarui</p>
                      <p className="font-medium text-gray-900">{user?.updatedAt ? formatDate(user.updatedAt) : "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Diarsipkan</p>
                      <p className="font-medium text-gray-900">{user?.deletedAt ? formatDate(user.deletedAt) : "Belum diarsipkan"}</p>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tindakan</h3>
                  <div className="space-y-3">
                    <Link to={`/pengguna/${id}/log`} className="w-full">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Lihat Log Aktivitas
                      </Button>
                    </Link>
                    <Link to={`/pengguna/${id}/edit`} className="w-full">
                      <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Pengguna
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={handleArsipkan} disabled={deleteUser.isPending}>
                      <Archive className="h-4 w-4 mr-2" />
                      {deleteUser.isPending ? "Mengarsipkan..." : "Arsipkan Pengguna"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
