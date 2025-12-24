import React, { useState, useEffect } from "react";
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
    Filter
} from "lucide-react";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [editingProduct, setEditingProduct] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: "", category: "", price: "", stock: "", description: ""
    });

    // 1. Fetch Products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/products");

            if (data.items && Array.isArray(data.items)) {
                setProducts(data.items);
            } else if (Array.isArray(data)) {
                setProducts(data);
            } else if (data.products && Array.isArray(data.products)) {
                setProducts(data.products);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error("Failed to load products", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Image Selection & Preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // 3. Handle Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("category", formData.category);
        data.append("price", formData.price);
        data.append("stock", formData.stock);
        data.append("description", formData.description);

        if (imageFile) {
            data.append("image", imageFile);
        }

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, data);
            } else {
                await api.post("/products", data);
            }
            await fetchProducts();
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Failed to save product. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 4. Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Failed to delete product");
        }
    };

    const openEdit = (product) => {
        setEditingProduct(product);
        setImageFile(null);
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

    // Filter products
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stock Badge Helper
    const getStockStatus = (stock) => {
        const qty = parseInt(stock);
        if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-100' };
        if (qty < 10) return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-100' };
        return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-slate-500 text-sm font-medium">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto font-sans text-slate-900 antialiased">

            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                        <Package className="text-emerald-600" strokeWidth={2.5} /> Products
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Manage your store inventory and pricing</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow-md font-semibold text-sm active:scale-95"
                >
                    <Plus size={18} strokeWidth={2.5} /> Add New Product
                </button>
            </div>

            {/* FILTERS & SEARCH */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, category..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50 focus:bg-white text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors">
                        <Filter size={16} /> Filters
                    </button>
                </div>
            </div>

            {/* PRODUCTS TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredProducts.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center">
                        <div className="bg-slate-50 p-5 rounded-full mb-4 border border-slate-100">
                            <Package className="h-10 w-10 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                        <p className="text-slate-500 max-w-sm mt-1 text-sm">
                            Try adjusting your search terms or add a new product to your inventory.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((p) => {
                                    const status = getStockStatus(p.stock);
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {p.image ? (
                                                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <ImageIcon size={20} className="text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {p.id.toString().slice(0, 6)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-700 text-sm">₹{p.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60`}></span>
                                                    {status.label} <span className="ml-1 opacity-75 font-normal">({p.stock})</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-slate-100">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingProduct ? "Edit Product" : "New Product"}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">Fill in the details below to update inventory.</p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Image Upload Area */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Image</label>
                                <div className="flex items-center gap-5">
                                    {/* Preview Circle */}
                                    <div className="h-24 w-24 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-slate-300" size={28} />
                                        )}
                                    </div>
                                    {/* Upload Input */}
                                    <div className="flex-1">
                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400 transition-all group">
                                            <div className="flex flex-col items-center justify-center">
                                                <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 mb-1.5 transition-colors" />
                                                <p className="text-xs font-medium text-slate-600">Click to upload image</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="e.g., Organic Bananas"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                            <input
                                                type="number"
                                                className="w-full pl-7 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                                                placeholder="0.00"
                                                value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Quantity</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                                            placeholder="0"
                                            value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all appearance-none text-slate-700"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select a category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Grocery">Grocery</option>
                                            <option value="Stationery">Stationery</option>
                                            <option value="Fashion">Fashion</option>
                                            <option value="Home & Living">Home & Living</option>
                                            <option value="Personal Care">Personal Care</option>
                                            <option value="Toys">Toys</option>
                                            <option value="Health and Fitness">Health and Fitness</option>
                                            <option value="Sports">Sports</option>
                                        </select>
                                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                                    <textarea
                                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all h-24 resize-none placeholder:text-slate-400"
                                        placeholder="Enter product details..."
                                        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold transition-all shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin h-4 w-4" /> Saving...
                                        </>
                                    ) : (
                                        editingProduct ? "Update Product" : "Create Product"
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}