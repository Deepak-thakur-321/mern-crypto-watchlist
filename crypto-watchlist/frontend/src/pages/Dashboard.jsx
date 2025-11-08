import React, { useEffect, useReducer, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance.js";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
   FaRegUserCircle,
   FaSearch,
   FaPlus,
   FaChartLine,
   FaBell,
   FaFilter,
   FaDollarSign,
   FaTag
} from "react-icons/fa";
import { Link } from "react-router-dom";

import WatchlistRow from "../components/WatchlistRow.jsx";
import Modal from "../components/Modal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const initialState = { items: [], loading: false, error: null };

function reducer(state, action) {
   switch (action.type) {
      case "FETCH_START": return { ...state, loading: true, error: null };
      case "FETCH_SUCCESS": return { ...state, loading: false, items: action.payload };
      case "FETCH_ERROR": return { ...state, loading: false, error: action.payload };
      default: return state;
   }
}

const Loader = ({ message = "Loading..." }) => (
   <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-4">
         <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
         </div>
         <span className="text-sm font-medium text-gray-600">{message}</span>
      </div>
   </div>
);

const StatCard = ({ title, value, icon: Icon, gradient, trend }) => (
   <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>
      <div className="relative">
         <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
               <Icon className="text-2xl text-white" />
            </div>
            {trend && (
               <span className="text-xs font-semibold text-white/90 bg-white/20 px-2 py-1 rounded-full">
                  {trend}
               </span>
            )}
         </div>
         <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
         <p className="text-3xl font-bold text-white">{value}</p>
      </div>
   </div>
);

const EmptyState = ({ onAddClick }) => (
   <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
         <FaChartLine className="text-5xl text-indigo-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Start Your Watchlist</h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
         Track your favorite stocks and crypto assets. Set price alerts and never miss an opportunity.
      </p>
      <button
         onClick={onAddClick}
         className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
      >
         <FaPlus /> Add Your First Item
      </button>
   </div>
);

export default function Dashboard() {
   const { user, logout } = useAuth();
   const navigate = useNavigate();
   const [state, dispatch] = useReducer(reducer, initialState);
   const [search, setSearch] = useState("");
   const [sortBy, setSortBy] = useState("newest");
   const [modalOpen, setModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState(null);
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [deletingItem, setDeletingItem] = useState(null);
   const [referralInput, setReferralInput] = useState("");
   const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

   const fetchItems = async () => {
      dispatch({ type: "FETCH_START" });
      try {
         const res = await axiosInstance.get("/watchlist");
         dispatch({ type: "FETCH_SUCCESS", payload: res.data.items || [] });
      } catch (err) {
         dispatch({ type: "FETCH_ERROR", payload: err.message });
         toast.error(err.response?.data?.message || "Failed to load watchlist");
      }
   };

   const handleReferralSubmit = () => {
      const code = referralInput.trim();
      if (!code) return toast.error("Please enter a referral code.");

      const validCodes = ["DUMMY123", "MYCODE", "TEST2025"];

      if (validCodes.includes(code.toUpperCase())) {
         toast.success("Referral applied! Premium perks unlocked.");
         setReferralInput(""); 
      } else {
         toast.error("Invalid referral code.");
      }
   };

   useEffect(() => {
      fetchItems();
   }, []);

   const filtered = state.items
      .filter(it => it.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
         if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
         if (sortBy === "price-asc") return (a.priceAlert ?? 0) - (b.priceAlert ?? 0);
         if (sortBy === "price-desc") return (b.priceAlert ?? 0) - (a.priceAlert ?? 0);
         return 0;
      });

   const openCreate = () => {
      setEditingItem(null);
      reset({ name: "", symbol: "", priceAlert: "" });
      setModalOpen(true);
   };

   const openEdit = (item) => {
      setEditingItem(item);
      reset({ name: item.name, symbol: item.symbol, priceAlert: item.priceAlert ?? "" });
      setModalOpen(true);
   };

   const openDelete = (item) => {
      setDeletingItem(item);
      setConfirmOpen(true);
   };

   const submitForm = async (data) => {
      try {
         if (editingItem) {
            await axiosInstance.put(`/watchlist/${editingItem._id}`, {
               ...data,
               priceAlert: data.priceAlert === "" ? undefined : Number(data.priceAlert)
            });
            toast.success("Item updated successfully!");
         } else {
            await axiosInstance.post("/watchlist", {
               ...data,
               priceAlert: data.priceAlert === "" ? undefined : Number(data.priceAlert)
            });
            toast.success("Item added to watchlist!");
         }
         setModalOpen(false);
         reset();
         fetchItems();
      } catch (err) {
         toast.error(err.response?.data?.message || "Operation failed");
      }
   };

   const confirmDelete = async () => {
      if (!deletingItem) return;
      try {
         await axiosInstance.delete(`/watchlist/${deletingItem._id}`);
         toast.success("Item removed from watchlist");
         setConfirmOpen(false);
         setDeletingItem(null);
         fetchItems();
      } catch (err) {
         toast.error(err.response?.data?.message || "Delete failed");
      }
   };

   const handleLogout = async () => {
      await logout();
      toast.success("Logged out successfully");
   };

   // Calculate stats
   const totalItems = state.items.length;
   const withAlerts = state.items.filter(item => item.priceAlert).length;
   const avgPrice = totalItems > 0
      ? (state.items.reduce((sum, item) => sum + (item.priceAlert || 0), 0) / totalItems).toFixed(2)
      : 0;

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
         {/* Premium Header */}
         <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40 backdrop-blur-lg bg-white/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex items-center justify-between h-16">
                  {/* Logo & Title */}
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <FaChartLine className="text-white text-xl" />
                     </div>
                     <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                           WatchList Pro
                        </h1>
                        <p className="text-xs text-gray-500">Welcome back, {user?.name?.split(' ')[0] || 'User'}</p>
                     </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3">
                     <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <FaBell className="text-xl" />
                     </button>

                     <Link
                        to="/referral"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-all"
                     >
                        Referral
                     </Link>

                     <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-all group"
                        aria-label="Go to profile"
                     >
                        <FaRegUserCircle className="text-2xl text-gray-600 group-hover:text-indigo-600 transition-colors" />
                        <span className="hidden md:inline text-sm font-medium text-gray-700 group-hover:text-indigo-600">Profile</span>
                     </Link>

                     <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium text-sm"
                     >
                        Logout
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <StatCard
                  title="Total Items"
                  value={totalItems}
                  icon={FaChartLine}
                  gradient="from-indigo-500 to-indigo-600"
                  trend={totalItems > 0 ? `+${totalItems}` : "Start now"}
               />
               <StatCard
                  title="Active Alerts"
                  value={withAlerts}
                  icon={FaBell}
                  gradient="from-purple-500 to-purple-600"
                  trend={withAlerts > 0 ? "Monitoring" : "Set alerts"}
               />
               <StatCard
                  title="Avg Target Price"
                  value={`$${avgPrice}`}
                  icon={FaFilter}
                  gradient="from-pink-500 to-pink-600"
                  trend={avgPrice > 0 ? "Active" : "N/A"}
               />
            </div>


            {/* Referral Perks Section */}
            <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  Referral Perks
               </h2>
               {user?.hasReferral ? (
                  <div className="text-gray-700">
                     <p className="mb-2">
                        You’ve unlocked <span className="font-semibold text-indigo-600">premium features</span> using referral code{" "}
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{user.referralCode}</span>.
                     </p>
                     <p className="text-sm text-gray-500">
                        Explore your extra perks on your <Link to="/profile" className="text-indigo-600 hover:underline">Profile</Link>.
                     </p>
                  </div>
               ) : (
                  <div>
                     <p className="text-gray-600 mb-3">
                        Paste a valid referral code to unlock premium features like bonus alerts & early access.
                     </p>
                     <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <input
                           type="text"
                           placeholder="Enter referral code..."
                           value={referralInput}
                           onChange={(e) => setReferralInput(e.target.value)}
                           className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                        <button
                           onClick={() => {
                              const code = referralInput.trim().toUpperCase();
                              const validCodes = ["DUMMY123", "MYCODE", "TEST2025"];
                              if (!code) return toast.error("Please enter a referral code.");
                              if (validCodes.includes(code)) {
                                 toast.success("Referral applied! Premium perks unlocked.");
                                 setReferralInput(""); // Clear input on success
                              } else {
                                 toast.error("Invalid referral code.");
                              }
                           }}
                           className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                        >
                           Apply Code
                        </button>

                        <ToastContainer
                           position="top-right"
                           autoClose={3000}
                           hideProgressBar={false}
                           newestOnTop={false}
                           closeOnClick
                           rtl={false}
                           pauseOnFocusLoss
                           draggable
                           pauseOnHover
                        />
                     </div>
                  </div>
               )}
            </div>


            {/* Controls Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
               <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Search */}
                  <div className="relative flex-1 w-full sm:w-auto">
                     <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search watchlist..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                     />
                  </div>

                  {/* Sort */}
                  <select
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none bg-white cursor-pointer w-full sm:w-auto transition-all"
                  >
                     <option value="newest">🕒 Newest First</option>
                     <option value="price-desc">📈 Price: High → Low</option>
                     <option value="price-asc">📉 Price: Low → High</option>
                  </select>

                  {/* Add Button */}
                  <button
                     onClick={openCreate}
                     className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                     <FaPlus /> Add Item
                  </button>
               </div>
            </div>

            {/* Watchlist Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               {state.loading ? (
                  <Loader message="Loading your watchlist..." />
               ) : filtered.length === 0 ? (
                  search ? (
                     <div className="text-center py-12 px-4">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No results found</h3>
                        <p className="text-gray-500">Try adjusting your search terms</p>
                     </div>
                  ) : (
                     <EmptyState onAddClick={openCreate} />
                  )
               ) : (
                  <div className="divide-y divide-gray-100">
                     {filtered.map((item, idx) => (
                        <div
                           key={item._id}
                           className="hover:bg-gray-50 transition-colors"
                           style={{
                              animation: `fadeIn 0.3s ease-out ${idx * 0.05}s both`
                           }}
                        >
                           <WatchlistRow
                              item={item}
                              onEdit={openEdit}
                              onDelete={openDelete}
                           />
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Enhanced Modal */}
         <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingItem ? "✏️ Edit Item" : "➕ Add New Item"}
         >
            <form onSubmit={handleSubmit(submitForm)} className="space-y-5">
               {/* Asset Name */}
               <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                     Asset Name
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaChartLine className="text-gray-400" />
                     </div>
                     <input
                        id="name"
                        type="text"
                        placeholder="e.g., Bitcoin, Apple Inc."
                        {...register("name", { required: "Name is required" })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                     />
                  </div>
                  {errors.name && (
                     <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <span>⚠</span> {errors.name.message}
                     </p>
                  )}
               </div>

               {/* Symbol */}
               <div>
                  <label htmlFor="symbol" className="block text-sm font-semibold text-gray-700 mb-2">
                     Symbol / Ticker
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaTag className="text-gray-400" />
                     </div>
                     <input
                        id="symbol"
                        type="text"
                        placeholder="e.g., BTC, AAPL"
                        {...register("symbol", { required: "Symbol is required" })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white uppercase focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                     />
                  </div>
                  {errors.symbol && (
                     <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <span>⚠</span> {errors.symbol.message}
                     </p>
                  )}
               </div>

               {/* Price Alert */}
               <div>
                  <label htmlFor="priceAlert" className="block text-sm font-semibold text-gray-700 mb-2">
                     Price Alert (Optional)
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaDollarSign className="text-gray-400" />
                     </div>
                     <input
                        id="priceAlert"
                        type="number"
                        step="any"
                        placeholder="0.00"
                        {...register("priceAlert", {
                           validate: v => v === "" || (!isNaN(Number(v)) && Number(v) >= 0) || "Must be a positive number"
                        })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                     />
                  </div>
                  {errors.priceAlert && (
                     <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                        <span>⚠</span> {errors.priceAlert.message}
                     </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">💡 Get notified when price reaches this target</p>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-3 pt-4">
                  <button
                     type="button"
                     onClick={() => setModalOpen(false)}
                     className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                     {isSubmitting ? "Saving..." : editingItem ? "Update" : "Add to Watchlist"}
                  </button>
               </div>
            </form>
         </Modal>

         <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={confirmDelete}
            description={`Are you sure you want to remove "${deletingItem?.name}" (${deletingItem?.symbol}) from your watchlist?`}
         />

         <style>{`
            @keyframes fadeIn {
               from {
                  opacity: 0;
                  transform: translateY(10px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
         `}</style>
      </div>
   );
}
