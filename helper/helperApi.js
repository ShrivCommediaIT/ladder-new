import axios from 'axios';

// Base configuration
const API_BASE_URL = 'https://ne-games.com/leaderBoard/api';
const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";
// Common headers
const headers = {
  'APPKEY': APPKEY,
  'Content-Type': 'multipart/form-data',   
};

export const updateLadderToken = async (payload) => {

    const adminDetails = JSON.parse(localStorage.getItem("adminDetails"));
    payload.admin_id = adminDetails.id
    payload.token = 1
    
  try {
    const response = await axios.post(
      `${API_BASE_URL}/user/updateLadderToken`,
      payload,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating ladder token:', error.response?.data || error.message);
    throw error; 
  }
};