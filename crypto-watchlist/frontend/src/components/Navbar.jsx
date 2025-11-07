import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Menu, X, Rocket, User, LogOut, LogIn } from "lucide-react";

// Defines all possible navigation links with their authentication requirement
const ALL_NAV_LINKS = [
   { name: "Home", path: "/", authRequired: false },
   { name: "Dashboard", path: "/dashboard", authRequired: true },
   { name: "About", path: "/about", authRequired: false },
   // { name: "Profile", path: "/profile", authRequired: true }, // Add profile when ready
];

const Navbar = () => {
   const { user, logout } = useAuth();
   const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(false);
   const isAuthenticated = !!user; // Convert user object to boolean status

   const handleLogout = async () => {
      await logout();
      navigate("/login");
   };

   // Dynamic links: Filter the list based on authentication status
   const visibleLinks = ALL_NAV_LINKS.filter(link =>
      link.authRequired ? isAuthenticated : true
   );

   const navLinkClass = ({ isActive }) =>
      `text-sm font-semibold relative py-1 transition-all duration-200 ${isActive
         ? "text-indigo-400"
         : "text-slate-300 hover:text-white hover:border-b-indigo-400"
      } after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-indigo-400 ${isActive ? "after:w-full" : "hover:after:w-full"
      }`;

   return (
      <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 shadow-xl">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">

               {/* Logo */}
               <Link
                  to="/"
                  className="flex items-center space-x-2 text-xl md:text-2xl font-bold text-indigo-400 transition-colors"
               >
                  <Rocket className="h-6 w-6" />
                  <span>FileSure</span>
               </Link>

               {/* Desktop Nav Links */}
               <div className="hidden md:flex space-x-8 items-center">
                  {visibleLinks.map((link) => (
                     <NavLink
                        key={link.name}
                        to={link.path}
                        className={navLinkClass}
                     >
                        {link.name}
                     </NavLink>
                  ))}
               </div>

               {/* Desktop Auth Buttons/Profile */}
               <div className="hidden md:flex items-center space-x-4">
                  {isAuthenticated ? (
                     <>
                        <span className="text-gray-300 text-sm font-medium flex items-center space-x-2 p-2 rounded-lg bg-slate-800 border border-slate-700">
                           <User size={18} className="text-indigo-400" />
                           {user.email || user.uid.substring(0, 8) + '...'}
                        </span>
                        <button
                           onClick={handleLogout}
                           className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1"
                        >
                           <LogOut size={16} />
                           <span>Logout</span>
                        </button>
                     </>
                  ) : (
                     <>
                        <Link
                           to="/login"
                           className="text-gray-300 hover:text-white text-sm font-medium flex items-center space-x-1 transition-colors"
                        >
                           <LogIn size={16} />
                           <span>Login</span>
                        </Link>
                        <Link
                           to="/register"
                           className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-500/30"
                        >
                           Register
                        </Link>
                     </>
                  )}
               </div>

               {/* Mobile Menu Button */}
               <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-slate-700 focus:outline-none transition-colors"
                  aria-label="Toggle menu"
               >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>
         </div>

         {/* Mobile Dropdown Menu */}
         {isOpen && (
            <div className="md:hidden bg-slate-800/90 border-t border-slate-700 shadow-inner">
               <div className="px-4 py-4 space-y-4">

                  {/* Nav Links */}
                  {visibleLinks.map((link) => (
                     <NavLink
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                           `block text-base font-medium p-2 rounded-lg transition-colors ${isActive
                              ? "text-indigo-400 bg-slate-700"
                              : "text-gray-300 hover:text-white hover:bg-slate-700"
                           }`
                        }
                     >
                        {link.name}
                     </NavLink>
                  ))}

                  <div className="border-t border-slate-700 pt-4 space-y-3">
                     {isAuthenticated ? (
                        <>
                           <p className="text-gray-400 text-sm flex items-center space-x-2">
                              <User size={16} className="text-indigo-400" />
                              <span>Logged in as: {user.email || user.uid.substring(0, 8) + '...'}</span>
                           </p>
                           <button
                              onClick={() => { setIsOpen(false); handleLogout(); }}
                              className="w-full text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2"
                           >
                              <LogOut size={18} />
                              <span>Logout</span>
                           </button>
                        </>
                     ) : (
                        <div className="flex flex-col space-y-2">
                           <Link
                              to="/login"
                              onClick={() => setIsOpen(false)}
                              className="w-full text-center text-gray-300 hover:text-white text-sm font-medium border border-slate-700 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                           >
                              <LogIn size={16} className="inline mr-1 -mt-0.5" />
                              Login
                           </Link>
                           <Link
                              to="/register"
                              onClick={() => setIsOpen(false)}
                              className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-500/30"
                           >
                              Register
                           </Link>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </nav>
   );
};

export default Navbar