import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { 
  User, Mail, Phone, MapPin, Calendar, LogOut, 
  Package, ShoppingBag, ChevronRight, Clock, Loader2 
} from "lucide-react";

const Profile = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        const ordersData = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        const sortedOrders = ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      case 'SHIPPED': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-100';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-green-600">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
            <p className="font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500 mt-1">Manage your profile and view order history</p>
        </header>

        <div className="grid md:grid-cols-12 gap-6 lg:gap-8">

          {/* LEFT COLUMN */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 sticky top-6 overflow-hidden">
              
              <div className="h-24 bg-gradient-to-r from-emerald-500 to-emerald-700"></div>

              <div className="px-6 pb-6 relative flex flex-col items-start">

                {/* AVATAR */}
                <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 left-6 shadow-md">
                  <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center text-green-700 text-2xl font-bold uppercase">
                    {user.name?.charAt(0)}
                  </div>
                </div>

                {/* NAME */}
                <div className="mt-12 mb-6">
                  <h2 className="font-bold text-xl text-gray-900">{user.name}</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Customer</p>
                </div>

                {/* DETAILS */}
                <div className="space-y-4">

                  <div className="flex items-center space-x-3 text-sm text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-full group-hover:bg-emerald-50 transition-colors">
                      <Mail className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                    </div>
                    <span className="truncate">{user.email}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-full group-hover:bg-emerald-50 transition-colors">
                      <Phone className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                    </div>
                    <span>{user.phone || "No phone number"}</span>
                  </div>

                  <div className="flex items-start space-x-3 text-sm text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-full group-hover:bg-emerald-50 transition-colors mt-[-4px]">
                      <MapPin className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                    </div>
                    <span className="flex-1 leading-relaxed">
                      {user.address ? (
                        <>
                          {user.address}, {user.city}<br />
                          {user.state} - {user.pincode}
                        </>
                      ) : "No address saved"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-full group-hover:bg-emerald-50 transition-colors">
                      <Calendar className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                    </div>
                    <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>

                <hr className="my-6 border-gray-100" />

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-lg hover:bg-red-100 hover:border-red-200 transition-all font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Orders */}
          <div className="md:col-span-7 lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                Order History
              </h2>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin mb-3" />
                <p className="text-gray-500">Retrieving your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-300 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                <p className="text-gray-500 mb-6 text-sm">Looks like you haven't made your first purchase yet.</p>
                <Link to="/products" className="inline-flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm hover:shadow">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id || order._id} className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200">
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{order.id || order._id}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status || "PROCESSING"}
                      </span>
                    </div>

                    <div className="h-px bg-gray-50 my-3"></div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">₹{order.totalAmount?.toLocaleString()}</p>
                      </div>

                      <Link 
                        to={`/orders/${order.id || order._id}`}
                        className="text-sm font-medium text-emerald-600 hover:text-green-700 flex items-center group-hover:underline"
                      >
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
