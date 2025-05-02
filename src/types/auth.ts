// Definisi tipe untuk data pengguna
export interface User {
  id: number;
  email: string;
  name: string;
  roleId?: string;
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

// Tipe untuk data form login
export interface LoginFormData {
  email: string;
  password: string;
  general?: string; // Untuk error umum
}

// Tipe untuk respons data login API
export interface LoginResponseData {
  user: User;
  tokens: Tokens;
}

// Tipe untuk props komponen InputField
export interface InputFieldProps {
  id: string;
  name?: string;
  label: string;
  type: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rightElement?: React.ReactNode;
}

// Tipe untuk props komponen PasswordField
export interface PasswordFieldProps {
  value: string;
  name?: string;
  onChange: (value: string) => void;
  error?: string;
}
