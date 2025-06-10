import { Tokens, User } from '@/types/auth';

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

const storage = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
  clear: () => localStorage.clear(),
};

export const saveAuthData = (user: User, tokens: Tokens): void => {
  storage.set(KEYS.ACCESS_TOKEN, tokens.accessToken);
  storage.set(KEYS.USER, JSON.stringify(user));
};

export const clearAuthData = (): void => {
  storage.remove(KEYS.ACCESS_TOKEN);
  storage.remove(KEYS.REFRESH_TOKEN);
  storage.remove(KEYS.USER);
};

export const getAccessToken = (): string | null =>
  storage.get(KEYS.ACCESS_TOKEN);

export const getRefreshToken = (): string | null =>
  storage.get(KEYS.REFRESH_TOKEN);

export const getUser = (): User | null => {
  const userData = storage.get(KEYS.USER);
  if (!userData) return null;

  try {
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => !!(getAccessToken() && getUser());

export const getRoleId = (): string | null => getUser()?.roleId || null;
