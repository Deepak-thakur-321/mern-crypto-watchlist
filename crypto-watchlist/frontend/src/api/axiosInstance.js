import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
   baseURL,
   headers: {
      "Content-Type": "application/json",
   },
   withCredentials: true, // ✅ allows cookies/session sharing (safe to keep even for JWT)
});

// ✅ Attach JWT token automatically
axiosInstance.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem("token");
      if (token) {
         config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
   },
   (error) => Promise.reject(error)
);

// ✅ Handle expired tokens globally
axiosInstance.interceptors.response.use(
   (response) => response,
   (error) => {
      if (error.response && error.response.status === 401) {
         localStorage.removeItem("token");
         window.location.href = "/login";
      }
      return Promise.reject(error);
   }
);

export default axiosInstance;
