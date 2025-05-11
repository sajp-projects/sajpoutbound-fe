import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { showSuccessAlert, showWarningAlert } from "@/utils/sweetAlert";
import { fetchApi } from "@/utils/api";
import { User, LoginFormData, LoginResponseData, Tokens } from "@/types/auth";
import * as storage from "@/utils/storage";
import { ApiResponse } from "@/types/api";
import {
  createErrorResponse,
  handleFormErrors,
  FormErrors,
} from "@/utils/errorHandler";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    storage.isAuthenticated()
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = storage.getUser();

    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (userData: User, tokens: Tokens) => {
    storage.saveAuthData(userData, tokens);
    setUser(userData);
    setIsAuthenticated(true);
    showSuccessAlert("Login Berhasil", `Selamat datang, ${userData.name}!`);
    return true;
  };

  const login = async (
    email: string,
    password: string,
    setErrors?: (errors: FormErrors<LoginFormData>) => void
  ) => {
    setIsLoading(true);

    try {
      const response = await fetchApi(
        "/auth/login",
        {},
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        }
      );

      const result = (await response.json()) as ApiResponse<LoginResponseData>;

      if (!result.success) {
        if (setErrors) {
          const errorResult = createErrorResponse(
            result,
            "Terjadi kesalahan saat login"
          );
          handleFormErrors<Record<string, unknown>>(
            errorResult,
            ["email", "password"],
            setErrors
          );
        }
        setIsLoading(false);
        return false;
      }

      const { user: userData, tokens } = result.data!;
      return handleLoginSuccess(userData, tokens);
    } catch (error) {
      console.error("Login error:", error);
      if (setErrors) {
        setErrors({ general: "Terjadi kesalahan saat menghubungi server" });
      }
      setIsLoading(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storage.clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    showSuccessAlert(
      "Logout Berhasil",
      "Anda telah berhasil keluar dari sistem"
    );
    navigate("/login");
  };

  const checkAuthRedirect = (requireAuth = true, redirectTo = "/login") => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      showWarningAlert("Akses Dibatasi", "Silakan login terlebih dahulu");
      navigate(redirectTo);
      return;
    }

    if (!requireAuth && isAuthenticated) {
      navigate("/");
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
