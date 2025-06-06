import { BASE_URL } from "@/constant/baseUrl";
import { getAccessToken } from "./storage";

export const getAuthHeaders = (isFileUpload: boolean = false): HeadersInit => {
  const headers: HeadersInit = {};

  // Hanya tambahkan Content-Type jika bukan file upload
  if (!isFileUpload) {
    headers["Content-Type"] = "application/json";
  }

  const token = getAccessToken();
  if (token) headers["x-outmanage-token"] = token;

  return headers;
};

export const buildApiUrl = (
  path: string,
  params: Record<string, string | number | null | undefined> = {}
): string => {
  let apiPath = path;
  if (path.startsWith("/api") && BASE_URL.endsWith("/api")) {
    apiPath = path.substring(4);
  }

  const fullPath = apiPath.startsWith(BASE_URL)
    ? apiPath
    : apiPath.startsWith("/")
    ? `${BASE_URL}${apiPath}`
    : `${BASE_URL}/${apiPath}`;

  const validParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => [key, String(value)])
  );

  if (!Object.keys(validParams).length) return fullPath;

  const separator = fullPath.includes("?") ? "&" : "?";
  return `${fullPath}${separator}${new URLSearchParams(validParams)}`;
};

export const fetchApi = async (
  path: string,
  params: Record<string, string | number | null | undefined> = {},
  options: RequestInit = {}
): Promise<Response> => {
  const isExternalUrl =
    path.startsWith("http://") || path.startsWith("https://");
  const url =
    isExternalUrl && !path.startsWith(BASE_URL)
      ? path
      : buildApiUrl(path, params);

  // Deteksi apakah ini file upload berdasarkan body
  const isFileUpload = options.body instanceof FormData;

  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(isFileUpload),
      ...(options.headers || {}),
    },
  });
};
