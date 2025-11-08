import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate, Outlet } from "react-router-dom"; 
import Loader from "./Loader.jsx";

const ProtectedRoute = () => { 
   const { user, loading } = useAuth();

   if (loading) return <Loader message="Checking authentication..." />;
   if (!user) return <Navigate to="/login" replace />;

   return <Outlet />;
};

export default ProtectedRoute;