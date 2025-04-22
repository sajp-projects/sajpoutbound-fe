import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useRoles } from "@/hooks/role";
import { useCreateUser } from "@/hooks/user";
import { Role } from "@/types/role";
import { CreateUserInput } from "@/types/user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";

// Type untuk form tambah user
interface UserFormData {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export default function TambahPengguna() {
  const navigate = useNavigate();

  // State untuk form
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    roleId: "",
  });

  // Query untuk mendapatkan daftar role
  const { data: roles = [], isLoading: isLoadingRoles, isError: isErrorRoles } = useRoles();

  // Mutation untuk membuat user baru
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      // Tampilkan SweetAlert untuk sukses
      Swal.fire({
        title: "Berhasil!",
        text: "Pengguna baru berhasil ditambahkan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/pengguna");
      });
    },
    onError: (error) => {
      // Tampilkan SweetAlert untuk error
      Swal.fire({
        title: "Gagal!",
        text: `Gagal menambahkan pengguna: ${error.message}`,
        icon: "error",
        confirmButtonText: "Tutup",
      });
    },
  });

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validasi data
    if (!formData.name || !formData.email || !formData.password || !formData.roleId) {
      Swal.fire({
        title: "Validasi Gagal",
        text: "Semua field harus diisi",
        icon: "warning",
        confirmButtonText: "Tutup",
      });
      return;
    }

    // Persiapkan data untuk API
    const userData: CreateUserInput = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roleId: parseInt(formData.roleId),
    };

    // Kirim data ke API
    createUserMutation.mutate(userData);
  };

  const isLoading = isLoadingRoles;
  const isError = isErrorRoles;
  const isSubmitting = createUserMutation.isPending;

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
          <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna</h1>
        </div>
      </div>

      <Card className="border border-gray-200 rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>Form Pengguna Baru</CardTitle>
          <CardDescription>Isi data pengguna yang akan ditambahkan ke sistem</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <p className="mt-4 text-blue-600 font-medium">Memuat data...</p>
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
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <div className="mt-1">
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama lengkap" className="w-full" />
                </div>
                <p className="mt-1 text-sm text-gray-500">Nama lengkap pengguna yang akan ditampilkan di sistem</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Masukkan alamat email" className="w-full" />
                </div>
                <p className="mt-1 text-sm text-gray-500">Alamat email yang digunakan untuk login ke sistem</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Masukkan password" className="w-full" />
                </div>
                <p className="mt-1 text-sm text-gray-500">Password minimal 8 karakter</p>
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
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Pilih peran pengguna</option>
                    {roles.map((role: Role) => (
                      <option key={role.id} value={role.id.toString()}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-sm text-gray-500">Peran menentukan akses dan hak istimewa pengguna di sistem</p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(`/pengguna`)} disabled={isSubmitting} type="button">
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
