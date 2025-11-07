// src/pages/Login.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const Login = () => {
   const { login, user, error, clearError } = useAuth();
   const navigate = useNavigate();

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm({
      mode: "onTouched",
   });

   useEffect(() => {
      if (user) navigate("/dashboard");
   }, [user, navigate]);

   useEffect(() => {
      if (error) {
         toast.error(error);
         clearError();
      }
   }, [error, clearError]);

   const onSubmit = async (data) => {
      try {
         await login(data.email, data.password);
      } catch (err) {
         toast.error(err?.message || "Invalid credentials.");
      }
   };
   return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4">
         <div className="bg-slate-800/60 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
            <h2 className="text-3xl font-bold text-center text-white mb-6">
               Welcome Back
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               {/* Email */}
               <div>
                  <label className="block text-gray-300 mb-2 text-sm">Email</label>
                  <input
                     type="email"
                     className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Enter your email"
                     {...register("email", {
                        required: "Email is required",
                        pattern: {
                           value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                           message: "Enter a valid email address",
                        },
                     })}
                  />
                  {errors.email && (
                     <p className="text-red-500 text-sm mt-1">
                        {errors.email.message}
                     </p>
                  )}
               </div>

               {/* Password */}
               <div>
                  <label className="block text-gray-300 mb-2 text-sm">Password</label>
                  <input
                     type="password"
                     className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="Enter your password"
                     {...register("password", {
                        required: "Password is required",
                        minLength: {
                           value: 6,
                           message: "Password must be at least 6 characters",
                        },
                     })}
                  />
                  {errors.password && (
                     <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                     </p>
                  )}
               </div>

               <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 ${isSubmitting
                     ? "bg-indigo-600/60 cursor-not-allowed"
                     : "bg-indigo-600 hover:bg-indigo-700"
                     } text-white shadow-md`}
               >
                  {isSubmitting ? "Logging in..." : "Login"}
               </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
               Don’t have an account?{" "}
               <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
                  Register
               </Link>
            </p>
         </div>
      </div>
   );
};

export default Login;
