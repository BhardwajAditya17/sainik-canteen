import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from "../api/axios";
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, 
  User, Loader2, ShoppingBag, ChevronRight, 
  ChevronLeft, IndianRupee, Briefcase
} from 'lucide-react';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/users/${id}`);
        if (data.success) setUser(data.user);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s === 'shipped') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (s === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-amber-50 text-amber-700 border-amber-100'; 
  };

  const getPaymentStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'paid') return 'bg-emerald-500 text-white border-transparent';
    if (s === 'failed') return 'bg-rose-500 text-white border-transparent';
    return 'bg-slate-200 text-slate-700 border-transparent'; 
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600" size={32} />
    </div>
  );

  if (!user) return <div className="p-10 text-center font-bold text-slate-400">USER NOT FOUND</div>;

  // Pagination Logic
  const allOrders = user.orders || [];
  const totalSpent = allOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0) || 0;
  
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = allOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(allOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 font-sans antialiased text-slate-900 bg-slate-50/30 min-h-screen">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/users')} 
          className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-all text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: Profile & Address */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-24 bg-emerald-900" />
            <div className="px-6 pb-6 text-center">
              <div className="relative -mt-12 mb-4 h-24 w-24 rounded-3xl bg-white p-1 shadow-xl mx-auto border border-slate-50">
                <div className="h-full w-full rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl font-black text-emerald-600">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h1 className="text-2xl font-black tracking-tight">{user.name}</h1>
              <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Briefcase size={12} /> {user.role}
              </span>
            </div>

            <div className="px-6 pb-8 space-y-5 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-4 group">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-emerald-600 transition-colors"><Mail size={18} /></div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-emerald-600 transition-colors"><Phone size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-bold">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:text-emerald-600 transition-colors"><Calendar size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Joined On</p>
                  <p className="text-sm font-semibold">{new Date(user.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <MapPin size={14} className="text-emerald-600" /> Address
             </h3>
             {user.address || user.city ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Street</p>
                    <p className="text-sm font-bold">{user.address}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">City/State</p>
                        <p className="text-sm font-semibold">{user.city}, {user.state}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">PIN</p>
                        <p className="text-sm font-black text-emerald-600">{user.pincode}</p>
                    </div>
                  </div>
                </div>
             ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs font-medium italic">
                  No address information provided
                </div>
             )}
          </div>
        </div>

        {/* MAIN: History & Pagination */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Spent</p>
                <h4 className="text-2xl font-black text-slate-900">₹{totalSpent.toLocaleString('en-IN')}</h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><IndianRupee size={20} /></div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Orders</p>
                <h4 className="text-2xl font-black text-slate-900">{allOrders.length}</h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><ShoppingBag size={20} /></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
               <h3 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Transaction History</h3>
               <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Page {currentPage} of {totalPages || 1}</span>
            </div>
            
            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Payment</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="group hover:bg-slate-50/30 transition-all">
                      <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400 group-hover:text-slate-900">#{order.id}</td>
                      <td className="px-6 py-4 text-xs text-slate-600 font-semibold">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4">
                        <div className={`mx-auto px-3 py-1 rounded-full text-[9px] font-black uppercase border text-center w-fit tracking-tighter shadow-sm ${getStatusStyle(order.status)}`}>
                          {order.status || 'Pending'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`mx-auto px-3 py-1 rounded-full text-[9px] font-black uppercase text-center w-fit tracking-tighter shadow-sm ${getPaymentStyle(order.paymentStatus)}`}>
                          {order.paymentStatus || 'Pending'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-black text-slate-900">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/orders/${order.id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                          <ChevronRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allOrders.length === 0 && (
                <div className="py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No transaction history</div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 transition-colors"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-emerald-600 transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;