import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import {
    Plus,
    Pencil,
    X,
    Search,
    Loader2,
    Package,
    Image as ImageIcon,
    ChevronDown,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Star
} from "lucide-react";

const CATEGORIES = [
    "Electronics", "Grocery", "Stationery", "Fashion", 
    "Home & Living", "Personal Care", "Toys", 
    "Health and Fitness", "Sports"
];

export default function Products() {
    // --- State Management ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10;

    const [editingProduct, setEditingProduct] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: "", brand: "", category: "", price: "", 
        discountPrice: "", stock: "", description: "", sku: "",
        isFeatured: false
    });

    // --- Search Debouncing ---
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // --- API Fetch Logic ---
    const fetchProducts = useCallback(async (pageNum, categoryName, isNewRequest = false, searchQ = "") => {
        if (isNewRequest) {
            setLoading(true);
            setPage(1); 
        } else {
            setLoadingMore(true);
        }

        try {
            const catParam = categoryName === "All" ? "" : `&category=${encodeURIComponent(categoryName)}`;
            const searchParam = searchQ ? `&search=${encodeURIComponent(searchQ)}` : "";
            
            const { data } = await api.get(`/products?page=${pageNum}&limit=${ITEMS_PER_PAGE}${catParam}${searchParam}`);

            const items = data.items || [];
            setProducts(prev => isNewRequest ? items : [...prev, ...items]);
            setHasMore(data.hasMore ?? items.length === ITEMS_PER_PAGE);
        } catch (err) {
            console.error("Fetch error", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(1, selectedCategory, true, debouncedSearchTerm);
    }, [selectedCategory, debouncedSearchTerm, fetchProducts]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage, selectedCategory, false, debouncedSearchTerm);
    };

    // --- CRUD Handlers ---
    const handleDelete = async (id) => {
        if (!id) return;
        if (window.confirm("ARE YOU SURE? This will permanently delete the product from the database.")) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(prev => prev.filter(p => (p._id !== id && p.id !== id)));
            } catch (err) {
                alert("Failed to delete product. It might be linked to an existing order.");
            }
        }
    };

    const handleToggleStatus = async (product) => {
        const id = product?._id || product?.id;
        if (!id) return;
        const newStatus = !product.isActive;
        try {
            await api.put(`/products/${id}`, { isActive: newStatus });
            setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, isActive: newStatus } : p));
        } catch (err) {
            alert("Failed to update visibility");
        }
    };

    const handleToggleFeatured = async (product) => {
        const id = product?._id || product?.id;
        if (!id) return;
        const newFeatured = !product.isFeatured;
        try {
            await api.put(`/products/${id}`, { isFeatured: newFeatured });
            setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, isFeatured: newFeatured } : p));
        } catch (err) {
            alert("Failed to update featured status");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const productId = editingProduct?._id || editingProduct?.id;
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'isFeatured') {
                data.append(key, formData[key]); 
            } else if (formData[key] !== "" && formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        if (imageFile) data.append("image", imageFile);

        try {
            if (productId) {
                await api.put(`/products/${productId}`, data);
            } else {
                await api.post("/products", data);
            }
            fetchProducts(1, selectedCategory, true, debouncedSearchTerm);
            closeModal();
        } catch (err) {
            alert("Error saving product. Ensure SKU is unique and all fields are valid.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setImagePreview(product.image || null);
        setFormData({
            name: product.name || "",
            brand: product.brand || "",
            category: product.category || "",
            price: product.price || "",
            discountPrice: product.discountPrice || "",
            stock: product.stock || "",
            description: product.description || "",
            sku: product.sku || "",
            isFeatured: product.isFeatured || false
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setImageFile(null);
        setImagePreview(null);
        setFormData({ name: "", brand: "", category: "", price: "", discountPrice: "", stock: "", description: "", sku: "", isFeatured: false });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto font-sans text-slate-900 antialiased">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Package className="text-emerald-600" size={24} /> Products Management
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md active:scale-95 transition-all"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, SKU, or database ID..."
                        className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none text-sm focus:ring-2 focus:ring-emerald-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2.5 border rounded-xl text-sm bg-white outline-none min-w-[180px]"
                >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex flex-col items-center gap-3 text-emerald-600"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Item Details</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-center">Featured</th>
                                    <th className="px-6 py-4">Visibility</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.length > 0 ? products.map((p) => {
                                    const id = p?._id || p?.id;
                                    return (
                                        <tr key={id || Math.random()} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded border bg-slate-50 overflow-hidden flex-shrink-0">
                                                        {p?.image ? <img src={p.image} className="h-full w-full object-cover" /> : <ImageIcon className="m-auto text-slate-200" size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{p?.name || "Unnamed"}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">ID: {id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold">₹{p?.discountPrice || p?.price || 0}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p?.stock > 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                     {p?.stock || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleToggleFeatured(p)} className={`p-2 rounded-lg transition-colors ${p?.isFeatured ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300'}`}>
                                                    <Star size={18} fill={p?.isFeatured ? "currentColor" : "none"} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => handleToggleStatus(p)} className="flex items-center gap-2">
                                                    {p?.isActive ? <ToggleRight className="text-emerald-600" /> : <ToggleLeft className="text-slate-300" />}
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">{p?.isActive ? 'Public' : 'Hidden'}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={18} /></button>
                                                    <button onClick={() => handleDelete(id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan="6" className="p-10 text-center text-slate-400">No products found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* LOAD MORE */}
            {hasMore && !loading && (
                <div className="mt-8 flex justify-center">
                    <button onClick={handleLoadMore} disabled={loadingMore} className="px-8 py-3 bg-white border rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 disabled:opacity-50">
                        {loadingMore ? <Loader2 className="animate-spin" size={18} /> : "Load More"}
                        {!loadingMore && <ChevronDown size={18} />}
                    </button>
                </div>
            )}

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                            <h2 className="font-bold">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:bg-white p-1 rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border-2 border-dashed">
                                <div className="h-16 w-16 bg-white border rounded flex items-center justify-center overflow-hidden">
                                    {imagePreview ? <img src={imagePreview} className="h-full w-full object-cover" /> : <ImageIcon className="text-slate-200" />}
                                </div>
                                <label className="cursor-pointer text-sm font-bold text-emerald-600 hover:underline">
                                    Upload Image
                                    <input type="file" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                            <input placeholder="Product Name" className="w-full p-3 bg-slate-50 border rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="Brand" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                                <input placeholder="SKU" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <input type="number" placeholder="MRP" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                                <input type="number" placeholder="Offer" className="w-full p-3 bg-amber-50 border border-amber-100 rounded-xl" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} />
                                <input type="number" placeholder="Stock" className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                            </div>
                            <select className="w-full p-3 bg-slate-50 border rounded-xl" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                <option value="" disabled>Select Category</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <textarea placeholder="Description" className="w-full p-3 bg-slate-50 border rounded-xl h-24 outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-700">Featured Product</span>
                                    <span className="text-[10px] text-slate-500">Highlight this item on home page</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isFeatured ? 'bg-emerald-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg">
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : (editingProduct ? 'Save Changes' : 'Create Product')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}