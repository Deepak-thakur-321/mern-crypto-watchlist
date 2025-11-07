import React, { useEffect, useReducer, useState } from "react";
import axiosInstance from "../api/axiosInstance.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialState = {
   items: [],
   loading: false,
   error: null,
};

function reducer(state, action) {
   switch (action.type) {
      case "FETCH_START":
         return { ...state, loading: true, error: null };
      case "FETCH_SUCCESS":
         return { ...state, loading: false, items: action.payload, error: null };
      case "FETCH_ERROR":
         return { ...state, loading: false, error: action.payload };
      case "SET_ITEMS":
         return { ...state, items: action.payload };
      default:
         return state;
   }
}

/* -------------------------
  Small Loader component
  Accessible and lightweight
------------------------- */
const Loader = ({ message = "Loading..." }) => (
   <div className="w-full min-h-[200px] flex items-center justify-center">
      <div className="flex items-center gap-3">
         <svg className="w-6 h-6 animate-spin text-indigo-500" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
         </svg>
         <span className="text-sm text-slate-400">{message}</span>
      </div>
   </div>
);

/* -------------------------
  Modal (very small)
------------------------- */
const Modal = ({ open, onClose, title, children }) => {
   if (!open) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
         <div className="absolute inset-0 bg-black/50" onClick={onClose} />
         <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 z-10">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
               <button onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            {children}
         </div>
      </div>
   );
};

/* -------------------------
  Confirm Dialog
------------------------- */
const ConfirmDialog = ({ open, onClose, onConfirm, title = "Are you sure?", description }) => {
   if (!open) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
         <div className="absolute inset-0 bg-black/50" onClick={onClose} />
         <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6 z-10">
            <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
            {description && <p className="text-sm text-slate-600 mt-2">{description}</p>}
            <div className="mt-4 flex gap-3 justify-end">
               <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-sm">Cancel</button>
               <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm">Delete</button>
            </div>
         </div>
      </div>
   );
};

/* -------------------------
  Watchlist Item Row
------------------------- */
const WatchlistRow = ({ item, onEdit, onDelete }) => {
   return (
      <div className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0">
         <div className="col-span-5 md:col-span-6">
            <div className="text-sm font-medium text-slate-800">{item.name}</div>
            <div className="text-xs text-slate-500 mt-1">{item.symbol}</div>
         </div>
         <div className="col-span-3 text-sm text-slate-700">
            {item.priceAlert ?? "—"}
         </div>
         <div className="col-span-4 md:col-span-3 flex justify-end gap-2">
            <button onClick={() => onEdit(item)} className="px-3 py-1 rounded-md border border-indigo-500 text-indigo-500 text-sm hover:bg-indigo-50">Edit</button>
            <button onClick={() => onDelete(item)} className="px-3 py-1 rounded-md border border-red-500 text-red-500 text-sm hover:bg-red-50">Delete</button>
         </div>
      </div>
   );
};

/* -------------------------
  Main Dashboard component
------------------------- */
export default function Dashboard() {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [state, dispatch] = useReducer(reducer, initialState);
   const [search, setSearch] = useState("");
   const [filterSymbol, setFilterSymbol] = useState("");
   const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'price-asc' | 'price-desc'
   const [modalOpen, setModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState(null);
   const [confirmOpen, setConfirmOpen] = useState(false);
   const [deletingItem, setDeletingItem] = useState(null);
   const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

   // fetch watchlist
   const fetchItems = async () => {
      dispatch({ type: "FETCH_START" });
      try {
         const res = await axiosInstance.get("/watchlist");
         const items = res.data.items || [];
         dispatch({ type: "FETCH_SUCCESS", payload: items });
      } catch (err) {
         console.error("Fetch watchlist failed:", err);
         dispatch({ type: "FETCH_ERROR", payload: err.message || "Failed to load" });
         toast.error(err.response?.data?.message || "Failed to load watchlist");
      }
   };

   useEffect(() => {
      // If user somehow not available because ProtectedRoute should have redirected, just guard
      if (!user) {
         navigate("/login");
         return;
      }
      fetchItems();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [user]);

   // filter/sort derived data
   const filtered = state.items
      .filter((it) =>
         (it.name || "").toLowerCase().includes(search.toLowerCase()) &&
         (filterSymbol ? it.symbol.toLowerCase() === filterSymbol.toLowerCase() : true)
      )
      .sort((a, b) => {
         if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
         if (sortBy === "price-asc") return (a.priceAlert ?? 0) - (b.priceAlert ?? 0);
         if (sortBy === "price-desc") return (b.priceAlert ?? 0) - (a.priceAlert ?? 0);
         return 0;
      });

   /* -------------------------
     Create or Update handler
   ------------------------- */
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

   const submitForm = async (data) => {
      // data: { name, symbol, priceAlert }
      try {
         if (editingItem) {
            // update
            const res = await axiosInstance.put(`/watchlist/${editingItem._id}`, {
               name: data.name,
               symbol: data.symbol,
               priceAlert: data.priceAlert === "" ? undefined : Number(data.priceAlert),
            });
            toast.success("Watchlist item updated");
         } else {
            // create
            const res = await axiosInstance.post("/watchlist", {
               name: data.name,
               symbol: data.symbol,
               priceAlert: data.priceAlert === "" ? undefined : Number(data.priceAlert),
            });
            toast.success("Watchlist item added");
         }
         setModalOpen(false);
         reset();
         fetchItems(); // refresh list
      } catch (err) {
         console.error("Save failed:", err);
         toast.error(err.response?.data?.message || "Operation failed");
      }
   };

   /* -------------------------
     Delete handler
   ------------------------- */
   const openDelete = (item) => {
      setDeletingItem(item);
      setConfirmOpen(true);
   };

   const confirmDelete = async () => {
      if (!deletingItem) return;
      try {
         await axiosInstance.delete(`/watchlist/${deletingItem._id}`);
         toast.success("Item deleted");
         setConfirmOpen(false);
         setDeletingItem(null);
         fetchItems();
      } catch (err) {
         console.error("Delete failed:", err);
         toast.error(err.response?.data?.message || "Delete failed");
      }
   };

   /* -------------------------
     UI: header + controls
   ------------------------- */
   return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 md:px-8">
         <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-6">
               <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">Your Watchlist</h1>
                  <p className="text-sm text-slate-500 mt-1">Manage price alerts and keep track of symbols you care about.</p>
               </div>

               <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                     <input
                        className="bg-transparent outline-none text-sm w-48"
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search watchlist"
                     />
                     <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-sm bg-transparent outline-none"
                        aria-label="Sort"
                     >
                        <option value="newest">Newest</option>
                        <option value="price-desc">Price alert: High → Low</option>
                        <option value="price-asc">Price alert: Low → High</option>
                     </select>
                  </div>

                  <button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow">
                     + Add item
                  </button>
               </div>
            </header>

            {/* container */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               {/* table header */}
               <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b">
                  <div className="col-span-5 md:col-span-6 text-xs text-slate-500 font-semibold">Name</div>
                  <div className="col-span-3 text-xs text-slate-500 font-semibold">Price Alert</div>
                  <div className="col-span-4 md:col-span-3 text-xs text-slate-500 font-semibold text-right">Actions</div>
               </div>

               {/* list */}
               <div>
                  {state.loading ? (
                     <Loader message="Loading watchlist..." />
                  ) : state.items.length === 0 ? (
                     <div className="p-8 text-center text-slate-500">
                        No watchlist items yet. Click <button onClick={openCreate} className="text-indigo-600 underline">Add item</button> to get started.
                     </div>
                  ) : (
                     <div>
                        {/* list items */}
                        <div className="divide-y">
                           {filtered.map((item) => (
                              <WatchlistRow key={item._id} item={item} onEdit={openEdit} onDelete={openDelete} />
                           ))}
                        </div>
                        {/* small footer */}
                        <div className="px-5 py-3 text-xs text-slate-500 flex justify-between items-center">
                           <div>{filtered.length} item(s)</div>
                           <div className="hidden sm:block">Updated: {new Date().toLocaleString()}</div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Modal: create / edit */}
         <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Edit Watchlist Item" : "Add Watchlist Item"}>
            <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
               <div className="grid md:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Name</label>
                     <input
                        type="text"
                        {...register("name", { required: "Name required", minLength: { value: 1, message: "Enter a name" } })}
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                     />
                     {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-slate-700">Symbol</label>
                     <input
                        type="text"
                        {...register("symbol", { required: "Symbol required", minLength: { value: 1, message: "Enter a symbol" } })}
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                     />
                     {errors.symbol && <p className="text-xs text-red-600 mt-1">{errors.symbol.message}</p>}
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700">Price Alert (optional)</label>
                  <input
                     type="number"
                     step="any"
                     {...register("priceAlert", {
                        validate: (v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0) || "Must be a positive number",
                     })}
                     className="mt-2 w-full rounded-lg border px-3 py-2"
                  />
                  {errors.priceAlert && <p className="text-xs text-red-600 mt-1">{errors.priceAlert.message}</p>}
               </div>

               <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                     {isSubmitting ? "Saving..." : editingItem ? "Save changes" : "Add item"}
                  </button>
               </div>
            </form>
         </Modal>

         {/* Confirm delete */}
         <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={confirmDelete}
            title="Delete watchlist item"
            description={`Delete "${deletingItem?.name}" (${deletingItem?.symbol})? This action cannot be undone.`}
         />
      </div>
   );
}
