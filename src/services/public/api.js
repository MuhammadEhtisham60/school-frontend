let BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api";
if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText || 'An error occurred';
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
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    return handleResponse(response);
  },
  post: async (url, body, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(response);
  },
  put: async (url, body, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(response);
  },
  patch: async (url, body, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(body),
      ...options,
    });
    return handleResponse(response);
  },
  delete: async (url, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    return handleResponse(response);
  },
};
