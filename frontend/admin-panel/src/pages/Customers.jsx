import React, { useState, useEffect } from 'react';
import api from "../api/axios"; 
import { Users, Search, Download, Plus, Mail, Calendar, Trash2, Shield, X, Loader2, Filter } from 'lucide-react';

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "customer"
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

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/users", formData);
      if (data.success && data.user) {
        setUsers([data.user, ...users]);
        setShowModal(false);
        setFormData({ name: "", email: "", password: "", role: "customer" });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const admins = filteredUsers.filter(u => u.role === 'admin');
  const customers = filteredUsers.filter(u => u.role !== 'admin');

  // Reusable Table Component
  const UserTable = ({ data, title, icon: Icon, colorClass, badgeColor }) => (
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
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Date Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 capitalize flex items-center gap-1 mt-0.5">
                            {user.role === 'admin' ? <Shield size={10} /> : <Users size={10} />}
                            {user.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-emerald-600 transition-colors">
                      <Mail size={14} className="text-slate-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} className="text-slate-300" />
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => handleDelete(user.id)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-7 w-7 text-emerald-600" /> Users & Customers
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage system administrators, store customers, and permissions.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium flex items-center gap-2 transition-colors shadow-sm text-sm">
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm shadow-emerald-200 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} strokeWidth={2.5} /> Add User
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400 text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 w-full md:w-auto text-sm text-slate-500 font-medium">
            <Filter size={16} />
            <span>Showing {filteredUsers.length} results</span>
         </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-200 border-dashed">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-emerald-600 h-8 w-8" />
                <p className="text-slate-500 font-medium">Loading user directory...</p>
            </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Admin Table */}
          {admins.length > 0 && (
            <UserTable 
              data={admins} 
              title="Administrators" 
              icon={Shield} 
              colorClass="text-purple-600" 
              badgeColor="bg-purple-50 border border-purple-100"
            />
          )}

          {/* Customer Table */}
          <UserTable 
            data={customers} 
            title="Customers" 
            icon={Users} 
            colorClass="text-emerald-600" 
            badgeColor="bg-emerald-50 border border-emerald-100"
          />
        </div>
      )}

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
              <div>
                  <h2 className="text-xl font-bold text-slate-800">Add New User</h2>
                  <p className="text-xs text-slate-500 mt-1">Create a new account for admin or customer.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="John Doe"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input 
                    required 
                    type="email" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="john@example.com"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <input 
                    required 
                    type="password" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                <div className="relative">
                    <select 
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer text-slate-700"
                        value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Shield size={16} />
                    </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-70 flex justify-center items-center gap-2 font-semibold shadow-sm shadow-emerald-200 transition-all active:scale-95"
                >
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

export default Customers;