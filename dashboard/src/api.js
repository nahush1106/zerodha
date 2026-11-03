import axios from "axios";

import { API_URL } from "./config";
import { getToken, logout } from "./auth";

const api = axios.create({ baseURL: API_URL });

// Attach the token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the backend says the token is bad or expired, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) logout();
    return Promise.reject(error);
  }
);

export default api;
