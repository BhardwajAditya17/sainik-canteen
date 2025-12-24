import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Eye,
  Search,
  Package,
  Calendar,
  MapPin,
  User,
  X,
  Filter
} from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    await api.put(`/orders/status/${id}`, { status });
    setOrders(o => o.map(x => x.id === id ? { ...x, status } : x));
    if (selectedOrder?.id === id)
      setSelectedOrder(prev => ({ ...prev, status }));
  };

  const filteredOrders = orders.filter(o => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      o.id.toString().includes(s) ||
      o.user?.name?.toLowerCase().includes(s) ||
      o.user?.email?.toLowerCase().includes(s);

    const matchStatus =
      filterStatus === "All" ||
      o.status.toLowerCase().includes(filterStatus.toLowerCase());

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
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto font-sans">

      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <Package className="text-emerald-600" /> Orders
        </h1>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border mb-6 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            className="
              w-full pl-10 pr-4 py-2 border rounded-lg
              outline-none focus:outline-none
              focus:ring-2 focus:ring-emerald-500/20
              focus:border-emerald-500
            "
            placeholder="Search orders..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {["All","Pending","Processing","Shipped","Delivered","Cancelled"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
                filterStatus === s
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase border-b">
            <tr>
              <th className="px-6 py-4 text-left font-medium">Order</th>
              <th className="px-6 py-4 text-left font-medium">Customer</th>
              <th className="px-6 py-4 text-left font-medium">Date</th>
              <th className="px-6 py-4 text-left font-medium">Total</th>
              <th className="px-6 py-4 text-left font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-emerald-600 font-medium">
                  #{o.id.toString().slice(-6)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-200">
                      {o.user?.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{o.user?.name}</p>
                      <p className="text-xs text-gray-500">{o.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={14} />
                      {new Date(o.createdAt).toLocaleDateString()}
                   </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-800">₹{o.totalAmount}</td>
                <td className="px-6 py-4">
                  <div className="relative inline-block">
                    <select
                        value={o.status}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                        className={`
                        appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer
                        outline-none focus:outline-none
                        focus:ring-2 focus:ring-emerald-500/30
                        ${getStatusColor(o.status)}
                        `}
                    >
                        {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s =>
                        <option key={s} value={s}>{s}</option>
                        )}
                    </select>
                    {/* Custom Arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
                        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
          <div key={o.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
            {/* Top Row: User & ID */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold border border-emerald-200">
                  {o.user?.name?.[0] || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{o.user?.name}</p>
                    <span className="font-mono text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        #{o.id.toString().slice(-6)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{o.user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(o)}
                className="p-2 text-gray-400 hover:text-emerald-600 bg-gray-50 rounded-lg transition-colors"
              >
                <Eye size={18} />
              </button>
            </div>

            {/* Middle Row: Date & Amount */}
            <div className="flex items-center justify-between py-3 border-t border-b border-gray-50">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={14} />
                    {new Date(o.createdAt).toLocaleDateString()}
                </div>
                <div className="text-base font-bold text-gray-800">
                    ₹{o.totalAmount}
                </div>
            </div>

            {/* Bottom Row: Status Dropdown */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</span>
                <div className="relative">
                    <select
                        value={o.status}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                        className={`
                        appearance-none pl-4 pr-9 py-2 rounded-lg text-sm font-semibold border cursor-pointer w-full
                        outline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30
                        ${getStatusColor(o.status)}
                        `}
                    >
                        {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s =>
                        <option key={s} value={s}>{s}</option>
                        )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-60">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Responsive */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50/50 sticky top-0">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
                <p className="text-xs text-emerald-600 font-mono font-medium">ID: #{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Customer Section */}
              <div>
                 <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer Information</h3>
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-full text-emerald-600 shadow-sm">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{selectedOrder.user?.name}</p>
                            <p className="text-xs text-gray-500">{selectedOrder.user?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-full text-emerald-600 shadow-sm mt-0.5">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-700 leading-relaxed">{selectedOrder.address}</p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Order Summary Section */}
              <div>
                 <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order Items</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                    </span>
                 </div>
                 {/* Placeholder for items - as items weren't in the original object structure shown, 
                     but assuming they might be there or just showing summary */}
                 <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 p-3 text-sm flex justify-between font-medium text-gray-600">
                        <span>Total Amount</span>
                        <span className="text-gray-900">₹{selectedOrder.totalAmount}</span>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="p-5 border-t bg-gray-50 flex justify-end">
                <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 shadow-sm transition-colors text-sm"
                >
                    Close Details
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}