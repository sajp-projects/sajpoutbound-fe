import { BASE_URL } from "@/constant/baseUrl";
import { axiosInstance } from "./axios";
import { AxiosRequestConfig, Method } from "axios";

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

  // Untuk external URL yang bukan dari base URL kita, gunakan fetch biasa
  if (isExternalUrl && !path.startsWith(BASE_URL)) {
    return fetch(path, options);
  }

  // Convert RequestInit to AxiosRequestConfig
  const axiosConfig: AxiosRequestConfig = {
    method: (options.method || "GET") as Method,
    url: path,
    params,
  };

  // Handle body
  if (options.body) {
    if (options.body instanceof FormData) {
      axiosConfig.data = options.body;
      axiosConfig.headers = {
        ...axiosConfig.headers,
        "Content-Type": "multipart/form-data",
      };
    } else if (typeof options.body === "string") {
      axiosConfig.data = JSON.parse(options.body);
    } else {
      axiosConfig.data = options.body;
    }
  }

  // Handle additional headers
  if (options.headers) {
    axiosConfig.headers = {
      ...axiosConfig.headers,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(options.headers as any),
    };
  }

  try {
    const response = await axiosInstance(axiosConfig);

    // Convert axios response to fetch-like response
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: async () => response.data,
      text: async () => JSON.stringify(response.data),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      headers: response.headers as any,
    } as Response;
  } catch (error: unknown) {
    // Convert axios error to fetch-like error
    const axiosError = error as {
      response?: {
        status: number;
        statusText: string;
        data: unknown;
        headers: unknown;
      };
    };
    if (axiosError.response) {
      return {
        ok: false,
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        json: async () => axiosError.response!.data,
        text: async () => JSON.stringify(axiosError.response!.data),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headers: axiosError.response.headers as any,
      } as Response;
    }
    throw error;
  }
};
