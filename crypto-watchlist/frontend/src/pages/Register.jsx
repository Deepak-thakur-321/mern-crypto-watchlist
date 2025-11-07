import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PasswordRequirements = ({ password }) => {
   const tests = [
      { label: "At least 8 characters", ok: password.length >= 8 },
      { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
      { label: "One number", ok: /\d/.test(password) },
   ];

   return (
      <ul className="mt-2 space-y-1 text-sm">
         {tests.map((t) => (
            <li key={t.label} className={`flex items-center gap-2 ${t.ok ? "text-green-600" : "text-gray-500"}`}>
               <svg
                  className={`w-4 h-4 shrink-0 ${t.ok ? "opacity-100" : "opacity-30"}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
               >
                  {t.ok ? (
                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 01.083 1.32l-.083.094L8 15l-4.707-4.707a1 1 0 011.32-1.497l.094.083L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  ) : (
                     <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11H9v4h2V7zm0 6H9v2h2v-2z" />
                  )}
               </svg>
               <span>{t.label}</span>
            </li>
         ))}
      </ul>
   );
};

export default function Register() {
   const { register: registerAction, user, error, loading } = useAuth();
   const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
      mode: "onTouched",
      defaultValues: { name: "", email: "", password: "" },
   });

   const navigate = useNavigate();
   const [showPassword, setShowPassword] = useState(false);

   const passwordValue = watch("password", "");

   // If user becomes logged-in (AuthContext sets user), redirect to dashboard
   useEffect(() => {
      if (user) {
         toast.success("Registration successful — welcome!");
         navigate("/", { replace: true });
      }
   }, [user, navigate]);

   // If AuthContext has an error, show toast
   useEffect(() => {
      if (error) {
         toast.error(error);
      }
   }, [error]);

   const onSubmit = async (formData) => {
      await registerAction(formData);
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center p-6">
         <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">
            <div className="mb-6 text-center">
               <h1 className="text-3xl font-extrabold text-slate-800">Create your account</h1>
               <p className="text-slate-500 mt-1">Quick setup — secure authentication powered by HttpOnly cookies</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
               {/* Name */}
               <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full name</span>
                  <input
                     type="text"
                     placeholder="Your full name"
                     {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name must be at least 2 characters" } })}
                     className={`mt-2 w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.name ? "border-red-300" : "border-slate-200"}`}
                     aria-invalid={errors.name ? "true" : "false"}
                     aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && <p id="name-error" className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
               </label>

               {/* Email */}
               <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email address</span>
                  <input
                     type="email"
                     placeholder="you@example.com"
                     {...register("email", {
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                     })}
                     className={`mt-2 w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.email ? "border-red-300" : "border-slate-200"}`}
                     aria-invalid={errors.email ? "true" : "false"}
                     aria-describedby={errors.email ? "email-error" : undefined}
                  />
                  {errors.email && <p id="email-error" className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
               </label>

               {/* Password */}
               <label className="block">
                  <div className="flex justify-between items-center">
                     <span className="text-sm font-medium text-slate-700">Password</span>
                     <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                     >
                        {showPassword ? "Hide" : "Show"}
                     </button>
                  </div>

                  <div className="relative mt-2">
                     <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        {...register("password", {
                           required: "Password is required",
                           minLength: { value: 8, message: "Password must be at least 8 characters" },
                           validate: {
                              hasUpper: (v) => /[A-Z]/.test(v) || "Password must contain at least one uppercase letter",
                              hasNumber: (v) => /\d/.test(v) || "Password must contain at least one number",
                           },
                        })}
                        className={`w-full rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.password ? "border-red-300" : "border-slate-200"}`}
                        aria-invalid={errors.password ? "true" : "false"}
                        aria-describedby={errors.password ? "password-error" : undefined}
                     />
                  </div>

                  {errors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{errors.password.message}</p>}

                  <PasswordRequirements password={passwordValue} />
               </label>

               {/* Submit */}
               <div>
                  <button
                     type="submit"
                     disabled={isSubmitting || loading}
                     className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold transition ${isSubmitting || loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                  >
                     {isSubmitting || loading ? (
                        <>
                           <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                           </svg>
                           Creating...
                        </>
                     ) : (
                        "Create account"
                     )}
                  </button>
               </div>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
               Already have an account?{" "}
               <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                  Sign in
               </Link>
            </div>

            <div className="mt-6 text-xs text-slate-400 text-center">
               By signing up you agree to our <span className="underline">Terms</span> & <span className="underline">Privacy</span>.
            </div>
         </div>
      </div>
   );
}
