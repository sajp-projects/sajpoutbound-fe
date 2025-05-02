import { useAuth } from "@/hooks/auth";
import { useRolePermissions } from "@/hooks/izin";
import { Navigate, Outlet } from "react-router";
import { showErrorAlert } from "@/utils/sweetAlert";

interface RBACLayoutProps {
  resource: string;
  action: string;
  redirectTo?: string;
  children?: React.ReactNode;
}

export default function RBACLayout({ resource, action, redirectTo = "/", children }: RBACLayoutProps) {
  const { isAuthenticated } = useAuth();

  // Get roleId from localStorage
  const userData = localStorage.getItem("user");
  const roleId = userData ? JSON.parse(userData)?.roleId : null;

  // Fetch permissions directly in the layout
  const { data: permissions, isLoading } = useRolePermissions(roleId, {
    enabled: !!roleId && roleId !== "",
  });

  // If still loading, show nothing (or a loading spinner)
  if (isLoading) {
    return null;
  }

  // If we're not authenticated, redirect to login
  if (!isAuthenticated) {
    // Ganti Swal.fire dengan showErrorAlert
    showErrorAlert("Akses Ditolak", "Anda harus login terlebih dahulu");
    return <Navigate to="/login" replace />;
  }

  // If roleId is not available but we're authenticated, there's a configuration issue
  if (isAuthenticated && !roleId) {
    console.error("User is authenticated but has no roleId assigned");
    // Ganti Swal.fire dengan showErrorAlert
    showErrorAlert("Kesalahan Konfigurasi", "Akun Anda tidak memiliki peran. Silakan hubungi administrator.");
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user has the required permission
  const hasAccess = permissions?.some((permission) => permission.resource === resource && permission.action === action);

  // If access is denied, show message and redirect
  if (!hasAccess) {
    // Ganti Swal.fire dengan showErrorAlert
    showErrorAlert("Akses Ditolak", "Anda tidak memiliki izin untuk mengakses halaman ini");
    return <Navigate to={redirectTo} replace />;
  }

  // If we have access, render the protected content
  return <>{children || <Outlet />}</>;
}
