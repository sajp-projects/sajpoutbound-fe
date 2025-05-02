import { User, Tokens } from "@/types/auth";

/**
 * Helper untuk operasi localStorage
 */

// Keys untuk localStorage
const KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
};

// Helper dasar untuk localStorage
const storage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

/**
 * Menyimpan data autentikasi (user dan tokens) ke localStorage
 */
export const saveAuthData = (user: User, tokens: Tokens): void => {
  storage.set(KEYS.ACCESS_TOKEN, tokens.accessToken);
  storage.set(KEYS.REFRESH_TOKEN, tokens.refreshToken);
  storage.set(KEYS.USER, JSON.stringify(user));
};

/**
 * Menghapus semua data autentikasi dari localStorage
 */
export const clearAuthData = (): void => {
  storage.remove(KEYS.ACCESS_TOKEN);
  storage.remove(KEYS.REFRESH_TOKEN);
  storage.remove(KEYS.USER);
};

/**
 * Mendapatkan token akses dari localStorage
 */
export const getAccessToken = (): string | null => storage.get(KEYS.ACCESS_TOKEN);

/**
 * Mendapatkan token refresh dari localStorage
 */
export const getRefreshToken = (): string | null => storage.get(KEYS.REFRESH_TOKEN);

/**
 * Mendapatkan data user dari localStorage
 */
export const getUser = (): User | null => {
  const userData = storage.get(KEYS.USER);
  if (!userData) return null;

  try {
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

/**
 * Memeriksa apakah user terautentikasi berdasarkan data di localStorage
 */
export const isAuthenticated = (): boolean => !!(getAccessToken() && getUser());

/**
 * Mendapatkan ID role dari user yang terautentikasi
 */
export const getRoleId = (): string | null => getUser()?.roleId || null;
