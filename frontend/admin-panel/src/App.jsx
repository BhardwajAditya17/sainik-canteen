import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react"; // Make sure to install lucide-react if not present

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// Existing Pages
import Products from "./pages/Products";
import ProductDetails from './pages/ProductDetails';
import Orders from "./pages/Orders";
import OrderDetails from './pages/OrderDetails';


import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound"; 

import { useAuth } from "./context/AuthContext";

// ----------------------------------------------------------------------
// 1. Enhanced Admin Guard with Better UI
// ----------------------------------------------------------------------
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-gray-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Check if user exists AND is explicitly an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ----------------------------------------------------------------------
// 2. Main App Component
// ----------------------------------------------------------------------
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Zone */}
      <Route path="/" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        {/* Redirect root to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Core Modules */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />

        {/* Expanded Modules (Future Proofing) */}
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetails />} />        
        <Route path="analytics" element={<Analytics />} />


        {/* 404 Fallback within Admin Panel */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;