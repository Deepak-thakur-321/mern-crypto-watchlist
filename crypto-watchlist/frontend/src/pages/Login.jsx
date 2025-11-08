import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const Login = () => {
   const { login, user, error, clearError, loading } = useAuth();
   const navigate = useNavigate();

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm({
      mode: "onTouched",
      defaultValues: {
         email: "",
         password: "",
      },
   });

   // Redirect if already logged in
   useEffect(() => {
      if (user && !loading) {
         navigate("/dashboard", { replace: true });
      }
   }, [user, loading, navigate]);

   // Show error toast
   useEffect(() => {
      if (error) {
         toast.error(error);
         clearError();
      }
   }, [error, clearError]);

   const onSubmit = async (data) => {
      try {
         const result = await login({
            email: data.email.trim().toLowerCase(),
            password: data.password,
         });

         if (result?.success) {
            toast.success("Login successful!");
         } else {
            toast.error(result?.message || "Login failed");
         }
      } catch (err) {
         console.error("Login error:", err);
         toast.error(err?.message || "An unexpected error occurred");
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-300">Checking authentication...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 px-4">
         <div className="bg-slate-800/60 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
            {/* Header */}
            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
               </h2>
               <p className="text-gray-400 text-sm">
                  Sign in to access your watchlist
               </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               {/* Email Field */}
               <div>
                  <label
                     htmlFor="email"
                     className="block text-gray-300 mb-2 text-sm font-medium"
                  >
                     Email Address
                  </label>
                  <input
                     id="email"
                     type="email"
                     autoComplete="email"
                     className={`w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white border ${errors.email
                           ? "border-red-500 focus:ring-red-500"
                           : "border-slate-600 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 transition-all`}
                     placeholder="you@example.com"
                     {...register("email", {
                        required: "Email is required",
                        pattern: {
                           value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                           message: "Please enter a valid email address",
                        },
                     })}
                  />
                  {errors.email && (
                     <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <span>⚠</span>
                        {errors.email.message}
                     </p>
                  )}
               </div>

               {/* Password Field */}
               <div>
                  <label
                     htmlFor="password"
                     className="block text-gray-300 mb-2 text-sm font-medium"
                  >
                     Password
                  </label>
                  <input
                     id="password"
                     type="password"
                     autoComplete="current-password"
                     className={`w-full px-4 py-2.5 rounded-lg bg-slate-700 text-white border ${errors.password
                           ? "border-red-500 focus:ring-red-500"
                           : "border-slate-600 focus:ring-indigo-500"
                        } focus:outline-none focus:ring-2 transition-all`}
                     placeholder="••••••••"
                     {...register("password", {
                        required: "Password is required",
                        minLength: {
                           value: 6,
                           message: "Password must be at least 6 characters",
                        },
                     })}
                  />
                  {errors.password && (
                     <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <span>⚠</span>
                        {errors.password.message}
                     </p>
                  )}
               </div>

               {/* Submit Button */}
               <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg ${isSubmitting
                        ? "bg-indigo-600/50 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/50"
                     } text-white`}
               >
                  {isSubmitting ? (
                     <span className="flex items-center justify-center gap-2">
                        <svg
                           className="animate-spin h-5 w-5"
                           viewBox="0 0 24 24"
                           fill="none"
                        >
                           <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                           />
                           <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                           />
                        </svg>
                        Logging in...
                     </span>
                  ) : (
                     "Sign In"
                  )}
               </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
               <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <Link
                     to="/register"
                     className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                  >
                     Create Account
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
};

export default Login;