// services/authService.js
// ✅ Auth-specific service calls using centralized apiService

import { postFormData, postRequest } from "./apiService";
import { API_ENDPOINTS } from "@/constants/api";

// 🔐 Login (multipart/form-data)
export const loginUser = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => formData.append(key, value));
  return await postFormData(API_ENDPOINTS.LOGIN, formData);
};

// 📝 Register (multipart/form-data)
export const registerUser = async (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => formData.append(key, value));
  return await postFormData(API_ENDPOINTS.REGISTER, formData);
};

// 🔐 Club / App-User Login (JSON)
export const loginClubUser = async ({ club_id, pin }) => {
  return await postRequest(API_ENDPOINTS.APP_USER_LOGIN, {
    login_id: club_id,
    password: pin,
    user_type: "admin",
  });
};