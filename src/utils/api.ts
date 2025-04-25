import { getAuthHeaders } from "./fetch";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/**
 * Membangun URL API lengkap dengan parameter query
 * @param path Path API tanpa baseUrl
 * @param params Parameter query untuk URL
 * @returns URL lengkap dengan parameter
 */
export const buildApiUrl = (path: string, params: Record<string, string | number | null | undefined> = {}): string => {
  // Hapus parameter yang undefined atau null
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>);

  // Buat query string
  const queryString = new URLSearchParams(validParams).toString();

  // Buat URL lengkap
  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;
};

/**
 * Helper function untuk melakukan request API dengan autentikasi
 */
export const fetchApi = async (path: string, params: Record<string, string | number | null | undefined> = {}, options: RequestInit = {}): Promise<Response> => {
  const url = buildApiUrl(path, params);
  const authHeaders = getAuthHeaders();

  const headers = {
    ...authHeaders,
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
