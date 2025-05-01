import { useUser, useUpdateUser } from "@/hooks/user";
import { useAllRoles } from "@/hooks/role";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Role } from "@/types/role";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Type untuk form edit user
interface UserFormData {
  name: string;
  email: string;
  roleId: string;
}

export default function EditPengguna() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    roleId: "",
  });

  // State untuk error validasi
  const [errors, setErrors] = useState<{ id?: string; name?: string; email?: string; roleId?: string; general?: string }>({});

  // Query untuk mendapatkan data user
  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = useUser(
    {
      id: id || "",
    },
    {
      staleTime: 5000,
      refetchOnMount: "always",
    }
  );

  // Query untuk mendapatkan daftar role - menggunakan useAllRoles untuk mendapatkan semua data
  const { data: rolesData, isLoading: isLoadingRoles, isError: isErrorRoles } = useAllRoles();

  // Pastikan roles selalu array dengan mengakses rolesData.roles jika ada
  const roles = rolesData?.roles || [];

  // Mutation untuk update user
  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      // Tampilkan SweetAlert untuk sukses
      Swal.fire({
        title: "Berhasil!",
        text: "Data pengguna berhasil diperbarui",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate(`/pengguna/${id}`);
      });
    },
    onError: (error) => {
      // Tangani error dari backend
      try {
        // Parse error yang sudah di-stringify di hook
        const errorObj = JSON.parse(error.message);

        if (errorObj.errorType === "joiValidationError" && errorObj.details && errorObj.details.length > 0) {
          // Petakan error validasi ke field yang sesuai
          const newErrors: { id?: string; name?: string; email?: string; roleId?: string; general?: string } = {};

          errorObj.details.forEach((detail: { message: string; path: string[] }) => {
            if (detail.path.includes("id")) {
              newErrors.id = detail.message;
            } else if (detail.path.includes("name")) {
              newErrors.name = detail.message;
            } else if (detail.path.includes("email")) {
              newErrors.email = detail.message;
            } else if (detail.path.includes("roleId")) {
              newErrors.roleId = detail.message;
            } else {
              newErrors.general = detail.message;
            }
          });

          setErrors(newErrors);
        } else {
          // Error umum non-validasi
          setErrors({ general: errorObj.message });
        }
      } catch (e) {
        console.error("Error parsing error message:", e);
        setErrors({ general: "Terjadi kesalahan saat memperbarui pengguna" });
      }
    },
  });

  // Isi form dengan data user ketika data sudah tersedia
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        roleId: user.role.id,
      });
    }
  }, [user]);

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Hapus error untuk field yang diubah
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    // Tampilkan konfirmasi sebelum mengubah pengguna
    Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menyimpan perubahan data pengguna ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        updateUserMutation.mutate({
          id: id || "",
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId,
        });
      }
    });
  };

  const isLoading = isLoadingUser || isLoadingRoles;
  const isError = isErrorUser || isErrorRoles;
  const isSubmitting = updateUserMutation.isPending;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <Link to={`/pengguna/${id}`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Pengguna</h1>
        </div>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Pengguna</CardTitle>
          <CardDescription>Perbarui informasi pengguna sistem</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <p className="mt-4 text-blue-600 font-medium">Memuat data pengguna...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center h-60">
              <div className="flex flex-col items-center">
                <p className="text-red-600 font-medium">Gagal memuat data</p>
                <p className="text-sm text-gray-400">Terjadi kesalahan pada server</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/pengguna")} className="mt-4">
                  Kembali ke Daftar Pengguna
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {(errors.general || errors.id) && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{errors.general || errors.id}</div>}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <div className="mt-1">
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama lengkap" className={cn("w-full", errors.name && "border-red-300 focus:border-red-500 focus:ring-red-500")} />
                </div>
                {errors.name ? <p className="mt-1 text-sm text-red-500">{errors.name}</p> : <p className="mt-1 text-sm text-gray-500">Nama lengkap pengguna yang akan ditampilkan di sistem</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan alamat email"
                    className={cn("w-full", errors.email && "border-red-300 focus:border-red-500 focus:ring-red-500")}
                  />
                </div>
                {errors.email ? <p className="mt-1 text-sm text-red-500">{errors.email}</p> : <p className="mt-1 text-sm text-gray-500">Alamat email yang digunakan untuk login ke sistem</p>}
              </div>

              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
                  Peran
                </label>
                <div className="mt-1">
                  <select
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className={cn(
                      "block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      errors.roleId && "border-red-300 focus:border-red-500 focus:ring-red-500"
                    )}
                  >
                    {roles && roles.length > 0 ? (
                      roles.map((role: Role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))
                    ) : (
                      <option value="">Tidak ada peran tersedia</option>
                    )}
                  </select>
                </div>
                {errors.roleId ? <p className="mt-1 text-sm text-red-500">{errors.roleId}</p> : <p className="mt-1 text-sm text-gray-500">Peran menentukan akses dan hak istimewa pengguna di sistem</p>}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(`/pengguna/${id}`)} disabled={isSubmitting} type="button">
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
