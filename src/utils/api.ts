const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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
 * @param path Path API tanpa baseUrl
 * @param params Parameter query untuk URL
 * @returns URL lengkap dengan parameter
 */
export const buildApiUrl = (path: string, params: Record<string, string | number | null | undefined> = {}): string => {
  // Hapus parameter yang undefined atau null
  const validParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
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
 * @param path Path API tanpa baseUrl atau URL lengkap
 * @param params Parameter query untuk URL (jika path bukan URL lengkap)
 * @param options Opsi fetch request
 * @returns Response dari API
 */
export const fetchApi = async (path: string, params: Record<string, string | number | null | undefined> = {}, options: RequestInit = {}): Promise<Response> => {
  // Cek apakah path sudah berupa URL lengkap
  const isFullUrl = path.startsWith("http://") || path.startsWith("https://");
  const url = isFullUrl ? path : buildApiUrl(path, params);

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
