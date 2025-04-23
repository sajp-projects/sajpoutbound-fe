// Helper untuk menambahkan header autentikasi
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");

  return {
    "Content-Type": "application/json",
    "x-outmanage-token": token || "",
  };
};

// Fungsi helper untuk melakukan fetch dengan autentikasi
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authHeaders = getAuthHeaders();

  // Menggabungkan headers yang sudah ada dengan headers autentikasi
  const headers = {
    ...authHeaders,
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
