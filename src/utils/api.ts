import { BASE_URL } from "@/constant/baseUrl";
import { ApiResponse } from "@/types/api";
import { handleApiError } from "./errorHandler";
import { getAccessToken } from "./storage";

/**
 * Helper untuk menambahkan header autentikasi
 */
export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };

  const token = getAccessToken();
  if (token) headers["x-outmanage-token"] = token;

  return headers;
};

/**
 * Membangun URL API lengkap dengan parameter query
 */
export const buildApiUrl = (path: string, params: Record<string, string | number | null | undefined> = {}): string => {
  // Konstruksi path lengkap
  const fullPath = path.startsWith(BASE_URL) ? path : path.startsWith("/") ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;

  // Filter parameter yang valid
  const validParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => [key, String(value)])
  );

  // Tanpa parameter, kembalikan path saja
  if (!Object.keys(validParams).length) return fullPath;

  // Tambahkan parameter ke URL
  const separator = fullPath.includes("?") ? "&" : "?";
  return `${fullPath}${separator}${new URLSearchParams(validParams)}`;
};

/**
 * Helper function untuk melakukan request API dengan autentikasi
 */
export const fetchApi = async (path: string, params: Record<string, string | number | null | undefined> = {}, options: RequestInit = {}): Promise<Response> => {
  const isExternalUrl = path.startsWith("http://") || path.startsWith("https://");
  const url = isExternalUrl && !path.startsWith(BASE_URL) ? path : buildApiUrl(path, params);

  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
};

/**
 * Fungsi generik untuk mengambil data dari API dan memproses respon
 */
export async function fetchApiData<T>(path: string, params: Record<string, string | number | null | undefined> = {}, options: RequestInit = {}, errorMessage = "An error occurred"): Promise<T> {
  const response = await fetchApi(path, params, options);

  if (!response.ok) {
    throw new Error(`Error fetching data: ${response.statusText}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success) {
    handleApiError(result, errorMessage);
  }

  if (!result.data) {
    throw new Error("Data is missing from response");
  }

  return result.data;
}
