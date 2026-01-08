import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, Percent, AlertCircle } from "lucide-react";
import { CartContext } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, cart } = useContext(CartContext);
  const [adding, setAdding] = useState(false);

  const hasValidImage = product.image && product.image.startsWith("http");
  const isOutOfStock = product.stock <= 0;
  
  // 1. Find the specific product ID (handling both MongoDB _id and standard id)
  const productId = product.id || product._id;

  // 2. Filter cart to find only the quantity of THIS specific item
  const existingCartItem = cart?.find(item => {
    const itemInCartId = item.product?.id || item.product?._id || item.id || item._id;
    return itemInCartId === productId;
  });

  const currentQtyInCart = existingCartItem ? existingCartItem.quantity : 0;
  
  // 3. Check if adding one more would exceed stock
  const isLimitReached = currentQtyInCart >= product.stock;

  // Pricing Logic
  const price = Number(product.price);
  const discountPrice = Number(product.discountPrice);
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const discountPercentage = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Safety check: Block if out of stock, currently adding, or stock limit reached for this item
    if (isOutOfStock || adding || isLimitReached) return;

    setAdding(true);
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error("Quick add failed", error);
    } finally {
      setTimeout(() => setAdding(false), 500);
    }
  };

  return (
    <Link
      to={`/products/${productId}`}
      className="group relative flex flex-col bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden h-full"
    >
      {/* IMAGE SECTION */}
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden">
        {hasValidImage ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4 md:p-6 transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <Package size={32} className="md:size-12 mb-2" />
            <span className="text-[10px] font-medium">No Image</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Sold Out
            </span>
          ) : isLimitReached ? (
            <span className="bg-orange-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1 uppercase">
               Limit Reached
            </span>
          ) : hasDiscount ? (
            <span className="bg-rose-500 text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-0.5">
               {discountPercentage}<Percent size={10} strokeWidth={3} /> OFF
            </span>
          ) : null}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] md:text-[10px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded">
            {product.brand || "Original"}
          </span>
          <span className="text-[9px] md:text-[10px] text-slate-400 font-medium uppercase truncate">
            {product.category}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-sm md:text-base leading-tight mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-slate-500 text-[10px] md:text-xs leading-relaxed mb-3 line-clamp-2 italic">
            {product.description}
          </p>
        )}

        {/* Price & Action Container */}
        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] md:text-xs text-slate-400 line-through decoration-rose-300">
                ₹{price}
              </span>
            )}
            <span className="text-base md:text-xl font-extrabold text-slate-900">
              ₹{hasDiscount ? discountPrice : price}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || adding || isLimitReached}
            className={`flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-sm
              ${(isOutOfStock || isLimitReached)
                ? "bg-slate-100 text-slate-400 cursor-not-allowed p-2"
                : "bg-emerald-600 text-white hover:bg-emerald-700 p-2.5 md:p-3"
              }`}
          >
            {adding ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : isOutOfStock ? (
              <span className="text-[9px] font-bold px-1 uppercase">N/A</span>
            ) : isLimitReached ? (
              <AlertCircle size={18} className="md:w-5 md:h-5 text-orange-400" />
            ) : (
              <ShoppingCart size={18} className="md:w-5 md:h-5" />
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}