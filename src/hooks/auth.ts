import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

// Definisi tipe untuk data pengguna
export interface User {
  id: number;
  email: string;
  name: string;
}

// Tipe untuk respons token
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// Helper function to check initial auth state
const getInitialAuthState = () => {
  const accessToken = localStorage.getItem("accessToken");
  const userData = localStorage.getItem("user");
  return !!(accessToken && userData);
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getInitialAuthState());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Cek token dan status autentikasi saat komponen mounting
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (accessToken && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  // Function untuk login
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        // Kita tidak tampilkan alert error disini karena sudah ditangani di form
        setIsLoading(false);
        return false;
      }

      // Login berhasil
      const { user, tokens } = data.data;

      // Simpan token dan data user di localStorage
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Update state
      setUser(user);
      setIsAuthenticated(true);

      // Tampilkan alert sukses
      Swal.fire({
        icon: "success",
        title: "Login Berhasil",
        text: `Selamat datang, ${user.name}!`,
        timer: 1500,
        showConfirmButton: false,
      });

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      // Kita tidak tampilkan alert error disini karena sudah ditangani di form
      setIsLoading(false);
      return false;
    }
  };

  // Function untuk logout
  const logout = () => {
    // Hapus data dari localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Update state
    setUser(null);
    setIsAuthenticated(false);

    // Tampilkan alert sukses
    Swal.fire({
      icon: "success",
      title: "Logout Berhasil",
      text: "Anda telah berhasil keluar dari sistem",
      timer: 1500,
      showConfirmButton: false,
    });

    // Redirect ke halaman login
    navigate("/login");
  };

  // Fungsi untuk cek apakah halaman ini memerlukan autentikasi
  const checkAuthRedirect = (requireAuth: boolean = true, redirectTo: string = "/login") => {
    // Jika masih loading, tidak melakukan apa-apa
    if (isLoading) {
      return;
    }

    // Jika halaman memerlukan autentikasi tetapi user belum login
    if (requireAuth && !isAuthenticated) {
      Swal.fire({
        title: "Akses Dibatasi",
        text: "Silakan login terlebih dahulu",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(redirectTo);
      return;
    }

    // Jika halaman khusus untuk user yang belum login (seperti halaman login) tetapi user sudah login
    if (!requireAuth && isAuthenticated) {
      navigate("/");
      return;
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthRedirect,
  };
}
