import React from "react";

export default function WatchRow({ item, onEdit, onDelete }) {
   return (
      <div className="bg-white shadow-sm rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border border-gray-200 hover:shadow-md transition">
         <div>
            <div className="font-medium text-gray-800">{item.name}</div>
            <div className="text-sm text-gray-500">{item.symbol}</div>
         </div>
         <div className="text-gray-700">{item.priceAlert ?? "—"}</div>
         <div className="flex gap-2 justify-end">
            <button onClick={() => onEdit(item)} className="px-3 py-1 rounded-md border border-indigo-500 text-indigo-500 hover:bg-indigo-50 text-sm">Edit</button>
            <button onClick={() => onDelete(item)} className="px-3 py-1 rounded-md border border-red-500 text-red-500 hover:bg-red-50 text-sm">Delete</button>
         </div>
      </div>
   );
}
