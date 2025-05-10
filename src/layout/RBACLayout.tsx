import { useAuth } from '@/hooks/auth';
import { useRolePermissions } from '@/hooks/izin';
import { hasPermission } from '@/utils/permission';
import { getRoleId } from '@/utils/storage';
import { showErrorAlert } from '@/utils/sweetAlert';
import { Navigate, Outlet } from 'react-router';

interface RBACLayoutProps {
  resource: string;
  action: string;
  redirectTo?: string;
  children?: React.ReactNode;
}

export default function RBACLayout({
  resource,
  action,
  redirectTo = '/',
  children,
}: RBACLayoutProps) {
  const { isAuthenticated } = useAuth();
  const roleId = getRoleId() || '';

  const { data: permissions, isLoading } = useRolePermissions(roleId, {
    enabled: roleId !== '',
  });

  if (isLoading) return null;

  if (!isAuthenticated) {
    showErrorAlert('Akses Ditolak', 'Anda harus login terlebih dahulu');
    return <Navigate to="/login" replace />;
  }

  if (!roleId) {
    console.error('User is authenticated but has no roleId assigned');
    showErrorAlert(
      'Kesalahan Konfigurasi',
      'Akun Anda tidak memiliki peran. Silakan hubungi administrator.'
    );
    return <Navigate to={redirectTo} replace />;
  }

  if (!hasPermission(permissions, resource, action)) {
    showErrorAlert(
      'Akses Ditolak',
      'Anda tidak memiliki izin untuk mengakses halaman ini'
    );
    return <Navigate to={redirectTo} replace />;
  }

  return children || <Outlet />;
}
