export interface User {
  id: number;
  email: string;
  name: string;
  roleId?: string;
}

export interface Tokens {
  accessToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  general?: string;
}

export interface LoginResponseData {
  user: User;
  tokens: Tokens;
}

export interface LoginError {
  errorType: string;
  message: string;
  details?: Array<{
    message: string;
    path: string[];
    type: string;
  }>;
}

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

export interface PasswordFieldProps {
  value: string;
  name?: string;
  onChange: (value: string) => void;
  error?: string;
}
