import { BASE_URL } from "@/constant/baseUrl";

/**
 * Helper untuk menambahkan header autentikasi
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "x-outmanage-token": token || "",
  };
};

/**
 * Membangun URL API lengkap dengan parameter query
 * @param path Path API (relatif atau dengan BASE_URL)
 * @param params Parameter query untuk URL
 * @returns URL lengkap dengan parameter
 */
export const buildApiUrl = (path: string, params: Record<string, string | number | null | undefined> = {}): string => {
  // Ekstrak path yang benar
  let fullPath = path;
  if (path.startsWith(BASE_URL)) {
    fullPath = path;
  } else if (path.startsWith("/")) {
    fullPath = `${BASE_URL}${path}`;
  } else {
    fullPath = `${BASE_URL}/${path}`;
  }

  // Filter dan konversi parameter valid
  const validParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => [key, String(value)])
  );

  // Tambahkan parameter ke URL
  if (Object.keys(validParams).length === 0) {
    return fullPath;
  }

  const separator = fullPath.includes("?") ? "&" : "?";
  return `${fullPath}${separator}${new URLSearchParams(validParams)}`;
};

/**
 * Helper function untuk melakukan request API dengan autentikasi
 * @param path Path API relatif atau lengkap
 * @param params Parameter query untuk URL
 * @param options Opsi fetch request
 * @returns Response dari API
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
