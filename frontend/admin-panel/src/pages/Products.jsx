import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
    Upload,
    Loader2,
    Package,
    Image as ImageIcon,
    ChevronDown,
    LayoutGrid
} from "lucide-react";

const CATEGORIES = [
    "Electronics", "Grocery", "Stationery", "Fashion", 
    "Home & Living", "Personal Care", "Toys", 
    "Health and Fitness", "Sports"
];

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

    // Form State
    const [editingProduct, setEditingProduct] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: "", category: "", price: "", stock: "", description: ""
    });

    // 1. Paginated Fetch Function
    const fetchProducts = useCallback(async (pageNum, categoryName, isNewRequest = false) => {
        if (isNewRequest) setLoading(true);
        else setLoadingMore(true);

        try {
            const catParam = categoryName === "All" ? "" : `&category=${encodeURIComponent(categoryName)}`;
            const { data } = await api.get(`/products?page=${pageNum}&limit=${ITEMS_PER_PAGE}${catParam}`);

            const items = data.items || data || [];
            
            if (Array.isArray(items)) {
                setProducts(prev => isNewRequest ? items : [...prev, ...items]);
                setHasMore(items.length === ITEMS_PER_PAGE);
            }
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // Effect: Triggered when category changes
    useEffect(() => {
        setPage(1);
        fetchProducts(1, selectedCategory, true);
    }, [selectedCategory, fetchProducts]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, selectedCategory, false);
    };

    // 2. CRUD Handlers
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) data.append("image", imageFile);

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, data);
            } else {
                await api.post("/products", data);
            }
            // Reset to page 1 of current category to show the new/updated item
            setPage(1);
            fetchProducts(1, selectedCategory, true);
            closeModal();
        } catch (err) {
            alert("Failed to save product.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Delete failed");
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setImagePreview(product.image);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            description: product.description || ""
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setImageFile(null);
        setImagePreview(null);
        setFormData({ name: "", category: "", price: "", stock: "", description: "" });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockStatus = (stock) => {
        const qty = parseInt(stock);
        if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-100' };
        if (qty < 2) return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-100' };
        return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto font-sans text-slate-900 antialiased">
            
            {/* ADMIN HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                        <Package className="text-emerald-600" size={24} /> Inventory Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage stocks across {CATEGORIES.length} categories</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md font-semibold text-sm active:scale-95"
                >
                    <Plus size={18} strokeWidth={2.5} /> Add Product
                </button>
            </div>

            {/* SEARCH & CATEGORY SELECT */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Filter loaded items by name..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full md:w-64 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer appearance-none shadow-sm"
                    style={{
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em'
                    }}
                >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {/* TABLE AREA */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                        <p className="text-slate-400 text-sm">Synchronizing inventory...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <Package className="h-12 w-12 text-slate-200 mb-4" />
                        <h3 className="text-lg font-semibold">No products found</h3>
                        <p className="text-slate-500 text-sm">Try changing the category or search term.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Product Details</th>
                                    <th className="px-6 py-4 font-bold">Category</th>
                                    <th className="px-6 py-4 font-bold">Price</th>
                                    <th className="px-6 py-4 font-bold">Stock Status</th>
                                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((p) => {
                                    const status = getStockStatus(p.stock);
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 border overflow-hidden flex-shrink-0">
                                                        {p.image ? <img src={p.image} className="h-full w-full object-cover" /> : <ImageIcon className="m-auto mt-2 text-slate-300" size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">UID: {p.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-sm text-slate-700">₹{p.price}</td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.color}`}>
                                                    {status.label} ({p.stock})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Pencil size={17} /></button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={17} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMore && !loading && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {loadingMore ? <Loader2 className="animate-spin" size={18} /> : <>Load 10 More <ChevronDown size={18} /></>}
                    </button>
                </div>
            )}

            {/* MODAL REMAINING THE SAME WITH YOUR UPDATED CATEGORIES */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100">
                        <div className="flex justify-between items-center px-6 py-5 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold">{editingProduct ? "Update Product" : "New Entry"}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Image Section */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <div className="h-20 w-20 bg-white rounded-lg border overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {imagePreview ? <img src={imagePreview} className="h-full w-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                                </div>
                                <label className="flex-1 cursor-pointer">
                                    <span className="block text-sm font-bold text-emerald-600">Upload Media</span>
                                    <span className="text-xs text-slate-500 italic">PNG, JPG up to 5MB</span>
                                    <input type="file" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>

                            <div className="space-y-4">
                                <input
                                    placeholder="Product Name"
                                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                                />
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number" placeholder="Price (₹)"
                                        className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required
                                    />
                                    <input
                                        type="number" placeholder="Stock"
                                        className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required
                                    />
                                </div>

                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                    required
                                >
                                    <option value="" disabled>Choose Category</option>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>

                                <textarea
                                    placeholder="Description..."
                                    className="w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none h-24"
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingProduct ? "Save Changes" : "Publish Product")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}