import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const PasswordRequirements = ({ password }) => {
   const tests = [
      { label: "At least 8 characters", ok: password.length >= 8 },
      { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
      { label: "One number", ok: /\d/.test(password) },
   ];

   return (
      <div className="mt-3 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
         <p className="text-xs font-semibold text-slate-300 mb-2">Password Requirements:</p>
         <ul className="space-y-1.5">
            {tests.map((t) => (
               <li
                  key={t.label}
                  className={`flex items-center gap-2 text-xs transition-colors ${t.ok ? "text-emerald-400" : "text-slate-400"
                     }`}
               >
                  {t.ok ? (
                     <FaCheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  ) : (
                     <FaTimesCircle className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                  )}
                  <span>{t.label}</span>
               </li>
            ))}
         </ul>
      </div>
   );
};

export default function Register() {
   const { register: registerAction, user, error, loading } = useAuth();
   // Get referral code from URL
   const searchParams = new URLSearchParams(window.location.search);
   const refCode = searchParams.get('ref');

   const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
      mode: "onTouched",
      defaultValues: {
         name: "",
         email: "",
         password: "",
         referralCode: refCode || ""
      },
   });

   const navigate = useNavigate();
   const [showPassword, setShowPassword] = useState(false);

   const passwordValue = watch("password", "");

   useEffect(() => {
      if (user) {
         toast.success("Registration successful — welcome! 🎉");
         navigate("/dashboard", { replace: true });
      }
   }, [user, navigate]);

   useEffect(() => {
      if (error) {
         toast.error(error);
      }
   }, [error]);

   const onSubmit = async (formData) => {
      try {
         await registerAction(formData);
      } catch (err) {
         toast.error("Registration failed. Please try again.");
      }
   };


   if (loading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-300 font-medium">Checking authentication...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center p-6">
         {/* Background decoration */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
         </div>

         <div className="relative w-full max-w-md">
            {/* Card */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8">
               {/* Header */}
               <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                     <FaUser className="text-white text-2xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                     Create Account
                  </h1>
                  <p className="text-slate-400 text-sm">
                     Join us and start tracking your watchlist
                  </p>
               </div>

               <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name Field */}
                  <div>
                     <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-slate-300 mb-2"
                     >
                        Full Name
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <FaUser className="text-slate-500" />
                        </div>
                        <input
                           id="name"
                           type="text"
                           placeholder="John Doe"
                           autoComplete="name"
                           {...register("name", {
                              required: "Name is required",
                              minLength: { value: 2, message: "Name must be at least 2 characters" }
                           })}
                           className={`w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border ${errors.name
                              ? "border-red-500 focus:ring-red-500"
                              : "border-slate-600 focus:ring-indigo-500"
                              } focus:outline-none focus:ring-2 transition-all`}
                           aria-invalid={errors.name ? "true" : "false"}
                        />
                     </div>
                     {errors.name && (
                        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                           <span>⚠</span> {errors.name.message}
                        </p>
                     )}
                  </div>

                  {/* Email Field */}
                  <div>
                     <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-slate-300 mb-2"
                     >
                        Email Address
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <FaEnvelope className="text-slate-500" />
                        </div>
                        <input
                           id="email"
                           type="email"
                           placeholder="you@example.com"
                           autoComplete="email"
                           {...register("email", {
                              required: "Email is required",
                              pattern: {
                                 value: /^\S+@\S+\.\S+$/,
                                 message: "Enter a valid email address"
                              },
                           })}
                           className={`w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border ${errors.email
                              ? "border-red-500 focus:ring-red-500"
                              : "border-slate-600 focus:ring-indigo-500"
                              } focus:outline-none focus:ring-2 transition-all`}
                           aria-invalid={errors.email ? "true" : "false"}
                        />
                     </div>
                     {errors.email && (
                        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                           <span>⚠</span> {errors.email.message}
                        </p>
                     )}
                  </div>

                  {/* Password Field */}
                  <div>
                     <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-slate-300 mb-2"
                     >
                        Password
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <FaLock className="text-slate-500" />
                        </div>
                        <input
                           id="password"
                           type={showPassword ? "text" : "password"}
                           placeholder="Create a strong password"
                           autoComplete="new-password"
                           {...register("password", {
                              required: "Password is required",
                              minLength: {
                                 value: 8,
                                 message: "Password must be at least 8 characters"
                              },
                              validate: {
                                 hasUpper: (v) => /[A-Z]/.test(v) || "Must contain uppercase letter",
                                 hasNumber: (v) => /\d/.test(v) || "Must contain a number",
                              },
                           })}
                           className={`w-full pl-10 pr-12 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border ${errors.password
                              ? "border-red-500 focus:ring-red-500"
                              : "border-slate-600 focus:ring-indigo-500"
                              } focus:outline-none focus:ring-2 transition-all`}
                           aria-invalid={errors.password ? "true" : "false"}
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors"
                           aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                           {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                     </div>
                     {errors.password && (
                        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                           <span>⚠</span> {errors.password.message}
                        </p>
                     )}

                     {/* Password Requirements */}
                     {passwordValue && <PasswordRequirements password={passwordValue} />}
                  </div>

                  {/* Submit Button */}
                  <button
                     type="submit"
                     disabled={isSubmitting || loading}
                     className={`w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-all duration-200 ${isSubmitting || loading
                        ? "bg-indigo-600/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl transform hover:-translate-y-0.5"
                        }`}
                  >
                     {isSubmitting || loading ? (
                        <span className="flex items-center justify-center gap-2">
                           <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                              <circle
                                 className="opacity-25"
                                 cx="12"
                                 cy="12"
                                 r="10"
                                 stroke="currentColor"
                                 strokeWidth="4"
                                 fill="none"
                              />
                              <path
                                 className="opacity-75"
                                 fill="currentColor"
                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                           </svg>
                           Creating Account...
                        </span>
                     ) : (
                        "Create Account"
                     )}
                  </button>
               </form>

               {/* Footer Links */}
               <div className="mt-6 text-center">
                  <p className="text-sm text-slate-400">
                     Already have an account?{" "}
                     <Link
                        to="/login"
                        className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                     >
                        Sign In
                     </Link>
                  </p>
               </div>

               {/* Terms */}
               <div className="mt-6 text-center">
                  <p className="text-xs text-slate-500">
                     By signing up, you agree to our{" "}
                     <button className="underline hover:text-slate-400 transition-colors">
                        Terms of Service
                     </button>
                     {" "}and{" "}
                     <button className="underline hover:text-slate-400 transition-colors">
                        Privacy Policy
                     </button>
                  </p>
               </div>
            </div>

            {/* Bottom gradient decoration */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 blur-xl"></div>
         </div>
      </div>
   );
}