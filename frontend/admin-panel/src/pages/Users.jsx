import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from "../api/axios"; 
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, Search, Download, Plus, Mail, Phone, Calendar, 
  Eye, Shield, X, Loader2, Filter, MapPin 
} from 'lucide-react';

// ✅ PERFORMANCE: Memoized Table to prevent unnecessary re-renders during searching
const UserTable = React.memo(({ data, title, icon: Icon, colorClass, badgeColor, onView }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${badgeColor}`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
      </div>
      <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
      <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{data.length}</span>
    </div>
    
    {data.length === 0 ? (
      <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-slate-50 p-4 rounded-full mb-3 border border-slate-100">
               <Icon className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-500 text-sm font-medium">No {title.toLowerCase()} found.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Contact & Location</th>
              <th className="px-6 py-4">Date Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((user) => (
              <tr key={user.id || user._id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                          {user.role === 'admin' ? <Shield size={10} /> : <UsersIcon size={10} />}
                          {user.role}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        <span className={!user.email ? "italic text-slate-400" : ""}>{user.email || "No email"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-900 font-bold">
                        <Phone size={14} className="text-emerald-600" />
                        {user.phone || "No phone added"}
                      </div>
                      {(user.city || user.state) && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                              <MapPin size={12} className="text-slate-400" />
                              {user.city}, {user.state}
                          </div>
                      )}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={14} className="text-slate-300" />
                      {new Date(user.createdAt).toLocaleDateString()}
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {/* ✅ UI FIX: Removed text, kept only the Eye icon */}
                  <button 
                      onClick={() => onView(user.id || user._id)} 
                      className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title="View Profile"
                  >
                    <Eye size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
));

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "", role: "customer",
    address: "", city: "", state: "", pincode: ""
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      const userList = data.users || (Array.isArray(data) ? data : []);
      setUsers(userList);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", formData);
      if (data.user) {
        setUsers(prev => [data.user, ...prev]);
        setShowModal(false);
        setFormData({ 
            name: "", email: "", phone: "", password: "", role: "customer",
            address: "", city: "", state: "", pincode: "" 
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ PERFORMANCE: Memoize filtering logic to keep search bar snappy
  const filteredGroups = useMemo(() => {
    const filtered = users.filter(user => 
      (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.phone || "").includes(searchTerm) ||
      (user.city?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return {
      admins: filtered.filter(u => u.role === 'admin'),
      customers: filtered.filter(u => u.role !== 'admin'),
      total: filtered.length
    };
  }, [users, searchTerm]);

  // ✅ NAVIGATION FIX: Using absolute path to fix 404
  const handleViewProfile = useCallback((id) => {
    navigate(`/users/${id}`);
  }, [navigate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UsersIcon className="h-7 w-7 text-emerald-600" /> Users Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage administrators and customers directory.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium flex items-center gap-2 shadow-sm text-sm">
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm active:scale-95 text-sm transition-all"
          >
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search name, email, phone or city..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Filter size={16} />
            <span>Showing {filteredGroups.total} total results</span>
         </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-emerald-600 h-8 w-8" /></div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredGroups.admins.length > 0 && (
            <UserTable 
                data={filteredGroups.admins} 
                title="Administrators" 
                icon={Shield} 
                colorClass="text-purple-600" 
                badgeColor="bg-purple-50" 
                onView={handleViewProfile}
            />
          )}
          <UserTable 
              data={filteredGroups.customers} 
              title="Customers" 
              icon={UsersIcon} 
              colorClass="text-emerald-600" 
              badgeColor="bg-emerald-50" 
              onView={handleViewProfile}
          />
        </div>
      )}

      {/* ✅ ADD USER MODAL WITH ADDRESS FIELDS (STILL INTACT) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 border border-slate-100">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-slate-800">Create New Account</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Shield size={14} /> Account Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Full Name *</label>
                        <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Phone Number *</label>
                        <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Email (Optional)</label>
                        <input type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Password *</label>
                        <input required type="password" placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Account Role</label>
                        <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="customer">Customer</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </div>
              </div>

              {/* Section 2: Address (Optional) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MapPin size={14} /> Address Details (Optional)
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Street Address</label>
                        <input type="text" placeholder="Building, Street, Area" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">City</label>
                            <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">State</label>
                            <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Pincode</label>
                            <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                        </div>
                    </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold flex justify-center items-center gap-2 shadow-sm transition-all active:scale-95">
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;