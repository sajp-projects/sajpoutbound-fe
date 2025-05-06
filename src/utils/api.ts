import { BASE_URL } from "@/constant/baseUrl";
import { ApiResponse } from "@/types/api";
import { handleApiError } from "./errorHandler";
import { getAccessToken } from "./storage";


export const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };

  const token = getAccessToken();
  if (token) headers["x-outmanage-token"] = token;

  return headers;
};


export const buildApiUrl = (path: string, params: Record<string, string | number | null | undefined> = {}): string => {
  
  const fullPath = path.startsWith(BASE_URL) ? path : path.startsWith("/") ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;

  
  const validParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) => [key, String(value)])
  );

  
  if (!Object.keys(validParams).length) return fullPath;

  
  const separator = fullPath.includes("?") ? "&" : "?";
  return `${fullPath}${separator}${new URLSearchParams(validParams)}`;
};


export const fetchApi = async (path: string, params: Record<string, string | number | null | undefined> = {}, options: RequestInit = {}): Promise<Response> => {
  const isExternalUrl = path.startsWith("http:
  const url = isExternalUrl && !path.startsWith(BASE_URL) ? path : buildApiUrl(path, params);

  return fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });
};


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
