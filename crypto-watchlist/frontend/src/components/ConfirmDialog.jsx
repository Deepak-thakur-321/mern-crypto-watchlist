import React from "react";

export default function ConfirmDialog({ open, onClose, onConfirm, title = "Are you sure?", description }) {
   if (!open) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
         <div className="absolute inset-0 bg-black/50" onClick={onClose} />
         <div className="relative w-full max-w-md bg-white rounded-xl shadow-lg p-6 z-10">
            <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
            {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
            <div className="mt-4 flex gap-3 justify-end">
               <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
               <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm">Delete</button>
            </div>
         </div>
      </div>
   );
}
