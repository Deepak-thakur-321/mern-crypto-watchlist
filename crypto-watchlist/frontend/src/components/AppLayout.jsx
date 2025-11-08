import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const AppLayout = () => {
   return (
      <div className="min-h-screen bg-slate-900 text-white">
         <Navbar />
         <main className="pt-4">
            <Outlet />
         </main>
      </div>
   );
};

export default AppLayout;
