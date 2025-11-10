import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || "http://localhost:5000";

const axiosInstance = axios.create({
   baseURL,
   withCredentials: true,
   headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
   },
});

export default axiosInstance;