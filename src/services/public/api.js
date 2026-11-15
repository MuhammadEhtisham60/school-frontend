import { isTokenValid } from "@/store/slices/authSlice";

let BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8000/api";
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}

const getAuthHeaders = (customHeaders = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const valid = token && isTokenValid(token);
  return {
    "Content-Type": "application/json",
    ...(valid ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };
};

const handleResponse = async (response) => {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    const errorMsg = data?.message || data?.detail || response.statusText || "An error occurred";
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  get: async (url, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      ...options,
      headers: getAuthHeaders(options.headers),
    });
    return handleResponse(response);
  },
  post: async (url, body, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
      headers: getAuthHeaders(options.headers),
    });
    return handleResponse(response);
  },
  put: async (url, body, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
      headers: getAuthHeaders(options.headers),
    });
    return handleResponse(response);
  },
  patch: async (url, body, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
      headers: getAuthHeaders(options.headers),
    });
    return handleResponse(response);
  },
  delete: async (url, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      ...options,
      headers: getAuthHeaders(options.headers),
    });
    return handleResponse(response);
  },
};
