import React from 'react';

const Loader = () => {
   return (
      <div className="flex flex-col items-center justify-center p-6 space-y-3">
         {/* Loader Spinner - Animated Tailwind Spinner */}
         <div className="w-12 h-12 border-4 border-t-4 border-indigo-600 border-opacity-25 rounded-full animate-spin">
            {/* Border Top is the main color, border is the background */}
         </div>

         {/* Loading Text */}
         <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Loading data...
         </p>
      </div>
   );
};

export default Loader;