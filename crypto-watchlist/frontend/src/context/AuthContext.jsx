import { createContext, useContext, useReducer, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

// ---------------- Reducer ----------------
const initialState = {
   user: null,
   loading: true,
   error: null,
};

function authReducer(state, action) {
   switch (action.type) {
      case "SET_USER":
         return { ...state, user: action.payload, loading: false, error: null };
      case "LOGOUT":
         return { ...state, user: null, loading: false, error: null };
      case "SET_ERROR":
         return { ...state, error: action.payload, loading: false };
      case "LOADING":
         return { ...state, loading: true, error: null };
      default:
         return state;
   }
}

// ---------------- Context ----------------
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
   const [state, dispatch] = useReducer(authReducer, initialState);

   // ✅ Fetch user profile if session cookie or token exists
   useEffect(() => {
      const fetchProfile = async () => {
         try {
            const { data } = await axiosInstance.get("/users/profile");
            dispatch({ type: "SET_USER", payload: data.user });
         } catch (error) {
            console.warn("Profile fetch failed:", error.response?.data || error.message);
            dispatch({ type: "LOGOUT" });
         }
      };
      fetchProfile();
   }, []);

   // ✅ Login
   const login = async (credentials) => {
      dispatch({ type: "LOADING" });
      try {
         const { data } = await axiosInstance.post("/auth/login", credentials);
         localStorage.setItem("token", data.token);
         dispatch({ type: "SET_USER", payload: data.user });
      } catch (error) {
         const message = error.response?.data?.message || "Login failed. Please try again.";
         dispatch({ type: "SET_ERROR", payload: message });
      }
   };

   // ✅ Register
   const register = async (formData) => {
      dispatch({ type: "LOADING" });
      try {
         const { data } = await axiosInstance.post("/auth/register", formData);
         localStorage.setItem("token", data.token);
         dispatch({ type: "SET_USER", payload: data.user });
      } catch (error) {
         const message = error.response?.data?.message || "Registration failed. Please try again.";
         dispatch({ type: "SET_ERROR", payload: message });
      }
   };

   // ✅ Logout
   const logout = async () => {
      try {
         await axiosInstance.post("/auth/logout");
         localStorage.removeItem("token");
         dispatch({ type: "LOGOUT" });
      } catch (error) {
         console.error("Logout failed:", error);
      }
   };

   // ✅ Clear error manually (for UX)
   const clearError = () => dispatch({ type: "SET_ERROR", payload: null });

   const value = {
      user: state.user,
      loading: state.loading,
      error: state.error,
      login,
      register,
      logout,
      clearError,
      isAuthenticated: !!state.user,
   };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
