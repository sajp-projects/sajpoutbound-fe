import { ApiResponse } from '@/types/api';
import { LoginResponseData, Tokens, User } from '@/types/auth';
import { axiosInstance } from '@/utils/axios';
import { createErrorResponse } from '@/utils/errorHandler';
import * as storage from '@/utils/storage';
import { showSuccessAlert, showWarningAlert } from '@/utils/sweetAlert';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

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
    showSuccessAlert('Login Berhasil', `Selamat datang, ${userData.name}!`);
    return true;
  };

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      try {
        const response = await axiosInstance.post('/auth/login', {
          email,
          password,
        });

        const result = response.data as ApiResponse<LoginResponseData>;

        if (!result.success) {
          const errorResult = createErrorResponse(
            result,
            'Terjadi kesalahan saat login'
          );
          throw errorResult;
        }

        return result.data!;
      } catch (error) {
        // Menangani error dari Axios
        const axiosError = error as AxiosError<ApiResponse<unknown>>;

        if (axiosError.response?.data) {
          // Jika ada response data dari backend
          const errorData = axiosError.response.data;
          const errorResult = createErrorResponse(
            errorData,
            'Terjadi kesalahan saat login'
          );
          throw errorResult;
        } else if (axiosError.message) {
          throw {
            message: axiosError.message,
            errorType: 'networkError',
          };
        } else {
          throw {
            message: 'Terjadi kesalahan saat menghubungi server',
            errorType: 'unknownError',
          };
        }
      }
    },
    onSuccess: (data) => {
      handleLoginSuccess(data.user, data.tokens);
      navigate('/');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.post('/auth/logout');
    },
    onSuccess: () => {
      storage.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      showSuccessAlert(
        'Logout Berhasil',
        'Anda telah berhasil keluar dari sistem'
      );
      navigate('/login');
    },
    onError: () => {
      storage.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const checkAuthRedirect = (requireAuth = true, redirectTo = '/login') => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      showWarningAlert('Akses Dibatasi', 'Silakan login terlebih dahulu');
      navigate(redirectTo);
      return;
    }

    if (!requireAuth && isAuthenticated) {
      navigate('/');
    }
  };

  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.get('/auth/refresh-token');
      return response.data;
    },
    onSuccess: (data) => {
      const currentUser = storage.getUser();
      if (currentUser && data.data?.accessToken) {
        storage.saveAuthData(currentUser, {
          accessToken: data.data.accessToken,
        });
      }
    },
    onError: () => {
      storage.clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    loginMutation,
    logoutMutation,
    refreshTokenMutation,
    logout,
    checkAuthRedirect,
  };
}
