import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { CartContext } from "../context/CartContext";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Share2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Tag
} from "lucide-react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching product", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    if (!product.isActive || product.stock <= 0) return;
    
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      // You could replace this alert with a nice Toast notification later
      alert(`${quantity} ${product.name} added to cart!`);
    } catch (error) {
      alert("Failed to add item to cart.");
    } finally {
      setAdding(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} on our canteen!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading details...</p>
      </div>
    </div>
  );

  if (!product || !product.isActive) return (
    <div className="text-center py-20 px-4">
      <div className="bg-slate-50 inline-flex p-6 rounded-full mb-6">
        <ShoppingCart size={48} className="text-slate-300" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">Product Unavailable</h2>
      <p className="text-slate-500 mt-2">This item has been removed or is no longer active.</p>
      <button 
        onClick={() => navigate('/products')} 
        className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100"
      >
        Browse Other Products
      </button>
    </div>
  );

  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const finalPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-slate-600 hover:text-emerald-600 font-semibold transition-colors gap-2"
          >
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Back to Shop</span>
          </button>
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-all"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: IMAGE SECTION (Col-7) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 rounded-3xl p-8 md:p-12 flex items-center justify-center sticky top-24 border border-slate-100 overflow-hidden">
                {hasDiscount && (
                    <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest shadow-lg z-10">
                        Save ₹{Number(product.price) - Number(product.discountPrice)}
                    </div>
                )}
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="max-h-[500px] w-auto object-contain mix-blend-multiply transition-transform duration-700 hover:scale-110" 
                />
            </div>
          </div>

          {/* RIGHT: INFO SECTION (Col-5) */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Header Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-[10px] font-black tracking-[0.2em] text-emerald-700 uppercase bg-emerald-50 border border-emerald-100 rounded-lg">
                  {product.category}
                </span>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                  {product.brand || "Generic"}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-4">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-4xl font-black text-emerald-600">₹{finalPrice}</span>
                {hasDiscount && (
                  <span className="text-xl text-slate-300 line-through decoration-red-400/40">₹{product.price}</span>
                )}
              </div>

              <p className="text-slate-500 text-lg leading-relaxed">
                {product.description || "Everyday essentials curated specifically for our canteen customers."}
              </p>
            </div>

            {/* Inventory Status */}
            <div className="flex items-center gap-2 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <div className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
               <span className="text-sm font-bold text-slate-700">
                  {product.stock > 0 ? `In Stock (${product.stock} units available)` : "Out of Stock"}
               </span>
               <span className="ml-auto text-[10px] font-mono text-slate-400 uppercase">SKU: {product.sku || 'N/A'}</span>
            </div>

            {/* Quantity and Actions */}
            {product.stock > 0 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                    Quantity
                  </label>
                  <div className="flex items-center w-36 bg-white border-2 border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="p-4 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number"
                      readOnly
                      value={quantity}
                      className="w-full text-center font-black text-slate-900 bg-transparent outline-none text-lg"
                    />
                    <button 
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="p-4 hover:bg-slate-50 text-slate-600 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAddToCart} 
                  disabled={adding || product.stock <= 0}
                  className={`w-full flex items-center justify-center gap-3 py-5 text-xl font-black rounded-2xl text-white shadow-2xl transition-all transform active:scale-95
                    ${adding || product.stock <= 0 
                      ? "bg-slate-300 cursor-not-allowed shadow-none" 
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                    }`}
                >
                  {adding ? "Adding to Cart..." : <><ShoppingCart size={24} /> Add to Cart</>}
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-slate-100">
                <div className="text-center">
                    <div className="bg-emerald-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <ShieldCheck className="text-emerald-600" size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Secure Payment</p>
                </div>
                <div className="text-center">
                    <div className="bg-emerald-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Truck className="text-emerald-600" size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Fast Pickup</p>
                </div>
                <div className="text-center">
                    <div className="bg-emerald-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <RotateCcw className="text-emerald-600" size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Easy Returns</p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;