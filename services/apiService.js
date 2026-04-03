// services/apiService.js

import axiosInstance from "./axiosInstance";

// ✅ GET
export const getRequest = async (url, params = {}) => {
  const res = await axiosInstance.get(url, { params });
  return res.data;
};

// ✅ POST
export const postRequest = async (url, data = {}) => {
  const res = await axiosInstance.post(url, data);
  return res.data;
};

// ✅ PUT
export const putRequest = async (url, data = {}) => {
  const res = await axiosInstance.put(url, data);
  return res.data;
};

// ✅ DELETE
export const deleteRequest = async (url, params = {}) => {
  const res = await axiosInstance.delete(url, { params });
  return res.data;
};