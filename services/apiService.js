// services/apiService.js
// ✅ Common helper functions for all API calls.
//    All slices should use these instead of calling axios directly.

import axiosInstance from "./axiosInstance";

// ─────────────────────────────────────────────────────
// GET  — with optional query params
// ─────────────────────────────────────────────────────
export const getRequest = async (url, params = {}) => {
  const res = await axiosInstance.get(url, { params });
  return res.data;
};

// ─────────────────────────────────────────────────────
// POST — JSON body
// ─────────────────────────────────────────────────────
export const postRequest = async (url, data = {}) => {
  const res = await axiosInstance.post(url, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

// ─────────────────────────────────────────────────────
// POST — multipart/form-data (file uploads, FormData)
//   Axios auto-sets the correct Content-Type + boundary
//   when it detects a FormData object.
// ─────────────────────────────────────────────────────
export const postFormData = async (url, formData) => {
  const res = await axiosInstance.post(url, formData);
  return res.data;
};

// ─────────────────────────────────────────────────────
// PUT — JSON body
// ─────────────────────────────────────────────────────
export const putRequest = async (url, data = {}) => {
  const res = await axiosInstance.put(url, data);
  return res.data;
};

// ─────────────────────────────────────────────────────
// DELETE — with optional query params
// ─────────────────────────────────────────────────────
export const deleteRequest = async (url, params = {}) => {
  const res = await axiosInstance.delete(url, { params });
  return res.data;
};