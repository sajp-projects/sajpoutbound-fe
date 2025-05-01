import { useRole } from "@/hooks/role";
import { ArrowLeft, Pencil, Users, Info, Mail, Calendar, User, Eye, Lock } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Swal from "sweetalert2";
import { useRolePermissions } from "@/hooks/izin";
import { useAuth } from "@/hooks/auth";
import { PERMISSION } from "@/constant/PERMISSION";

export default function DetailPeran() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"info" | "users">("info");
  const { isAuthenticated } = useAuth();

  // Get roleId dari localStorage
  const userData = localStorage.getItem("user");
  const roleId = userData ? JSON.parse(userData)?.roleId : null;

  // Fetch permissions untuk memeriksa apakah user memiliki akses ke permission:READ
  const { data: permissions } = useRolePermissions(roleId, {
    enabled: isAuthenticated && !!roleId && roleId !== "",
  });

  // Fungsi untuk memeriksa apakah user memiliki izin permission:READ
  const hasPermissionAccess = (): boolean => {
    if (!isAuthenticated || !permissions) return false;
    return permissions.some((permission) => permission.resource === PERMISSION.RESOURCES.PERMISSION && permission.action === PERMISSION.ACTIONS.READ);
  };

  // Konfigurasi untuk useRole hook
  const {
    data: role,
    isLoading,
    isError,
    error,
  } = useRole(
    { id: id || "" },
    {
      staleTime: 5000,
      refetchOnMount: "always",
      retry: 1,
    }
  );

  // Menangani error dari useRole
  useEffect(() => {
    if (isError && error) {
      let errorMessage = error.message || "Terjadi kesalahan saat memuat data peran";

      // Handling untuk Joi validation error
      if (errorMessage.includes("validation error")) {
        errorMessage = "Format ID peran tidak valid. ID peran harus berupa angka.";
      }

      Swal.fire({
        icon: "error",
        title: "Peran Tidak Ditemukan",
        text: errorMessage,
        confirmButtonText: "Kembali ke Daftar Peran",
      }).then(() => {
        navigate("/peran");
      });
    }
  }, [isError, error, navigate]);

  // Jika masih loading atau ada error, tampilkan loading state
  if (isLoading || isError) {
    return (
      <div className="space-y-6 px-4 sm:px-0">
        <div className="flex items-center">
          <Link to="/peran">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Peran</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
          <div className="flex justify-center items-center h-60">
            {isLoading && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <p className="mt-4 text-blue-600 font-medium">Memuat data peran...</p>
              </div>
            )}
            {/* Tidak menampilkan tampilan error, hanya loading */}
          </div>
        </div>
      </div>
    );
  }

  // Render komponen utama dengan data yang sudah ada
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
          {hasPermissionAccess() && (
            <Link to={`/peran/${id}/izin`}>
              <Button className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-md shadow-sm text-sm font-medium text-white">
                <Lock className="h-4 w-4 mr-2" />
                Kelola Izin
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Informasi Peran</h2>
            <p className="text-sm text-gray-500">Detail peran dalam sistem</p>
          </div>
        </div>

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
              Pengguna Terkait {role?.users && role.users.length > 0 && <span className="ml-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{role.users.length}</span>}
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
                    {hasPermissionAccess() && (
                      <Link to={`/peran/${id}/izin`} className="w-full">
                        <Button variant="outline" className="w-full justify-start text-purple-600 border-purple-200 hover:bg-purple-50 hover:text-purple-700">
                          <Lock className="h-4 w-4 mr-2" />
                          Kelola Izin Peran
                        </Button>
                      </Link>
                    )}
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("users")}>
                      <Users className="h-4 w-4 mr-2" />
                      Lihat Pengguna Terkait
                      {role?.users && role.users.length > 0 && <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{role.users.length}</span>}
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
                  {role?.users && (
                    <span className="text-sm text-gray-500">
                      Total: <span className="font-medium text-gray-700">{role.users.length}</span> pengguna
                    </span>
                  )}
                </div>

                {/* Tampilan daftar pengguna */}
                {!role?.users || role.users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">Tidak ada pengguna yang memiliki peran ini</p>
                    <p className="text-sm text-gray-500 max-w-md mt-2">Belum ada pengguna yang ditetapkan dengan peran {role?.name}</p>
                  </div>
                ) : (
                  <div>
                    {/* Table untuk tampilan desktop & tablet */}
                    <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50 border-b border-gray-200">
                              <TableHead className="w-[50px] font-semibold text-gray-700 py-4">ID</TableHead>
                              <TableHead className="font-semibold text-gray-700 py-4">Nama</TableHead>
                              <TableHead className="font-semibold text-gray-700 py-4">Email</TableHead>
                              <TableHead className="hidden md:table-cell font-semibold text-gray-700 py-4">Tgl. Bergabung</TableHead>
                              <TableHead className="font-semibold text-gray-700 py-4 text-center">Status</TableHead>
                              <TableHead className="font-semibold text-gray-700 py-4 text-center">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {role.users.map((user, idx) => (
                              <TableRow key={user.id} className={cn(idx % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                                <TableCell className="font-medium text-center">{idx + 1}</TableCell>
                                <TableCell className="font-medium text-blue-600">{user.name}</TableCell>
                                <TableCell className="text-gray-600">{user.email}</TableCell>
                                <TableCell className="hidden md:table-cell text-gray-500">{formatDate(user.createdAt)}</TableCell>
                                <TableCell className="text-center">
                                  <span className={cn("px-2 py-1 text-xs rounded-full", user.deletedAt ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>{user.deletedAt ? "Tidak Aktif" : "Aktif"}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Link to={`/pengguna/${user.id}`}>
                                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Card untuk tampilan mobile */}
                    <div className="sm:hidden space-y-4">
                      {role.users.map((user) => (
                        <div key={user.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-blue-600">{user.name}</h3>
                              <span className={cn("px-2 py-1 text-xs rounded-full", user.deletedAt ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>{user.deletedAt ? "Tidak Aktif" : "Aktif"}</span>
                            </div>

                            <div className="space-y-2 mt-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <span>Bergabung: {formatDate(user.createdAt)}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <span>ID: {user.id}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-end gap-1 border-t pt-2 mt-2">
                              <Link to={`/pengguna/${user.id}`}>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Lihat Detail">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
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
      </div>
    </div>
  );
}
