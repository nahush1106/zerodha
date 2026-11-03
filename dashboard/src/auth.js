import { FRONTEND_URL } from "./config";

const TOKEN_KEY = "zerodha_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export function logout() {
  clearToken();
  window.location.href = `${FRONTEND_URL}/login`;
}

// Call once before the app renders.
// 1. If the frontend sent us here with ?token=..., save it and clean the URL.
// 2. If there is still no token, send the user to the login page.
export function initAuth() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    setToken(token);
    params.delete("token");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : "") + window.location.hash
    );
  }

  if (!getToken()) {
    window.location.href = `${FRONTEND_URL}/login`;
    return false;
  }
  return true;
}
