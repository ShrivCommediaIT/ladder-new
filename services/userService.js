// services/userService.js

import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from "./apiService";
import { API_ENDPOINTS } from "@/constants/api";

// 👤 Get all users
export const getUsers = async () => {
  return await getRequest(API_ENDPOINTS.USERS);
};

// ➕ Create user (POST)
export const createUser = async (data) => {
  return await postRequest(API_ENDPOINTS.USERS, data);
};

// ✏️ Update user (PUT)
export const updateUser = async (id, data) => {
  return await putRequest(`${API_ENDPOINTS.USERS}/${id}`, data);
};

// ❌ Delete user
export const deleteUser = async (id) => {
  return await deleteRequest(`${API_ENDPOINTS.USERS}/${id}`);
};