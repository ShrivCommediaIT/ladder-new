import axiosInstance from "./axiosInstance";

export const getRequest = async (url, params = {}) => {
  const res = await axiosInstance.get(url, { params });
  return res.data;
};

export const postRequest = async (url, data = {}) => {
  const res = await axiosInstance.post(url, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
};

export const postWithParams = async (url, params = {}) => {
  const res = await axiosInstance.post(url, null, { params });
  return res.data;
};

export const postFormData = async (url, formData) => {
  const res = await axiosInstance.post(url, formData);
  return res.data;
};

export const postUrlEncoded = async (url, params) => {
  const res = await axiosInstance.post(url, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
};

export const putRequest = async (url, data = {}) => {
  const res = await axiosInstance.put(url, data);
  return res.data;
};

export const deleteRequest = async (url, params = {}) => {
  const res = await axiosInstance.delete(url, { params });
  return res.data;
};