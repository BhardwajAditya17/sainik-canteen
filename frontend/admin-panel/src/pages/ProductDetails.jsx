//not being used right now
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Package,
    Tag,
    BarChart3,
    Clock,
    ShieldCheck,
    AlertCircle,
    ChevronRight,
    Image as ImageIcon,
    Eye,
    EyeOff,
    Loader2
} from "lucide-react";

export default function ProductDetails() {
    const { id } = useParams(); // This is the _id from the URL
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    // Optimized fetch with useCallback to prevent unnecessary re-renders
    const fetchProductDetails = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
        } catch (err) {
            console.error("Error fetching product:", err);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const handleToggleStatus = async () => {
        if (!product) return;
        try {
            const newStatus = !product.isActive;
            // Using ID from params to ensure we hit the right endpoint
            await api.patch(`/products/${id}`, { isActive: newStatus });
            setProduct(prev => ({ ...prev, isActive: newStatus }));
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
        
        setIsDeleting(true);
        try {
            await api.delete(`/products/${id}`);
            navigate("/admin/products"); // Redirects back to the admin list
        } catch (err) {
            alert("Failed to delete product");
            setIsDeleting(false);
        }
    };

    const getStockStatus = (stock) => {
        const qty = parseInt(stock) || 0;
        if (qty === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <AlertCircle size={16}/> };
        if (qty < 5) return { label: 'Low Stock Warning', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <AlertCircle size={16}/> };
        return { label: 'Healthy Stock', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <ShieldCheck size={16}/> };
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                <p className="text-slate-500 font-medium">Syncing product data...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-20 text-center bg-slate-50 min-h-screen">
                <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
                <h2 className="text-xl font-bold text-slate-800">Product not found</h2>
                <p className="text-slate-500 mb-6">The item may have been deleted or the ID is invalid.</p>
                <Link to="/admin/products" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-md">
                    Return to Inventory
                </Link>
            </div>
        );
    }

    const status = getStockStatus(product.stock);
    const discountPercent = product.discountPrice && product.price
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
        : 0;

    return (
        <div className="p-6 max-w-[1200px] mx-auto font-sans text-slate-900 antialiased">
            
            {/* TOP BAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/admin/products")}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <Link to="/admin/products" className="hover:text-emerald-600">Inventory</Link>
                            <ChevronRight size={12} />
                            <span className="text-emerald-600">Overview</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{product.name}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleToggleStatus}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs transition-all ${
                            product.isActive 
                            ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50' 
                            : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                        }`}
                    >
                        {product.isActive ? <><EyeOff size={16}/> Hide from Shop</> : <><Eye size={16}/> Publish to Shop</>}
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-100 hover:bg-red-50 rounded-xl font-bold text-xs transition-all"
                    >
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        Remove
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-100">
                        <Pencil size={16} />
                        Edit Specs
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* CONTENT AREA */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="aspect-video w-full bg-slate-50 flex items-center justify-center relative">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-contain p-12 mix-blend-multiply" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-300">
                                    <ImageIcon size={64} />
                                    <p className="text-sm font-bold uppercase tracking-widest">No Image</p>
                                </div>
                            )}
                            <div className="absolute top-6 left-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${product.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'}`}>
                                    {product.isActive ? 'Status: Active' : 'Status: Hidden'}
                                </span>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={16} className="text-emerald-600" /> Product Summary
                            </h3>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {product.description || "The supplier has not provided a description for this item yet."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Category", value: product.category, icon: <Tag size={16}/> },
                            { label: "Brand", value: product.brand || "Generic", icon: <BarChart3 size={16}/> },
                            { label: "SKU", value: product.sku || "N/A", icon: <Package size={16}/> },
                            { label: "Updated", value: "Recent", icon: <Clock size={16}/> }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="text-emerald-600 mb-3">{item.icon}</div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                <p className="font-bold text-slate-800 truncate">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SIDEBAR AREA */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Price Points</p>
                            <div className="flex items-baseline gap-3">
                                <h2 className="text-5xl font-black italic">₹{product.discountPrice || product.price}</h2>
                                {product.discountPrice && (
                                    <span className="text-slate-500 line-through text-xl font-bold">₹{product.price}</span>
                                )}
                            </div>
                            
                            {discountPercent > 0 && (
                                <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    <Tag size={12} /> {discountPercent}% OFF
                                </div>
                            )}

                            <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase">Tax Class</span>
                                    <span className="font-black">GST Exempt</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-bold uppercase">Markup</span>
                                    <span className="font-black text-emerald-400">Fixed Margin</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-[2rem] border-2 p-7 ${status.bg} ${status.border}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`font-black text-xs uppercase tracking-widest flex items-center gap-2 ${status.color}`}>
                                {status.icon} Stock Level
                            </h3>
                            <span className={`text-xs font-black px-3 py-1 rounded-lg border-2 ${status.border} ${status.color}`}>
                                {product.stock} QTY
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${parseInt(product.stock) > 5 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min((parseInt(product.stock) / 50) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-500 font-bold leading-relaxed italic">
                                Inventory status is currently {status.label.toLowerCase()}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}