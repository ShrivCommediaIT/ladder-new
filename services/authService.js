// services/authService.js

import { postRequest } from "./apiService";
import { API_ENDPOINTS } from "@/constants/api";

// 🔐 Login
export const loginUser = async (data) => {
  return await postRequest(API_ENDPOINTS.LOGIN, data);
};

// 📝 Register
export const registerUser = async (data) => {
  return await postRequest(API_ENDPOINTS.REGISTER, data);
};