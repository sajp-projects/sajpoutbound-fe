import { Outlet } from "react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/auth";

export default function AuthLayout() {
  const { checkAuthRedirect } = useAuth();

  // Cek apakah sudah login, jika sudah redirect ke halaman dashboard
  useEffect(() => {
    checkAuthRedirect(false, "/");
  }, [checkAuthRedirect]);

  return (
    <div>
      <Outlet />
    </div>
  );
}
