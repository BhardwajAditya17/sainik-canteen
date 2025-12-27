import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { 
  User, Mail, Phone, MapPin, Calendar, LogOut, 
  Package, ShoppingBag, ChevronRight, Clock, Loader2,
  Edit2, Save, X 
} from "lucide-react";

const Profile = () => {
  const { user, logout, loading: authLoading, setUser } = useAuth(); // Added setUser to update context
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- EDITING STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || ""
      });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        const ordersData = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        setOrders(ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) { console.error(err); } 
      finally { setLoadingOrders(false); }
    };
    fetchOrders();
  }, [user]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await api.put(`/users/${user.id}`, formData);
      if (res.data.success) {
        setUser(res.data.user); // Update global Auth context
        setIsEditing(false);
        alert("Profile updated successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

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
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500 mt-1">Manage your profile and view order history</p>
        </header>

        <div className="grid md:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: Profile Details (Editable Section) */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 sticky top-6 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-emerald-500 to-emerald-700 flex justify-end p-4">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                  >
                    <Edit2 size={18} />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md"
                    >
                      <X size={18} />
                    </button>
                    <button 
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="bg-white text-emerald-700 p-2 rounded-full shadow-lg"
                    >
                      {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    </button>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 relative flex flex-col items-start">
                <div className="w-20 h-20 bg-white rounded-full p-1 absolute -top-10 left-6 shadow-md">
                  <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center text-green-700 text-2xl font-bold uppercase">
                    {formData.name?.charAt(0)}
                  </div>
                </div>

                <div className="mt-12 mb-6 w-full">
                  {isEditing ? (
                    <input 
                      name="name" value={formData.name} onChange={handleInputChange}
                      className="text-xl font-bold text-gray-900 border-b border-green-500 outline-none w-full bg-transparent"
                      placeholder="Your Name"
                    />
                  ) : (
                    <h2 className="font-bold text-xl text-gray-900">{user.name}</h2>
                  )}
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">Customer</p>
                </div>

                <div className="space-y-4 w-full">
                  {/* Email Field */}
                  <div className="flex items-center space-x-3 text-sm text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-full"><Mail className="w-4 h-4 text-gray-400" /></div>
                    {isEditing ? (
                      <input name="email" value={formData.email} onChange={handleInputChange} className="border-b w-full outline-none focus:border-green-500" />
                    ) : (
                      <span className="truncate">{user.email}</span>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="flex items-center space-x-3 text-sm text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-full"><Phone className="w-4 h-4 text-gray-400" /></div>
                    {isEditing ? (
                      <input name="phone" value={formData.phone} onChange={handleInputChange} className="border-b w-full outline-none focus:border-green-500" />
                    ) : (
                      <span>{user.phone || "No phone number"}</span>
                    )}
                  </div>

                  {/* Address Fields */}
                  <div className="flex items-start space-x-3 text-sm text-gray-600 group">
                    <div className="p-2 bg-gray-50 rounded-full"><MapPin className="w-4 h-4 text-gray-400" /></div>
                    <div className="flex-1 space-y-2">
                      {isEditing ? (
                        <>
                          <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="border-b w-full outline-none block mb-1" />
                          <div className="flex gap-2">
                            <input name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className="border-b w-1/2 outline-none" />
                            <input name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className="border-b w-1/2 outline-none" />
                          </div>
                          <input name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Pincode" className="border-b w-full outline-none" />
                        </>
                      ) : (
                        <span className="leading-relaxed">
                          {user.address ? `${user.address}, ${user.city}, ${user.state} - ${user.pincode}` : "No address saved"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="p-2 bg-gray-50 rounded-full"><Calendar className="w-4 h-4 text-gray-400" /></div>
                    <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>

                <hr className="my-6 border-gray-100 w-full" />

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 border border-red-100 py-2.5 rounded-lg hover:bg-red-100 transition-all font-medium text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order History (Remains same) */}
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
                <p className="text-gray-500 text-sm italic">Retrieving your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-300 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                <Link to="/products" className="text-green-600 text-sm font-bold">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id || order._id} className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-sm text-gray-500">
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 mr-2">#{order.id || order._id}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status || "PROCESSING"}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                      </div>
                      <Link to={`/orders/${order.id || order._id}`} className="text-sm font-medium text-emerald-600 flex items-center">
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