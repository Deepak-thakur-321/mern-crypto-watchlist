import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// import { motion } from "framer-motion";

const NotFound = () => {
   const navigate = useNavigate();
   const { user } = useAuth();

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6">
         <div className="text-center max-w-lg">
            <motion.h1
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
               className="text-7xl font-extrabold mb-4 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
            >
               404
            </motion.h1>

            <motion.h2
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3, duration: 0.6 }}
               className="text-2xl font-semibold mb-3"
            >
               Page Not Found
            </motion.h2>

            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.6 }}
               className="text-slate-400 mb-8 text-sm leading-relaxed"
            >
               The page you’re looking for doesn’t exist or may have been moved.
               Don’t worry — let’s get you back on track.
            </motion.p>

            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.7, duration: 0.6 }}
               className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
               <button
                  onClick={() => navigate("/")}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition"
               >
                  Go Home
               </button>

               {user ? (
                  <button
                     onClick={() => navigate("/dashboard")}
                     className="px-5 py-2 rounded-lg border border-indigo-400 text-indigo-300 hover:bg-indigo-500/10 transition font-medium"
                  >
                     Go to Dashboard
                  </button>
               ) : (
                  <button
                     onClick={() => navigate("/login")}
                     className="px-5 py-2 rounded-lg border border-indigo-400 text-indigo-300 hover:bg-indigo-500/10 transition font-medium"
                  >
                     Go to Login
                  </button>
               )}
            </motion.div>
         </div>
      </div>
   );
};

export default NotFound;
