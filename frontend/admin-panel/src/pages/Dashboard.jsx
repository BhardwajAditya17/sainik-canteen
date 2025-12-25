import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Minus,
  ArrowUpRight, 
  Package, 
  Clock,
  Loader2,
  AlertTriangle,
  ChevronRight,
  IndianRupee,
  LayoutDashboard,
  CalendarDays
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    users: 0, orders: 0, revenue: 0,
    usersTrend: null, ordersTrend: null, revenueTrend: null 
  });
  const [lowStockProducts, setLowStockProducts] = useState([]); 
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Helper to strictly parse dates (handles Firestore Timestamps if needed)
      const parseDate = (dateInput) => {
        if (!dateInput) return null;
        // Check for Firestore Timestamp object { seconds, nanoseconds }
        if (typeof dateInput === 'object' && dateInput.seconds) {
            return new Date(dateInput.seconds * 1000);
        }
        return new Date(dateInput);
      };

      // Helper to check if a date matches
      const isSameDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getDate() === d2.getDate() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getFullYear() === d2.getFullYear();
      };

      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Helper to calculate percentage change
      const calculateTrend = (current, previous) => {
        if (previous === 0) {
            return null; 
        }
        return ((current - previous) / previous) * 100;
      };

      // 1. Fetch Orders
      const ordersRes = await api.get("/orders/all-orders");
      const ordersData = ordersRes.data;
      const allOrders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
      
      // Calculate Today's stats
      const todaysOrders = allOrders.filter(order => isSameDay(parseDate(order.createdAt), today));
      const totalOrdersToday = todaysOrders.length;
      const totalRevenueToday = todaysOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      
      // Calculate Unique Users Who Ordered Today
      // Checks for user object with ID or userId field
      const uniqueUsersToday = new Set(todaysOrders.map(order => order.user?._id || order.user?.id || order.userId)).size;

      // Calculate Yesterday's stats for trend
      const yesterdaysOrders = allOrders.filter(order => isSameDay(parseDate(order.createdAt), yesterday));
      const totalOrdersYesterday = yesterdaysOrders.length;
      const totalRevenueYesterday = yesterdaysOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      
      // Calculate Unique Users Who Ordered Yesterday
      const uniqueUsersYesterday = new Set(yesterdaysOrders.map(order => order.user?._id || order.user?.id || order.userId)).size;

      // 2. Set Stats with Trends
      // Note: We no longer fetch /users here as we are calculating active users from orders
      setStats({
        users: uniqueUsersToday,
        orders: totalOrdersToday,
        revenue: totalRevenueToday,
        usersTrend: calculateTrend(uniqueUsersToday, uniqueUsersYesterday),
        ordersTrend: calculateTrend(totalOrdersToday, totalOrdersYesterday),
        revenueTrend: calculateTrend(totalRevenueToday, totalRevenueYesterday)
      });
      
      // Recent orders list (sorted by newest)
      const recentOrders = [...allOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setOrders(recentOrders);

      // 3. Fetch Products for Low Stock Logic
      const productsRes = await api.get("/products");
      const allProducts = Array.isArray(productsRes.data) 
        ? productsRes.data 
        : (productsRes.data.products || productsRes.data.items || []);

      const lowStock = allProducts
        .filter(product => product.stock < 2)
        .slice(0, 5);
      
      setLowStockProducts(lowStock);

    } catch (err) {
      console.error("Dashboard data load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, iconBg, trend }) => {
    let TrendIcon = Minus;
    let trendColor = "text-slate-500 bg-slate-100";
    let trendLabel = "No prior data";
    
    if (trend !== null) {
        if (trend > 0) {
            TrendIcon = TrendingUp;
            trendColor = "text-emerald-600 bg-emerald-50";
        } else if (trend < 0) {
            TrendIcon = TrendingDown;
            trendColor = "text-rose-600 bg-rose-50";
        }
        trendLabel = `${Math.abs(trend).toFixed(1)}%`;
    }

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-200 group">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} className={colorClass} />
          </div>
          <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${trendColor}`}>
              {trend !== null && <TrendIcon size={14} className="mr-1" />}
              <span>{trendLabel}</span>
          </div>
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
            <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1">
               vs yesterday
            </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-slate-500 font-medium animate-pulse">Loading dashboard overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="h-7 w-7 text-emerald-600" /> Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
            <Link to="/products" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm shadow-emerald-200 flex items-center gap-2 active:scale-95">
                <Package size={18} /> Manage Inventory
            </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Today's Revenue" 
          value={`₹${(stats.revenue || 0).toLocaleString('en-IN')}`} 
          icon={IndianRupee} 
          iconBg="bg-emerald-100"
          colorClass="text-emerald-600"
          trend={stats.revenueTrend}
        />
        <StatCard 
          title="Orders Today" 
          value={stats.orders || 0} 
          icon={ShoppingBag} 
          iconBg="bg-blue-100"
          colorClass="text-blue-600"
          trend={stats.ordersTrend}
        />
        <StatCard 
          title="Users Ordered Today" 
          value={stats.users || 0} 
          icon={Users} 
          iconBg="bg-purple-100"
          colorClass="text-purple-600"
          trend={stats.usersTrend}
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <Clock size={20} className="text-slate-400" /> Recent Orders
            </h2>
            <Link to="/orders" className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 hover:underline flex items-center gap-1 transition-colors">
              View All <ArrowUpRight size={16} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-xs tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShoppingBag size={32} className="text-slate-300" />
                        <p>No recent orders found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-600">
                        #{order.id.toString().slice(-6)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {order.user?.name || "Guest"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                          ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/orders`} className="text-slate-400 hover:text-emerald-600 transition-colors">
                          <ChevronRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <AlertTriangle size={20} className="text-amber-500" /> Low Stock Alerts
                </h2>
            </div>
            
            <div className="p-6 flex-1 space-y-4">
                {lowStockProducts.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30">
                      <Package size={40} className="mb-3 text-emerald-200" />
                      <p className="text-slate-600 font-medium">All stock levels are healthy!</p>
                      <p className="text-xs mt-1">Great job maintaining inventory.</p>
                   </div>
                ) : (
                  lowStockProducts.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100 group transition-all hover:bg-amber-50 hover:shadow-sm">
                          <div>
                              <p className="font-semibold text-slate-800 text-sm mb-0.5">{item.name}</p>
                              <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                <AlertTriangle size={10} />
                                {item.stock === 0 ? "Out of stock" : `Only ${item.stock} left`}
                              </p>
                          </div>
                          <Link to="/products" className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all font-medium">
                              Restock
                          </Link>
                      </div>
                  ))
                )}
            </div>
            
            {lowStockProducts.length > 0 && (
             <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <Link to="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-1 transition-colors">
                    Manage Inventory <ArrowUpRight size={14} />
                </Link>
            </div>
            )}
        </div>

      </div>
    </div>
  );
}