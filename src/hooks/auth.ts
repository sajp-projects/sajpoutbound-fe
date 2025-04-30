import { useState, useEffect } from "react";
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

export function useAuth() {
  const [authState, setAuthState] = useState({
    user: null as User | null,
    isAuthenticated: false,
    isLoading: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (accessToken && userData) {
      try {
        setAuthState({
          user: JSON.parse(userData),
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        clearAuthData();
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  const saveAuthData = (user: User, tokens: Tokens) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const showAlert = (icon: "success" | "warning" | "error", title: string, text: string) => {
    Swal.fire({
      icon,
      title,
      text,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const login = async (email: string, password: string) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }

      const { user, tokens } = data.data;
      saveAuthData(user, tokens);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      showAlert("success", "Login Berhasil", `Selamat datang, ${user.name}!`);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    clearAuthData();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    showAlert("success", "Logout Berhasil", "Anda telah berhasil keluar dari sistem");
    navigate("/login");
  };

  const checkAuthRedirect = (requireAuth = true, redirectTo = "/login") => {
    const { isLoading, isAuthenticated } = authState;

    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      showAlert("warning", "Akses Dibatasi", "Silakan login terlebih dahulu");
      navigate(redirectTo);
    } else if (!requireAuth && isAuthenticated) {
      navigate("/");
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
    checkAuthRedirect,
  };
}
