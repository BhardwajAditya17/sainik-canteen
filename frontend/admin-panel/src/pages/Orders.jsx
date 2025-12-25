import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  Eye, Search, ShoppingBag, Loader2, CreditCard,
  Package, ChevronDown, Calendar, Clock, Plus
} from "lucide-react";

export default function Orders() {
  const navigate = useNavigate();

  // 1. Initialize state from sessionStorage or defaults
  const [searchTerm, setSearchTerm] = useState(sessionStorage.getItem("order_search") || "");
  const [orderFilter, setOrderFilter] = useState(sessionStorage.getItem("order_status") || "Pending");
  const [paymentFilter, setPaymentFilter] = useState(sessionStorage.getItem("order_payment") || "All");
  const [timeFilter, setTimeFilter] = useState(sessionStorage.getItem("order_time") || "All Time");
  const [page, setPage] = useState(parseInt(sessionStorage.getItem("order_page")) || 1);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const [showOrderOptions, setShowOrderOptions] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showTimeOptions, setShowTimeOptions] = useState(false);

  // 2. Persist filters to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("order_search", searchTerm);
    sessionStorage.setItem("order_status", orderFilter);
    sessionStorage.setItem("order_payment", paymentFilter);
    sessionStorage.setItem("order_time", timeFilter);
    sessionStorage.setItem("order_page", page);
  }, [searchTerm, orderFilter, paymentFilter, timeFilter, page]);

  /**
   * Fetch Logic
   * We use a "fetchUpToPage" approach: if a user was on page 3, 
   * we fetch all 150 records so the scroll position/list remains the same.
   */
  const fetchOrders = useCallback(async (targetPage, isAppending = false) => {
    if (isAppending) setLoadingMore(true);
    else setLoading(true);

    try {
      // If we are returning from a detail page and targetPage > 1, 
      // we need to fetch all pages up to targetPage to restore the list
      const limitToFetch = isAppending ? 50 : 50 * targetPage;
      const pageToRequest = isAppending ? targetPage : 1;

      const { data } = await api.get("/orders/all-orders", {
        params: {
          page: pageToRequest,
          limit: limitToFetch,
          search: searchTerm,
          status: orderFilter,
          paymentStatus: paymentFilter,
          timeRange: timeFilter
        }
      });

      const newOrders = data.orders || [];
      setOrders(prev => isAppending ? [...prev, ...newOrders] : newOrders);
      setTotalResults(data.totalOrders || 0);
      setHasMore(data.currentPage < data.totalPages);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, orderFilter, paymentFilter, timeFilter]);

  // Initial load and filter resets
  useEffect(() => {
    // If it's a fresh filter change, we reset to page 1
    // Otherwise (on mount), we use the persisted page
    fetchOrders(page, false);
  }, [searchTerm, orderFilter, paymentFilter, timeFilter]);

  const handleViewMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, true);
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1); // Reset page on filter change
  };

  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case "delivered": case "paid": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "shipped": case "processing": return "bg-sky-100 text-sky-800 border-sky-200";
      case "cancelled": case "failed": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
          <div className="p-2.5 rounded-2xl text-emerald-600 ">
            <ShoppingBag size={24} />
          </div>
          Orders Management
        </h1>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => {
                    sessionStorage.clear();
                    window.location.reload();
                }}
                className="text-[10px] font-black text-slate-400 uppercase hover:text-red-500 transition-colors"
            >
                Clear Filters
            </button>
            <div className="bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black text-slate-400 uppercase tracking-widest">
            Found: <span className="text-emerald-600 ml-1">{totalResults} Orders</span>
            </div>
        </div>
      </div>

      {/* Controls / Filters */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 mb-8 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600/50" size={20} />
          <input
            className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-semibold"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => handleFilterChange(setSearchTerm, e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Time Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowTimeOptions(!showTimeOptions); setShowOrderOptions(false); setShowPaymentOptions(false); }}
              className={`w-full flex justify-between items-center px-6 py-4 rounded-2xl border transition-all ${showTimeOptions ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50'}`}
            >
              <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Calendar size={16} className="text-emerald-600" />
                Time: <span className="text-slate-900">{timeFilter}</span>
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showTimeOptions ? 'rotate-180' : ''}`} />
            </button>
            {showTimeOptions && (
              <div className="absolute z-30 mt-3 w-full bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl p-2.5 space-y-1">
                {["Day", "Week", "Month", "Year", "All Time"].map(t => (
                  <button key={t} onClick={() => { handleFilterChange(setTimeFilter, t); setShowTimeOptions(false); }} className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase transition ${timeFilter === t ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "hover:bg-emerald-50 text-slate-600"}`}>{t}</button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowOrderOptions(!showOrderOptions); setShowTimeOptions(false); setShowPaymentOptions(false); }}
              className={`w-full flex justify-between items-center px-6 py-4 rounded-2xl border transition-all ${showOrderOptions ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50'}`}
            >
              <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Package size={16} className="text-emerald-600" />
                Status: <span className="text-slate-900">{orderFilter}</span>
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showOrderOptions ? 'rotate-180' : ''}`} />
            </button>
            {showOrderOptions && (
              <div className="absolute z-30 mt-3 w-full bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl p-2.5 space-y-1">
                {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(s => (
                  <button key={s} onClick={() => { handleFilterChange(setOrderFilter, s); setShowOrderOptions(false); }} className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase transition ${orderFilter === s ? "bg-slate-900 text-white" : "hover:bg-emerald-50 text-slate-600"}`}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Filter */}
          <div className="relative">
            <button
              onClick={() => { setShowPaymentOptions(!showPaymentOptions); setShowTimeOptions(false); setShowOrderOptions(false); }}
              className={`w-full flex justify-between items-center px-6 py-4 rounded-2xl border transition-all ${showPaymentOptions ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50'}`}
            >
              <span className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <CreditCard size={16} className="text-emerald-600" />
                Payment: <span className="text-slate-900">{paymentFilter}</span>
              </span>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showPaymentOptions ? 'rotate-180' : ''}`} />
            </button>
            {showPaymentOptions && (
              <div className="absolute z-30 mt-3 w-full bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl p-2.5 space-y-1">
                {["All", "Paid", "Pending", "Failed"].map(s => (
                  <button key={s} onClick={() => { handleFilterChange(setPaymentFilter, s); setShowPaymentOptions(false); }} className={`w-full text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase transition ${paymentFilter === s ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : "hover:bg-emerald-50 text-slate-600"}`}>{s}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-left">Order Info</th>
                  <th className="px-8 py-6 text-left">Customer</th>
                  <th className="px-8 py-6 text-left">Order Status</th>
                  <th className="px-8 py-6 text-left">Payment</th>
                  <th className="px-8 py-6 text-left">Total</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(o => (
                  <tr key={o.id || o._id} className="hover:bg-emerald-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-mono text-emerald-600 font-bold text-xs uppercase">#{(o.id || o._id).toString().slice(-6)}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-1 uppercase">
                        <Clock size={12} className="text-slate-300" /> {new Date(o.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black uppercase">
                          {o.user?.name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none text-xs uppercase">{o.user?.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">{o.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${getStatusColor(o.paymentStatus || 'pending')}`}>
                        {o.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-900 text-base">₹{o.totalAmount}</td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => navigate(`/orders/${o.id || o._id}`)}
                        className="p-3 bg-white text-slate-400 hover:text-emerald-600 border border-slate-100 rounded-2xl transition-all shadow-sm"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View - reusing same logic */}
          <div className="md:hidden space-y-5">
            {orders.map(o => (
                <div key={o.id || o._id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-5">
                    <div className="flex justify-between items-center">
                    <span className="font-mono text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                        #{(o.id || o._id).toString().slice(-6).toUpperCase()}
                    </span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                    </div>
                    <button
                        onClick={() => navigate(`/orders/${o.id || o._id}`)}
                        className="w-full flex justify-between items-center bg-slate-900 text-white px-6 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95 transition-transform"
                    >
                    <span className="flex items-center gap-2">Total: <span className="text-emerald-400 text-sm">₹{o.totalAmount}</span></span>
                    <Eye size={18} />
                    </button>
                </div>
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 mb-20 flex justify-center">
              <button
                onClick={handleViewMore}
                disabled={loadingMore}
                className="group relative flex items-center gap-3 bg-white border-2 border-emerald-600 px-10 py-4 rounded-[2rem] text-emerald-600 font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-emerald-600 hover:text-white shadow-xl shadow-emerald-100 disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {loadingMore ? "Loading..." : "View More Orders"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}