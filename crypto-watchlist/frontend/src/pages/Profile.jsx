import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance.js";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaUser, FaEnvelope, FaUserTag } from "react-icons/fa";

export default function Profile() {
   const { user, logout } = useAuth();
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [profileData, setProfileData] = useState(null);

   useEffect(() => {
      if (user) {
         setProfileData(user);
      }
   }, [user]);

   const handleLogout = async () => {
      try {
         await logout();
         toast.success("Logged out successfully");
         navigate("/login");
      } catch (err) {
         toast.error("Logout failed");
      }
   };

   if (!profileData) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
         <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <button
               onClick={() => navigate("/dashboard")}
               className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
               <FaArrowLeft />
               <span>Back to Dashboard</span>
            </button>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
               {/* Header */}
               <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>

               {/* Profile Content */}
               <div className="px-6 pb-6">
                  {/* Avatar */}
                  <div className="relative -mt-16 mb-4">
                     <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
                        <FaUser className="text-6xl text-indigo-600" />
                     </div>
                  </div>

                  {/* User Info */}
                  <div className="space-y-4">
                     <h1 className="text-3xl font-bold text-gray-800">
                        {profileData.name || "User"}
                     </h1>

                     <div className="space-y-3">
                        {/* Email */}
                        <div className="flex items-center gap-3 text-gray-600">
                           <FaEnvelope className="text-indigo-600" />
                           <span>{profileData.email}</span>
                        </div>

                        {/* Username */}
                        {profileData.username && (
                           <div className="flex items-center gap-3 text-gray-600">
                              <FaUserTag className="text-indigo-600" />
                              <span>@{profileData.username}</span>
                           </div>
                        )}

                        {/* Member Since */}
                        <div className="flex items-center gap-3 text-gray-600">
                           <span className="text-sm">
                              Member since:{" "}
                              {new Date(profileData.createdAt || Date.now()).toLocaleDateString(
                                 "en-US",
                                 {
                                    month: "long",
                                    year: "numeric",
                                 }
                              )}
                           </span>
                        </div>
                     </div>

                     {/* Referral Code (if exists) */}
                     {profileData.referralCode && (
                        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                           <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                           <code className="text-lg font-mono font-semibold text-indigo-600">
                              {profileData.referralCode}
                           </code>
                        </div>
                     )}

                     {/* Actions */}
                     <div className="mt-8 flex flex-wrap gap-3">
                        <button
                           onClick={() => navigate("/referral")}
                           className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                           View Referrals
                        </button>
                        <button
                           onClick={handleLogout}
                           className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                           Logout
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
               <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Statistics</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                     <p className="text-2xl font-bold text-indigo-600">
                        {profileData.referralCount || 0}
                     </p>
                     <p className="text-sm text-gray-600">Referrals</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                     <p className="text-2xl font-bold text-green-600">Active</p>
                     <p className="text-sm text-gray-600">Account Status</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                     <p className="text-2xl font-bold text-purple-600">Premium</p>
                     <p className="text-sm text-gray-600">Membership</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}