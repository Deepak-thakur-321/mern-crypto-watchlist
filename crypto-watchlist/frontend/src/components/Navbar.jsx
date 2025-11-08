import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Menu, X, Rocket, User, LogOut, LogIn } from "lucide-react";

const ALL_NAV_LINKS = [
   { name: "Dashboard", path: "/dashboard", authRequired: true },
   { name: "Profile", path: "/profile", authRequired: true },
   { name: "Referral", path: "/referral", authRequired: true },
];

const Navbar = () => {
   const { user, logout } = useAuth();
   const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(false);
   const isAuthenticated = !!user;

   const handleLogout = async () => {
      await logout();
      navigate("/login");
   };

   const navLinkClass = ({ isActive }) =>
      `text-sm font-semibold relative py-1 transition-all duration-200 ${isActive
         ? "text-indigo-400"
         : "text-slate-300 hover:text-white hover:border-b-indigo-400"
      }`;

   const visibleLinks = ALL_NAV_LINKS.filter(link =>
      link.authRequired ? isAuthenticated : true
   );

   return (
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 shadow-xl">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
               {/* Logo */}
               <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-xl md:text-2xl font-bold text-indigo-400"
               >
                  <Rocket className="h-6 w-6" />
                  <span>CryptoWatch</span>
               </Link>

               {/* Desktop Links */}
               <div className="hidden md:flex space-x-6 items-center">
                  {visibleLinks.map(link => (
                     <NavLink key={link.name} to={link.path} className={navLinkClass}>
                        {link.name}
                     </NavLink>
                  ))}
               </div>

               {/* Desktop Auth/Profile */}
               <div className="hidden md:flex items-center space-x-4">
                  {isAuthenticated ? (
                     <>
                        <span
                           className="text-gray-300 text-sm font-medium flex items-center space-x-2 p-2 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
                           onClick={() => navigate("/profile")}
                        >
                           <User size={18} className="text-indigo-400" />
                           {user.email || user.uid.substring(0, 8) + "..."}
                        </span>
                        <button
                           onClick={handleLogout}
                           className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1"
                        >
                           <LogOut size={16} />
                           Logout
                        </button>
                     </>
                  ) : (
                     <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                     </>
                  )}
               </div>

               {/* Mobile Toggle */}
               <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-slate-700"
               >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>
         </div>

         {/* Mobile Menu */}
         {isOpen && (
            <div className="md:hidden bg-slate-800/90 border-t border-slate-700">
               <div className="px-4 py-4 space-y-4">
                  {visibleLinks.map(link => (
                     <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                           `block text-base font-medium p-2 rounded-lg ${isActive ? "text-indigo-400 bg-slate-700" : "text-gray-300 hover:text-white hover:bg-slate-700"
                           }`
                        }
                     >
                        {link.name}
                     </NavLink>
                  ))}
                  {isAuthenticated && (
                     <button
                        onClick={() => { setIsOpen(false); handleLogout(); }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                     >
                        Logout
                     </button>
                  )}
               </div>
            </div>
         )}
      </nav>
   );
};

export default Navbar;
