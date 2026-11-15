import { createSlice } from "@reduxjs/toolkit";

export function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token) {
  const payload = parseJwtPayload(token);
  if (payload && typeof payload.exp === "number") {
    return payload.exp * 1000;
  }
  const stored = typeof window !== "undefined" ? localStorage.getItem("tokenExpiresAt") : null;
  if (stored) {
    const parsed = Date.parse(stored);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

export function isTokenValid(token) {
  if (!token || typeof token !== "string") return false;
  if (token.startsWith("demo-token")) return false;
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;
  return payload.exp * 1000 > Date.now();
}

const getInitialAuthState = () => {
  if (typeof window === "undefined") {
    return { user: null, token: null, refreshToken: null, expiresAt: null, isAuthenticated: false };
  }
  const token = localStorage.getItem("token");
  if (!isTokenValid(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpiresAt");
    localStorage.removeItem("user");
    return { user: null, token: null, refreshToken: null, expiresAt: null, isAuthenticated: false };
  }
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const refreshToken = localStorage.getItem("refreshToken");
  const expiresAt = localStorage.getItem("tokenExpiresAt");
  return {
    user,
    token,
    refreshToken,
    expiresAt,
    isAuthenticated: true,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialAuthState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken, expiresAt } = action.payload;
      state.user = user;
      state.token = token;
      if (refreshToken !== undefined) state.refreshToken = refreshToken;
      if (expiresAt !== undefined) state.expiresAt = expiresAt;
      state.isAuthenticated = isTokenValid(token);
      if (token && isTokenValid(token)) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (expiresAt) localStorage.setItem("tokenExpiresAt", expiresAt);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("tokenExpiresAt");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
