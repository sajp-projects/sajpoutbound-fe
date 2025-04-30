import { useAuth } from '@/hooks/auth';
import { useEffect } from 'react';
import { Outlet } from 'react-router';

export default function AuthLayout() {
  const { checkAuthRedirect } = useAuth();

  // Cek apakah sudah login, jika sudah redirect ke halaman dashboard
  useEffect(() => {
    checkAuthRedirect(false, '/');
  }, [checkAuthRedirect]);

  return (
    <div>
      <Outlet />
    </div>
  );
}
