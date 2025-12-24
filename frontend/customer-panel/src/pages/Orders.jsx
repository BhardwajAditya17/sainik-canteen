import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Clock, AlertCircle, CheckCircle, ChevronRight, ShoppingBag, Calendar } from "lucide-react";
import api from "../api/axios";

const Orders = () => {
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        let orderData = [];
        if (Array.isArray(res.data)) {
          orderData = res.data;
        } else if (res.data && Array.isArray(res.data.orders)) {
          orderData = res.data.orders;
        } else if (res.data && Array.isArray(res.data.data)) {
          orderData = res.data.data;
        }
        setOrders(orderData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Could not load your order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return <CheckCircle size={14} />;
    if (s === 'cancelled') return <AlertCircle size={14} />;
    return <Clock size={14} />;
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500">Loading your orders...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl text-center max-w-md shadow-sm">
        <AlertCircle size={48} className="mx-auto mb-2" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm underline hover:text-red-800">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Package className="text-emerald-600" /> My Orders
        </h1>

        {!Array.isArray(orders) || orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
            <div className="bg-emerald-50 p-6 rounded-full mb-6">
              <ShoppingBag size={48} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-xs">Looks like you haven't made your first purchase yet.</p>
            <Link to="/products" className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg hover:shadow-emerald-500/30">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex gap-6 sm:gap-12">
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Order Placed</span>
                      <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Total</span>
                      <span className="text-sm font-bold text-gray-900">₹{order.totalAmount || order.totalPrice || order.total}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status || "PROCESSING"}
                    </span>
                    <span className="hidden sm:block text-gray-400">Order #{order.id.toString().slice(-6)}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3 w-full">
                    {(order.items || order.orderItems || []).slice(0, 2).map((item, index) => {
                      const imgSrc = item.product?.imageUrl || item.product?.image;
                      return (
                        <div key={index} className="flex items-center gap-4">
                          <div className="h-20 w-20 flex-shrink-0 bg-gray-100 rounded-xl border flex items-center justify-center p-1">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={item.product?.name}
                                className="h-full w-full object-contain mix-blend-multiply"
                              />
                            ) : (
                              <Package className="text-gray-400" size={28} />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 line-clamp-1">
                               {item.product?.name || "Product Item"}
                            </h4>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      );
                    })}

                    {(order.items || []).length > 2 && (
                      <p className="text-xs text-gray-500 pl-2">
                        + {(order.items.length - 2)} more items
                      </p>
                    )}
                  </div>

                  <div className="w-full sm:w-auto mt-2 sm:mt-0">
                    <button className="w-full sm:w-auto px-6 py-2 border border-emerald-600 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition flex items-center justify-center gap-2 group-hover:bg-emerald-600 group-hover:text-white">
                      View Details <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
