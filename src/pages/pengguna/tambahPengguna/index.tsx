import { useState } from "react";
import { useNavigate } from "react-router";
import { Save, User, Mail, Key, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function TambahPengguna() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: "",
  });

  // Contoh data roles
  const roles: Role[] = [
    { id: 1, name: "Admin", description: "Administrator with full access to the system" },
    { id: 2, name: "Manager", description: "Manager with moderate access to the system" },
    { id: 3, name: "Staff", description: "Staff with limited access to the system" },
    { id: 4, name: "Guest", description: "Guest with very limited access" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, roleId: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      alert("Password tidak cocok!");
      setLoading(false);
      return;
    }

    // Simulasi pengiriman data ke API
    setTimeout(() => {
      console.log("Data yang dikirim:", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roleId: parseInt(formData.roleId),
      });

      setLoading(false);
      // Redirect ke halaman daftar pengguna setelah berhasil
      navigate("/pengguna");
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/pengguna");
  };

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Pengguna</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Form Pengguna Baru</h2>
            <p className="text-sm text-gray-500">Isi data pengguna yang akan ditambahkan ke sistem</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nama
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Masukkan nama pengguna" className="pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contoh@email.com"
                  className="pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                Peran
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Select value={formData.roleId} onValueChange={handleRoleChange} required>
                  <SelectTrigger className="pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md w-full">
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.roleId && <p className="text-xs text-gray-500 mt-1 italic">{roles.find((r) => r.id.toString() === formData.roleId)?.description}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-6">
            <Button type="button" variant="outline" onClick={handleCancel} className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 text-xs sm:text-sm h-9">
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-9">
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
