import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { 
  Trash2, Plus, Minus, ArrowRight, 
  ShoppingCart, ArrowLeft, Loader2, Package 
} from "lucide-react";

const Cart = () => {
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart(); 
  const navigate = useNavigate();
  
  const [updatingId, setUpdatingId] = useState(null);

  const items = Array.isArray(cart) ? cart : [];
  
  const calculateItemTotal = (item) => {
    const price = Number(item.product?.price) || 0;
    const qty = Number(item.quantity) || 0;
    return price * qty;
  };

  const finalTotal = total || items.reduce((acc, item) => acc + calculateItemTotal(item), 0);

  const handleProceed = () => {
    if (items.length === 0) return;
    navigate("/checkout");
  };

  const handleQuantityChange = async (item, newQty) => {
    if (newQty < 1) return;
    const targetId = item.id || item._id || item.product?.id; 
    if (!targetId) return;

    try {
      setUpdatingId(targetId); 
      await updateQuantity(targetId, newQty);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item) => {
    const targetId = item.id || item._id || item.product?.id;
    if (!targetId) return;

    try {
      setUpdatingId(targetId);
      await removeFromCart(targetId);
    } catch (error) {
      console.error("Remove failed:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-emerald-50 p-6 rounded-full mb-6 animate-bounce-slow">
          <ShoppingCart size={64} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. 
        </p>
        <Link 
          to="/products" 
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center gap-2"
        >
          Start Shopping <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          Shopping Cart 
          <span className="text-lg font-normal text-gray-500">({items.length} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: ITEMS --- */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((it) => {
              const key = it.id || it.product?.id || Math.random();
              const isLoading = updatingId === (it.product?.id || it.id);
              const itemPrice = Number(it.product?.price) || 0;

              return (
                <div key={key} className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 transition-transform hover:shadow-md">
                  
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                      <Loader2 className="animate-spin text-emerald-600" />
                    </div>
                  )}

                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                    {it.product?.imageUrl || it.product?.image ? (
                      <img 
                        src={it.product.imageUrl || it.product.image} 
                        alt={it.product.name} 
                        className="w-full h-full object-contain mix-blend-multiply" 
                      />
                    ) : (
                      <Package size={32} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg text-gray-800">{it.product?.name || "Unknown Product"}</h3>
                    <p className="text-sm text-gray-500 mb-2">{it.product?.category || "General"}</p>
                    <p className="text-emerald-600 font-bold text-lg">₹{itemPrice.toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-4">
                    
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                      <button 
                        type="button" 
                        disabled={isLoading}
                        onClick={() => handleQuantityChange(it, it.quantity - 1)}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-lg transition disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="w-10 text-center font-semibold text-gray-800">
                        {it.quantity}
                      </span>
                      
                      <button 
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleQuantityChange(it, it.quantity + 1)}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-lg transition disabled:opacity-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button 
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleRemove(it)} 
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center mt-6 pt-4">
               <Link to="/products" className="text-gray-600 hover:text-emerald-700 font-medium flex items-center gap-2">
                  <ArrowLeft size={18} /> Continue Shopping
               </Link>
               <button 
                  type="button"
                  onClick={() => { if(window.confirm('Are you sure you want to clear your cart?')) clearCart(); }} 
                  className="text-red-600 hover:text-red-800 text-sm font-semibold underline"
                >
                  Clear Cart
               </button>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SUMMARY --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-xl text-gray-800 mb-6 pb-4 border-b">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {items.map((it) => (
                  <div key={it.id || Math.random()} className="flex justify-between text-sm text-gray-600">
                    <span className="truncate max-w-[150px]">{it.product?.name} (x{it.quantity})</span>
                    <span className="font-medium text-gray-900">₹{calculateItemTotal(it).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800 text-lg">Total Amount</span>
                  <span className="font-extrabold text-2xl text-emerald-700">₹{Number(finalTotal).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">Inclusive of all taxes</p>
              </div>

              <button 
                type="button"
                onClick={handleProceed} 
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-500/30 flex justify-center items-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;
