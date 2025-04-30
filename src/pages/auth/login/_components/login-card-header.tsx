import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const LoginCardHeader = () => (
  <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-100 py-4">
    <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
    <CardDescription className="text-gray-600 mt-1">Sistem Informasi Mengelola Pengeluaran Barang</CardDescription>
  </CardHeader>
);
