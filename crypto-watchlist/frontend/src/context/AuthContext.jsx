import React, { createContext, useContext, useReducer, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const initialState = {
   user: null,
   loading: true,
   error: null,
};

function reducer(state, action) {
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

export const AuthProvider = ({ children }) => {
   const [state, dispatch] = useReducer(reducer, initialState);

   // Fetch profile on mount
   useEffect(() => {
      const fetchProfile = async () => {
         console.log("🔵 Fetching user profile...");
         dispatch({ type: "LOADING" });

         try {
            const { data } = await axiosInstance.get("/api/users/profile");

            console.log("✅ Profile fetched:", data);

            if (data?.user) {
               dispatch({ type: "SET_USER", payload: data.user });
            } else {
               dispatch({ type: "LOGOUT" });
            }
         } catch (err) {
            console.warn("⚠️ Profile fetch failed:", err.response?.data || err.message);
            dispatch({ type: "LOGOUT" });
         }
      };

      fetchProfile();
   }, []);

   // Login
   const login = async (credentials) => {
      console.log("🔵 Login request:", credentials.email);
      dispatch({ type: "LOADING" });

      try {
         const { data } = await axiosInstance.post("/api/auth/login", credentials);

         console.log("✅ Login response:", data);

         dispatch({ type: "SET_USER", payload: data.user });
         return { success: true };
      } catch (err) {
         console.error("❌ Login failed:", err.response?.data || err.message);

         const msg = err.response?.data?.message || "Login failed";
         dispatch({ type: "SET_ERROR", payload: msg });
         return { success: false, message: msg };
      }
   };

   // Register
   const register = async (formData) => {
      console.log("🔵 Register request:", formData.email);
      dispatch({ type: "LOADING" });

      try {
         const { data } = await axiosInstance.post("/api/auth/register", formData);

         console.log("✅ Register response:", data);

         dispatch({ type: "SET_USER", payload: data.user });
         return { success: true };
      } catch (err) {
         console.error("❌ Register failed:", err.response?.data || err.message);

         const msg = err.response?.data?.message || "Registration failed";
         dispatch({ type: "SET_ERROR", payload: msg });
         return { success: false, message: msg };
      }
   };

   // Logout
   const logout = async () => {
      console.log("🔵 Logout request");

      try {
         await axiosInstance.post("/api/auth/logout");
         console.log("✅ Logout successful");
      } catch (err) {
         console.warn("⚠️ Logout API failed:", err.message);
      } finally {
         dispatch({ type: "LOGOUT" });
      }
   };

   const clearError = () => dispatch({ type: "SET_ERROR", payload: null });

   return (
      <AuthContext.Provider value={{
         user: state.user,
         loading: state.loading,
         error: state.error,
         login,
         register,
         logout,
         clearError,
         isAuthenticated: !!state.user,
      }}>
         {children}
      </AuthContext.Provider>
   );
};