import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
// import { useAuth } from './AuthContext';

// Context setup

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);


// Initial State & Reducer
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


// Provider Component

export const AuthProvider = ({ children }) => {
   const [state, dispatch] = useReducer(reducer, initialState);


   // Fetch user profile
   useEffect(() => {
      const fetchProfile = async () => {
         dispatch({ type: "LOADING" });
         try {
            const { data } = await axiosInstance.get("/api/users/profile", {
               withCredentials: true,
            });
            if (data?.user) {
               dispatch({ type: "SET_USER", payload: data.user });
            } else {
               dispatch({ type: "LOGOUT" });
            }
         } catch (err) {
            console.warn("Profile fetch failed:", err.response?.data || err.message);
            dispatch({ type: "LOGOUT" });
         }
      };

      fetchProfile();
   }, []);



   // Login User

   const login = async (credentials) => {
      dispatch({ type: "LOADING" });
      try {
         const { data } = await axiosInstance.post("/api/auth/login", credentials, {
            withCredentials: true,
         });
         dispatch({ type: "SET_USER", payload: data.user });
         return { success: true };
      } catch (err) {
         const msg = err.response?.data?.message || "Login failed";
         dispatch({ type: "SET_ERROR", payload: msg });
         return { success: false, message: msg };
      }
   };


   // Register User

   const register = async (formData) => {
      dispatch({ type: "LOADING" });
      try {
         const { data } = await axiosInstance.post("/api/auth/register", formData, {
            withCredentials: true,
         });
         dispatch({ type: "SET_USER", payload: data.user });
         return { success: true };
      } catch (err) {
         const msg = err.response?.data?.message || "Registration failed";
         dispatch({ type: "SET_ERROR", payload: msg });
         return { success: false, message: msg };
      }
   };


   // Logout User

   const logout = async () => {
      try {
         await axiosInstance.post("/api/auth/logout", {}, { withCredentials: true });
      } catch (err) {
         console.warn("Logout API failed:", err.message);
      } finally {
         dispatch({ type: "LOGOUT" });
      }
   };

   const clearError = useCallback(() => dispatch({ type: "SET_ERROR", payload: null }), []);

   const contextValue = {
      user: state.user,
      loading: state.loading,
      error: state.error,
      login,
      register,
      logout,
      clearError,
      isAuthenticated: !!state.user,
   };

   return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
