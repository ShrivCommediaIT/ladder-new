// services/axiosInstance.js
// ✅ Single axios instance — baseURL & APPKEY come from .env.local

import axios from "axios";
import { BASE_URL, APPKEY } from "@/constants/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ──────────────────────────────────────────────────────────
// REQUEST interceptor
//  - Attaches APPKEY header on every request
//  - Does NOT set Content-Type globally so FormData works fine
// ──────────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // APPKEY is required by all endpoints
    config.headers["APPKEY"] = APPKEY;

    // Optional Bearer token (for future protected routes)
    if (typeof window !== "undefined") {
      const admin = JSON.parse(sessionStorage.getItem("userData") || "null");
      const subAdmin = JSON.parse(sessionStorage.getItem("subAdmin") || "null");
      const token = admin?.token || subAdmin?.token;
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────────────────
// RESPONSE interceptor — global error handling
// ──────────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — clear session if needed");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;