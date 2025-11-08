import axios from "axios";

const baseURL =
   import.meta.env.VITE_BACKEND_URL?.trim() || "http://localhost:5000/api";

const axiosInstance = axios.create({
   baseURL,
   withCredentials: true,
   headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
   },
});

export default axiosInstance;