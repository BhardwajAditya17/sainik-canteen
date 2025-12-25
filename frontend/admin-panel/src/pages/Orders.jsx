import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Eye,
  Search,
  ShoppingBag,
  Loader2,
  CreditCard,
  Package,
  ChevronDown
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dual filtering state
  const [orderFilter, setOrderFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [showOrderOptions, setShowOrderOptions] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/all-orders");
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    const orderId = (o.id || o._id || "").toString().toLowerCase();

    const matchSearch =
      orderId.includes(s) ||
      o.user?.name?.toLowerCase().includes(s) ||
      o.user?.email?.toLowerCase().includes(s);

    const matchOrderStat =
      orderFilter === "All" ||
      o.status?.toLowerCase() === orderFilter.toLowerCase();

    const matchPaymentStat =
      paymentFilter === "All" ||
      o.paymentStatus?.toLowerCase() === paymentFilter.toLowerCase();

    return matchSearch && matchOrderStat && matchPaymentStat;
  });

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "shipped":
      case "processing":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-screen bg-slate-50/30">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl font-black flex items-center gap-3 text-gray-900 uppercase tracking-tight">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <ShoppingBag size={20} />
          </div>
          Order Management
        </h1>
      </div>

      {/* Controls / Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 mb-6 shadow-sm space-y-8">

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-semibold"
            placeholder="Search by Order ID, customer or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Order Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOrderOptions(prev => !prev)}
              className="w-full flex justify-between items-center px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black uppercase tracking-wide"
            >
              <span className="flex items-center gap-2 text-slate-700">
                <Package size={16} />
                Order Status:
                <span
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${orderFilter === "All"
                      ? "bg-gray-100 text-gray-800 border-gray-200"
                      : getStatusColor(orderFilter)
                    }`}
                >
                  {orderFilter}
                </span>

              </span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {showOrderOptions && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-lg p-2 space-y-1">
                {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setOrderFilter(s);
                      setShowOrderOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-[11px] font-black uppercase transition ${orderFilter === s
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100 text-slate-600"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPaymentOptions(prev => !prev)}
              className="w-full flex justify-between items-center px-4 py-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-sm font-black uppercase tracking-wide"
            >
              <span className="flex items-center gap-2 text-emerald-700">
                <CreditCard size={16} />
                Payment Status:
                <span
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${paymentFilter === "All"
                      ? "bg-gray-100 text-gray-800 border-gray-200"
                      : getStatusColor(paymentFilter)
                    }`}
                >
                  {paymentFilter}
                </span>

              </span>
              <ChevronDown size={16} className="text-slate-400" />
            </button>

            {showPaymentOptions && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-emerald-200 rounded-2xl shadow-lg p-2 space-y-1">
                {["All", "Paid", "Pending", "Failed"].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setPaymentFilter(s);
                      setShowPaymentOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-xl text-[11px] font-black uppercase transition ${paymentFilter === s
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-emerald-50 text-emerald-700"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>



      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-left">Order ID</th>
              <th className="px-6 py-5 text-left">Customer</th>
              <th className="px-6 py-5 text-left">Date</th>
              <th className="px-6 py-5 text-left">Amount</th>
              <th className="px-6 py-5 text-left">Order Status</th>
              <th className="px-6 py-5 text-left">Payment Status</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map(o => (
              <tr key={o.id || o._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-emerald-600 font-bold text-xs">
                  #{(o.id || o._id).toString().slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black border border-slate-200 uppercase">
                      {o.user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none">{o.user?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{o.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-black text-slate-900">₹{o.totalAmount}</td>

                {/* READ ONLY ORDER STATUS */}
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>

                {/* READ ONLY PAYMENT STATUS */}
                <td className="px-6 py-4">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(o.paymentStatus || 'pending')}`}>
                    {o.paymentStatus || 'Pending'}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => navigate(`/orders/${o.id || o._id}`)}
                    className="p-2.5 bg-slate-100 text-slate-500 hover:text-white hover:bg-emerald-600 rounded-xl transition-all inline-flex items-center justify-center border border-slate-200"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map(o => (
          <div key={o.id || o._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  #{(o.id || o._id).toString().slice(-6).toUpperCase()}
                </span>
                <p className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                  {new Date(o.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => navigate(`/orders/${o.id || o._id}`)}
                className="p-2 bg-slate-50 text-slate-900 rounded-lg border border-slate-200"
              >
                <Eye size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 py-2 border-b border-slate-50">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 border border-slate-200 uppercase">
                {o.user?.name?.[0]}
              </div>
              <div className="overflow-hidden">
                <p className="font-black text-slate-900 truncate">{o.user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{o.user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order Status</span>
                <span className={`text-center py-2 rounded-xl text-[9px] font-black uppercase border ${getStatusColor(o.status)}`}>
                  {o.status}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</span>
                <span className={`text-center py-2 rounded-xl text-[9px] font-black uppercase border ${getStatusColor(o.paymentStatus || 'pending')}`}>
                  {o.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
              <span className="text-base font-black text-white">₹{o.totalAmount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}