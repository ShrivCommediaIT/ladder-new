// helper/helperApi.js
// ✅ Uses centralized apiService — no hardcoded URLs or APPKEY

import { postFormData } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

/**
 * Update ladder token for an admin.
 * Reads admin_id from sessionStorage.
 */
export const updateLadderToken = async (payload) => {
  const adminDetails = JSON.parse(sessionStorage.getItem("adminDetails"));

  const formData = new FormData();
  formData.append("admin_id", adminDetails.id);
  formData.append("token", 1);

  // Append any extra payload fields
  Object.entries(payload).forEach(([key, value]) => {
    formData.append(key, value);
  });

  try {
    const data = await postFormData(API_ENDPOINTS.UPDATE_LADDER_TOKEN, formData);
    return data;
  } catch (error) {
    console.error("Error updating ladder token:", error.response?.data || error.message);
    throw error;
  }
};