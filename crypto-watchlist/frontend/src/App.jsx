import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from '../src/components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from "./pages/NotFound.jsx";

const PageWrapper = ({ title, children }) => (
  <div className="flex flex-col items-center justify-start min-h-[calc(100vh-64px)] bg-slate-900 text-white p-8">
    <h1 className="text-4xl font-extrabold text-indigo-400 mb-6 border-b border-indigo-500/50 pb-2">{title}</h1>
    {children}
  </div>
);

const Home = () => (
  <PageWrapper title="FileSure: Secure Storage">
    <p className="text-xl text-slate-300 max-w-2xl text-center">
      आपके संवेदनशील डेटा के लिए सुरक्षित क्लाउड समाधान। शुरू करने के लिए लॉग इन या रजिस्टर करें।
    </p>
  </PageWrapper>
);

const About = () => (
  <PageWrapper title="About FileSure">
    <p className="text-lg text-slate-400 max-w-3xl text-center"> </p>
  </PageWrapper>
);

const Dashboard = () => (
  <PageWrapper title="Dashboard">
    <p className="text-xl text-green-400">
    
    </p>
    <p className="text-lg text-slate-400 mt-4">
     
    </p>
  </PageWrapper>
);

// --- Main Layout Component ---
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main>
        <Outlet /> 
      </main>
    </div>
  );
};

// --- Main App Component (Router Setup) ---
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />

        <Routes>
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Not Found */}
            <Route
              path="*"
              element={
                <PageWrapper title="404">
                  <p className="text-red-500 text-2xl"></p>
                </PageWrapper>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;