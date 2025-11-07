import React from 'react';
import { useAuth } from "../context/AuthContext.jsx"; 
import { Navigate } from "react-router-dom";
import Loader from './Loader.jsx'; 

const ProtectedRoute = ({ children }) => {
   const { user, loading } = useAuth();
   if (loading) {
      return (
         <Loader message="Securing connection..." />
      );
   }
   if (!user) {
      return <Navigate to="/login" replace />;
   }
   return children;
};

export default ProtectedRoute;