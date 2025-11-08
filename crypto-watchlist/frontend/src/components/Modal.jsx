import React from "react";

const Modal = ({ open, onClose, title, children }) => {
   if (!open) return null;

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center px-4"
         role="dialog"
         aria-modal="true"
         aria-labelledby="modal-title"
      >
         {/* Overlay */}
         <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={onClose}
         />

         {/* Modal Content */}
         <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 z-10 transform transition-all">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
               <h3
                  id="modal-title"
                  className="text-lg font-semibold text-gray-800"
               >
                  {title}
               </h3>
               <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="text-gray-500 hover:text-gray-700"
               >
                  ✕
               </button>
            </div>

            {/* Body */}
            <div className="">{children}</div>
         </div>
      </div>
   );
};

export default Modal;
