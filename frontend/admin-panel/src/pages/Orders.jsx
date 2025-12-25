import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Eye,
  Search,
  ShoppingBag,
  Loader2,
  ChevronDown
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  
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

  const handleStatusChange = async (id, status) => {
    try {
        await api.put(`/orders/status/${id}`, { status });
        setOrders(o => o.map(x => (x.id === id || x._id === id) ? { ...x, status } : x));
    } catch (err) {
        console.error("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    const orderId = (o.id || o._id || "").toString().toLowerCase();
    const matchSearch =
      orderId.includes(s) ||
      o.user?.name?.toLowerCase().includes(s) ||
      o.user?.email?.toLowerCase().includes(s);

    const matchStatus =
      filterStatus === "All" ||
      o.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchSearch && matchStatus;
  });

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "shipped": return "bg-sky-100 text-sky-800 border-sky-200";
      case "processing": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex flex-col lg:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
            placeholder="Search by Order ID, customer or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {["All","Pending","Processing","Shipped","Delivered","Cancelled"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${
                filterStatus === s
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                  : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
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
              <th className="px-6 py-5 text-left">Status</th>
              <th className="px-6 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map(o => (
              <tr key={o.id || o._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-emerald-600 font-bold">
                  #{(o.id || o._id).toString().slice(-6).toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black border border-emerald-200">
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
                <td className="px-6 py-4">
                    <div className="relative w-fit">
                      <select
                          value={o.status}
                          onChange={e => handleStatusChange(o.id || o._id, e.target.value)}
                          className={`
                          appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-black uppercase border cursor-pointer outline-none focus:ring-4 focus:ring-emerald-500/10
                          ${getStatusColor(o.status)}
                          `}
                      >
                          {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s =>
                          <option key={s} value={s}>{s}</option>
                          )}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* FIXED: Removed text-sliding logic, kept clean icon button */}
                  <button
                    onClick={() => navigate(`/orders/${o.id || o._id}`)}
                    className="p-2.5 bg-slate-100 text-slate-500 hover:text-white hover:bg-emerald-600 rounded-xl transition-all inline-flex items-center justify-center border border-slate-200"
                    title="View Details"
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

            <div className="flex items-center gap-3 py-2">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-700 border border-slate-200">
                  {o.user?.name?.[0]}
                </div>
                <div className="overflow-hidden">
                    <p className="font-black text-slate-900 truncate">{o.user?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{o.user?.email}</p>
                </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-base font-black text-slate-900">₹{o.totalAmount}</span>
            </div>

            <div className="relative">
              <select
                  value={o.status}
                  onChange={e => handleStatusChange(o.id || o._id, e.target.value)}
                  className={`w-full appearance-none p-3.5 rounded-xl text-[10px] font-black uppercase border outline-none shadow-sm transition-all ${getStatusColor(o.status)}`}
              >
                  {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s =>
                  <option key={s} value={s}>{s}</option>
                  )}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}