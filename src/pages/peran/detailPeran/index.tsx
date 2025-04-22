import { useRole } from "@/hooks/role";
import { ArrowLeft, RefreshCcw, Pencil, Users, Info } from "lucide-react";
import { useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function DetailPeran() {
  const { id } = useParams<{ id: string }>();
  const { data: role, isLoading, isError, refetch } = useRole({ id: parseInt(id || "0") }, { staleTime: 5000, refetchOnMount: "always" });
  const [activeTab, setActiveTab] = useState<"info" | "users">("info");

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to="/peran">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Peran</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/peran/${id}/edit`}>
            <Button className="flex items-center px-3 py-2 bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm text-sm font-medium text-white">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Peran
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Informasi Peran</h2>
            <p className="text-sm text-gray-500">Detail peran dalam sistem</p>
          </div>
          <Button variant="outline" size="sm" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm" onClick={() => refetch()}>
            <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Segarkan
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p className="mt-4 text-blue-600 font-medium">Memuat data peran...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin"></div>
              <p className="mt-4 text-red-600 font-medium">Gagal memuat data peran</p>
              <p className="text-sm text-gray-400">Terjadi kesalahan pada server</p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Coba lagi
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center", activeTab === "info" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
                onClick={() => setActiveTab("info")}
              >
                <Info className="h-4 w-4 mr-2" />
                Informasi Peran
              </button>
              <button
                className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center", activeTab === "users" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-4 w-4 mr-2" />
                Pengguna Terkait
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "info" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Data Peran</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">ID Peran</p>
                        <p className="font-medium text-gray-900">{role?.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Nama Peran</p>
                        <p className="font-medium text-blue-600">{role?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Deskripsi</p>
                        <p className="font-medium text-gray-900">{role?.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Waktu</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Dibuat</p>
                        <p className="font-medium text-gray-900">{role?.createdAt ? formatDate(role.createdAt) : "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Diperbarui</p>
                        <p className="font-medium text-gray-900">{role?.updatedAt ? formatDate(role.updatedAt) : "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-gray-900">{role?.deletedAt ? "Tidak Aktif" : "Aktif"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tindakan</h3>
                    <div className="space-y-3">
                      <Link to={`/peran/${id}/edit`} className="w-full">
                        <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700">
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Peran
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("users")}>
                        <Users className="h-4 w-4 mr-2" />
                        Lihat Pengguna Terkait
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Pengguna dengan Peran {role?.name}</h3>
                  </div>

                  {/* Tampilan placeholder untuk pengguna terkait */}
                  <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">Daftar pengguna dengan peran ini akan ditampilkan di sini</p>
                    <p className="text-sm text-gray-500 max-w-md mt-2">Saat ini fitur ini masih dalam pengembangan. Anda dapat melihat pengguna dengan peran ini pada halaman Daftar Pengguna.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
