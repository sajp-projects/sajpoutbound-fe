import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { Navigate, Outlet } from "react-router";
import { showErrorAlert } from "@/utils/sweetAlert";
import { getRoleId } from "@/utils/storage";
import { hasPermission } from "@/utils/permission";

interface RBACLayoutProps {
  resource: string;
  action: string;
  redirectTo?: string;
  children?: React.ReactNode;
}

export default function RBACLayout({ resource, action, redirectTo = "/", children }: RBACLayoutProps) {
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || "";

  // Fetch permissions directly in the layout
  const { data: permissions, isLoading } = useRolePermissions(roleId, {
    enabled: roleId !== "",
  });

  // Jika belum selesai loading, tampilkan kosong
  if (isLoading) return null;

  // Jika tidak terautentikasi, redirect ke login
  if (!isAuthenticated) {
    showErrorAlert("Akses Ditolak", "Anda harus login terlebih dahulu");
    return <Navigate to="/login" replace />;
  }

  // Jika tidak ada roleId tapi sudah terautentikasi, ada masalah konfigurasi
  if (!roleId) {
    console.error("User is authenticated but has no roleId assigned");
    showErrorAlert("Kesalahan Konfigurasi", "Akun Anda tidak memiliki peran. Silakan hubungi administrator.");
    return <Navigate to={redirectTo} replace />;
  }

  // Periksa apakah pengguna memiliki izin yang diperlukan menggunakan utility
  if (!hasPermission(permissions, resource, action)) {
    showErrorAlert("Akses Ditolak", "Anda tidak memiliki izin untuk mengakses halaman ini");
    return <Navigate to={redirectTo} replace />;
  }

  // Jika memiliki akses, render konten yang dilindungi
  return children || <Outlet />;
}
