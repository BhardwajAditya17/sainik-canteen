import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Printer,
  Calendar,
  CreditCard,
  Loader2,
  CheckCircle2,
  User as UserIcon,
  ChevronDown
} from "lucide-react";

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const PAYMENT_OPTIONS = ["Pending", "Paid", "Failed"];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      const orderData = res.data.success ? res.data.order : res.data;
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order details", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async (field, value) => {
    try {
      setUpdating(true);
      await api.put(`/orders/status/${id}`, { [field]: value });
      setOrder(prev => ({ ...prev, [field]: value }));
    } catch (err) {
      alert("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
      <Loader2 className="animate-spin text-emerald-600" size={32} />
    </div>
  );

  if (!order) return <div className="p-10 text-center text-slate-500 font-medium">Order records not found.</div>;

  const {
    address, city, pincode, state, phone, name,
    orderItems = [], totalAmount = 0, status,
    paymentMethod, paymentStatus, createdAt, user
  } = order;

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen bg-slate-50/50 py-4 sm:py-8 px-4 sm:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation - Stacked on Mobile */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button 
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-colors text-xs uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <button 
            onClick={() => window.print()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm text-xs uppercase tracking-wide"
          >
            <Printer size={16} /> Order Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: Main Order Content */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">Order #{order.id}</h1>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                    <Calendar size={12} /> {new Date(createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Status Dropdown */}
                <div className="relative w-full sm:w-auto">
                  <select 
                    value={status} 
                    onChange={(e) => handleUpdateStatus('status', e.target.value)}
                    disabled={updating}
                    className={`w-full sm:w-auto appearance-none pl-4 pr-10 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer outline-none ${
                      status === 'Delivered' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                </div>
              </div>

              {/* Responsive Table Wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] sm:min-w-0">
                  <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left">Product</th>
                      <th className="px-4 sm:px-6 py-4 text-left">Rate</th>
                      <th className="px-4 sm:px-6 py-4 text-center">Qty</th>
                      <th className="px-4 sm:px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {orderItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-50 rounded-lg border border-slate-100 p-1 flex-shrink-0">
                              <img src={item.product?.image || item.image} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-xs sm:text-sm">{item.product?.name || item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {item.productId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-slate-600 font-medium">{formatCurrency(item.price)}</td>
                        <td className="px-4 sm:px-6 py-4 text-center text-xs sm:text-sm font-bold text-slate-900">x{item.quantity}</td>
                        <td className="px-4 sm:px-6 py-4 text-right text-xs sm:text-sm font-bold text-slate-900">{formatCurrency(Number(item.price || 0) * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TOTAL BLOCK: EMERALD 600 */}
              <div className="p-6 sm:p-8 bg-gray-100 flex flex-col items-end gap-3">
                <div className="flex justify-between w-full max-w-[240px] text-sm font-bold uppercase text-[10px] opacity-80">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between w-full max-w-[240px] text-sm font-bold uppercase text-[10px] opacity-80">
                  <span>Shipping</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">Free</span>
                </div>
                <div className="flex justify-between w-full max-w-[240px] pt-4 mt-2 border-t border-white/20">
                  <span className="font-bold uppercase text-[11px] tracking-tight">Total Payable</span>
                  <span className="font-black text-xl sm:text-2xl leading-none">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar info cards */}
          <div className="space-y-6">
            
            {/* Buyer Profile */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <UserIcon size={14} className="text-emerald-600" /> Buyer Profile
              </h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 bg-emerald-100 text-emerald-700 flex items-center justify-center rounded-xl font-bold text-lg border border-emerald-200 shadow-sm">
                    {(user?.name || name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm leading-tight">{user?.name || name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Ref ID: {user?.id || "N/A"}</p>
                  </div>
                </div>
                <div className="pt-4 space-y-3 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                    <Mail size={14} className="text-slate-300 flex-shrink-0" />
                    <span className="truncate">{user?.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-600">
                    <Phone size={14} className="text-slate-300 flex-shrink-0" />
                    <span>{phone || user?.phone || "No contact info"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin size={14} className="text-emerald-600" /> Delivery Address
              </h3>
              <div className="text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                <p className="text-slate-900 font-bold mb-1">{name || user?.name}</p>
                <p>{address}</p>
                <p>{city}, {state}</p>
                <p className="mt-3 text-slate-900 font-bold">PIN Code: {pincode}</p>
              </div>
            </div>

            {/* Billing Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard size={14} className="text-emerald-600" /> Billing Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Method</span>
                  <span className="text-slate-900 font-bold uppercase text-xs">{paymentMethod || "COD"}</span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Payment Status</label>
                  <div className="relative">
                    <select 
                      value={paymentStatus} 
                      onChange={(e) => handleUpdateStatus('paymentStatus', e.target.value)}
                      disabled={updating}
                      className={`w-full appearance-none p-3 border rounded-xl text-xs font-bold outline-none cursor-pointer transition-all ${
                        paymentStatus === 'Paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
                  </div>
                </div>

                {paymentStatus === 'Paid' && (
                  <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-700 font-bold bg-emerald-50 py-2.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={12} /> SECURE & VERIFIED
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;