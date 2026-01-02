import React, { useEffect, useState, useMemo } from 'react';
import api from '../api/axios'; 
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users as UsersIcon, 
  Calendar,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Package,
  PieChart as PieChartIcon,
  Clock,
  Loader2
} from 'lucide-react';

// --- UTILS ---
const COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const parseNumber = (val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
  }
  return 0;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(Number(num) || 0);
};

// --- COMPONENTS ---
const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, loading, subtext }) => {
  if (loading) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-pulse h-36">
       <div className="flex justify-between mb-4">
          <div className="h-4 w-24 bg-slate-100 rounded"></div>
          <div className="h-10 w-10 bg-slate-100 rounded-xl"></div>
       </div>
       <div className="h-8 w-32 bg-slate-100 rounded mb-2"></div>
       <div className="h-3 w-20 bg-slate-100 rounded"></div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md hover:border-emerald-200 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500">{title}</h3>
        <div className={`p-2.5 rounded-xl ${bgClass} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} className={colorClass} />
        </div>
      </div>
      <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h2>
      {subtext && <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>}
    </div>
  );
};

export default function Analytics() {
  const [rawData, setRawData] = useState({
    chartData: [],
    pieChartData: [],
    topProducts: [],
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  
  const [timeRange, setTimeRange] = useState('7d');
  const [interval, setInterval] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAvailableIntervals = (range) => {
    switch(range) {
      case '7d': return ['day'];
      case '30d': return ['day', 'week'];
      case '90d': return ['day', 'week', 'month'];
      case 'all': return ['day', 'week', 'month', 'year'];
      default: return ['day'];
    }
  };

  const availableIntervals = getAvailableIntervals(timeRange);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/admin/analytics?range=${timeRange}&interval=${interval}`);
      
      if (res.data) {
        setRawData({
          chartData: (res.data.chartData || []).map(item => ({
            ...item,
            sales: parseNumber(item.sales)
          })),
          pieChartData: (res.data.pieChartData || []).map(item => ({
            ...item,
            value: parseNumber(item.value)
          })),
          topProducts: (res.data.topProducts || []).map(item => ({
            ...item,
            sales: parseNumber(item.sales)
          })),
          totalUsers: parseNumber(res.data.totalUsers),
          totalOrders: parseNumber(res.data.totalOrders),
          totalRevenue: parseNumber(res.data.totalRevenue)
        });
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
      setError("Failed to load analytics data. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const valid = getAvailableIntervals(timeRange);
    if (!valid.includes(interval)) {
      setInterval(valid[0]); 
      return; 
    }
    fetchAnalytics();
  }, [timeRange, interval]);

  const stats = useMemo(() => {
    const periodRevenue = rawData.totalRevenue;
    const periodOrders = rawData.totalOrders;
    const periodUsers = rawData.totalUsers;
    const aov = periodOrders > 0 ? Math.round(periodRevenue / periodOrders) : 0;

    return { 
      revenue: periodRevenue, 
      orders: periodOrders, 
      users: periodUsers, 
      aov 
    };
  }, [rawData]);

  const rangeLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    'all': 'All Time'
  };

  // ✅ UPGRADED TOP 10 LOGIC
  // We sort by revenue ASCENDING so Recharts displays the HIGHEST at the TOP.
  const topTenDisplayData = useMemo(() => {
    if (!rawData.topProducts || rawData.topProducts.length === 0) return [];
    
    return [...rawData.topProducts]
      .sort((a, b) => a.sales - b.sales) // Sort Lowest to Highest
      .slice(-10); // Take the 10 highest (the largest is now at the last index)
  }, [rawData.topProducts]);

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4 p-6 bg-slate-50">
        <div className="bg-red-50 p-4 rounded-full border border-red-100">
           <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <div className="text-center">
            <h3 className="text-lg font-bold text-slate-800">Connection Error</h3>
            <p className="text-slate-500 text-sm mt-1">{error}</p>
        </div>
        <button 
            onClick={fetchAnalytics} 
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl shadow-sm hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2"
        >
          <RefreshCw size={16} /> Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-emerald-600" />
              Business Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Performance metrics for: <span className="text-slate-700 font-semibold">{rangeLabels[timeRange]}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Calendar size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 pl-10 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl cursor-pointer shadow-sm hover:border-emerald-300 transition-all"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="all">All Time</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
            </div>

            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Clock size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
                <select 
                  value={interval}
                  onChange={(e) => setInterval(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 pl-10 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl cursor-pointer shadow-sm hover:border-emerald-300 transition-all"
                >
                  {availableIntervals.includes('day') && <option value="day">Daily</option>}
                  {availableIntervals.includes('week') && <option value="week">Weekly</option>}
                  {availableIntervals.includes('month') && <option value="month">Monthly</option>}
                  {availableIntervals.includes('year') && <option value="year">Yearly</option>}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
            </div>
            
            <button 
                onClick={fetchAnalytics} 
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-300 shadow-sm transition-all active:scale-95"
                title="Refresh Data"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(stats.revenue)} 
            icon={DollarSign} 
            bgClass="bg-emerald-100"
            colorClass="text-emerald-600"
            loading={loading}
            subtext={`Gross sales for selected period`}
          />
          <StatCard 
            title="Total Orders" 
            value={formatNumber(stats.orders)} 
            icon={ShoppingCart} 
            bgClass="bg-blue-100"
            colorClass="text-blue-600"
            loading={loading}
            subtext={`Completed transactions`}
          />
          <StatCard 
            title="Avg. Order Value" 
            value={formatCurrency(stats.aov)} 
            icon={TrendingUp} 
            bgClass="bg-purple-100"
            colorClass="text-purple-600"
            loading={loading}
            subtext={`Revenue per order`}
          />
          <StatCard 
            title="Active Users" 
            value={formatNumber(stats.users)} 
            icon={UsersIcon} 
            bgClass="bg-amber-100"
            colorClass="text-amber-600"
            loading={loading}
            subtext="Registered customers"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[450px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Trends</h3>
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rawData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `₹${val.toLocaleString('en-IN', { notation: 'compact' })}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px' }} formatter={(val) => [formatCurrency(val), 'Revenue']} />
                    <Line type="monotone" dataKey="sales" stroke="#059669" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[450px]">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Sales Distribution</h3>
            <div className="flex-1">
               {!loading && rawData.pieChartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={rawData.pieChartData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                       {rawData.pieChartData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip formatter={(val) => formatCurrency(val)} />
                     <Legend verticalAlign="bottom" iconType="circle" />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-400">Loading distribution...</div>
               )}
            </div>
          </div>
        </div>

        {/* Top Products - Fixed Sorting & Range Persistence */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-[550px] flex flex-col">
           <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Package size={20} className="text-purple-500" />
                    Top 10 Products by Revenue
                </h3>
                <p className="text-sm text-slate-500 font-medium">Largest revenue generators for {rangeLabels[timeRange]}</p>
           </div>
           
           <div className="flex-1 min-h-0 w-full">
             {!loading && topTenDisplayData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%" key={timeRange}>
                 <BarChart 
                    data={topTenDisplayData} 
                    layout="vertical" 
                    margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                 >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={160} 
                      tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                       cursor={{ fill: '#f8fafc' }}
                       contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                       formatter={(value) => [formatCurrency(value), 'Total Revenue']}
                    />
                    <Bar dataKey="sales" radius={[0, 6, 6, 0]} barSize={28}>
                         {topTenDisplayData.map((entry, index) => {
                             // Recharts draws bottom-to-top, so the highest index is the top bar.
                             const isTopThree = index >= topTenDisplayData.length - 3;
                             return (
                               <Cell 
                                  key={`cell-${index}`} 
                                  fill={isTopThree ? '#059669' : '#cbd5e1'} 
                               />
                             );
                         })}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                   <Loader2 className="animate-spin h-8 w-8 text-emerald-600" />
                   <p className="text-sm font-medium">Calculating ranked performance...</p>
                </div>
             )}
           </div>
        </div>
    </div>
  );
}