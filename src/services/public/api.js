// Mock API helper (no external API integration)
export const api = {
  get: async (url) => {
    return { success: true, url, data: [] };
  },
  post: async (url, body) => {
    return { success: true, url, data: body || {} };
  },
  put: async (url, body) => {
    return { success: true, url, data: body || {} };
  },
  patch: async (url, body) => {
    return { success: true, url, data: body || {} };
  },
  delete: async (url) => {
    return { success: true, url, data: null };
  },
};
