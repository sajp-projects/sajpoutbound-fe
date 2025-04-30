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

// Tipe untuk state autentikasi
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
