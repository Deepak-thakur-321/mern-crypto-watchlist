// src/api/axiosInstance.js
import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

console.log("🔧 Axios baseURL:", baseURL);

const axiosInstance = axios.create({
   baseURL,
   withCredentials: true, // ⭐ Most important
   headers: {
      "Content-Type": "application/json",
   },
});

// Debug interceptor
axiosInstance.interceptors.request.use((config) => {
  console.log("🔵 Request:", config.method.toUpperCase(), config.url);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Error:", error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default axiosInstance;